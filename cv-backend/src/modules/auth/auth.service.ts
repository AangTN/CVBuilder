import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { TokenPair, TokenService } from './token.service';
import { OAuth2Client } from 'google-auth-library';

export interface AuthUserResponse {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl?: string | null;
  balance: number | null;
  role?: string | null;
}

export interface RegisterResponse {
  user: Omit<AuthUserResponse, 'avatarUrl' | 'role'>;
}

export interface AuthTokensResponse {
  user: AuthUserResponse;
  tokens: TokenPair;
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private authRepository: AuthRepository,
    private tokenService: TokenService,
  ) {
    this.googleClient = new OAuth2Client();
  }

  /**
   * Đăng ký user mới với local provider
   * Không tạo token, user cần đăng nhập sau khi đăng ký
   */
  async register(
    email: string,
    password: string,
    fullName?: string,
  ): Promise<RegisterResponse> {
    // Kiểm tra email đã tồn tại
    const existingUser = await this.authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Tạo user mới
    const user = await this.authRepository.createUser(
      email,
      password,
      fullName,
    );

    return {
      user: {
        id: user.id,
        email: user.primary_email,
        fullName: user.full_name,
        balance: user.balance,
      },
    };
  }

  /**
   * Đăng nhập với email và password
   */
  async login(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokensResponse> {
    // Tìm user
    const user = await this.authRepository.findUserByEmail(email, true);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Type cast to include auth_providers
    const userWithAuth = user as typeof user & {
      auth_providers: Array<{
        id: string;
        provider: string;
        provider_id: string | null;
        password_hash: string | null;
      }>;
    };

    const authProvider = userWithAuth.auth_providers[0];
    if (!authProvider || !authProvider.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Kiểm tra password
    const isPasswordValid = await this.authRepository.verifyPassword(
      password,
      authProvider.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Tạo token pair
    const tokens = await this.tokenService.createTokenPair(
      user.id,
      userAgent,
      ipAddress,
    );

    return {
      user: {
        id: user.id,
        email: user.primary_email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        balance: user.balance,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Đăng nhập/đăng ký bằng Google credential (ID token từ popup)
   */
  async loginWithGoogleCredential(
    credential: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokensResponse> {
    const audience = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT;

    if (!audience) {
      throw new UnauthorizedException('Google client ID is not configured');
    }

    let payload:
      | {
          sub?: string;
          email?: string;
          email_verified?: boolean;
          name?: string;
          picture?: string;
        }
      | undefined;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google credential');
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException('Google account is not valid');
    }

    const providerId = payload.sub;
    let user = (
      await this.authRepository.findAuthProvider('google', providerId)
    )?.users;

    if (!user) {
      const existingUser = await this.authRepository.findUserByEmail(
        payload.email,
      );

      if (existingUser) {
        await this.authRepository.createAuthProviderForUser(
          existingUser.id,
          'google',
          providerId,
        );
        user = existingUser;
      } else {
        user = await this.authRepository.createGoogleUser({
          email: payload.email,
          fullName: payload.name,
          avatarUrl: payload.picture,
          providerId,
        });
      }
    }

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = await this.tokenService.createTokenPair(
      user.id,
      userAgent,
      ipAddress,
    );

    return {
      user: {
        id: user.id,
        email: user.primary_email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        balance: user.balance,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Đăng xuất - revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  /**
   * Đăng xuất user - revoke tất cả refresh tokens của user
   */
  async logoutUser(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    return await this.tokenService.createAccessTokenFromRefreshToken(
      refreshToken,
    );
  }
}
