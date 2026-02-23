import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from './token.repository';

export interface TokenPayload {
  sub: string; // user_id
  email: string;
  role?: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private tokenRepository: TokenRepository,
  ) {}

  /**
   * Tạo refresh token mới và lưu vào database
   * @param userId - ID của user
   * @param userAgent - User agent từ request
   * @param ipAddress - IP address từ request
   * @returns Refresh token string
   */
  async createRefreshToken(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const user = await this.tokenRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Tạo token payload
    const payload: TokenPayload = {
      sub: userId,
      email: user.primary_email,
      role: user.role ?? undefined,
      type: 'refresh',
    };

    // Tạo refresh token với thời hạn 7 ngày
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });

    // Tính thời gian hết hạn
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Lưu refresh token vào database
    await this.tokenRepository.createRefreshToken({
      userId,
      token: refreshToken,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return refreshToken;
  }

  /**
   * Tạo access token từ refresh token
   * Kiểm tra refresh token trong database và tạo access token mới
   * @param refreshToken - Refresh token string
   * @returns Access token string
   */
  async createAccessTokenFromRefreshToken(
    refreshToken: string,
  ): Promise<string> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Kiểm tra refresh token trong database
      const tokenRecord = await this.tokenRepository.findRefreshToken(
        refreshToken,
        true,
      );

      if (!tokenRecord) {
        throw new UnauthorizedException('Refresh token not found');
      }

      if (tokenRecord.is_revoked) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      if (tokenRecord.expires_at < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Type cast to include users
      const tokenWithUser = tokenRecord as typeof tokenRecord & {
        users: {
          id: string;
          primary_email: string;
          role: string | null;
        };
      };

      // Tạo access token mới
      const accessPayload: TokenPayload = {
        sub: tokenRecord.user_id,
        email: tokenWithUser.users.primary_email,
        role: tokenWithUser.users.role ?? undefined,
        type: 'access',
      };

      const accessToken = this.jwtService.sign(accessPayload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '15m', // Access token có thời hạn ngắn hơn
      });

      return accessToken;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Tạo cả access token và refresh token cho user
   * @param userId - ID của user
   * @param userAgent - User agent từ request
   * @param ipAddress - IP address từ request
   * @returns TokenPair object chứa cả access và refresh token
   */
  async createTokenPair(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const user = await this.tokenRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Tạo refresh token
    const refreshToken = await this.createRefreshToken(
      userId,
      userAgent,
      ipAddress,
    );

    // Tạo access token
    const accessPayload: TokenPayload = {
      sub: userId,
      email: user.primary_email,
      role: user.role ?? undefined,
      type: 'access',
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '15m',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Validate access token
   * @param token - Access token string
   * @returns TokenPayload nếu token hợp lệ
   */
  async validateAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Kiểm tra user còn tồn tại và active
      const user = await this.tokenRepository.findUserById(payload.sub);

      if (!user || !user.is_active) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  /**
   * Validate refresh token
   * @param token - Refresh token string
   * @returns TokenPayload nếu token hợp lệ
   */
  async validateRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Kiểm tra token trong database
      const tokenRecord = await this.tokenRepository.findRefreshToken(token);

      if (!tokenRecord) {
        throw new UnauthorizedException('Refresh token not found');
      }

      if (tokenRecord.is_revoked) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      if (tokenRecord.expires_at < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Revoke refresh token (đánh dấu token không còn hiệu lực)
   * @param token - Refresh token string
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.tokenRepository.revokeRefreshToken(token);
  }

  /**
   * Revoke tất cả refresh tokens của một user
   * @param userId - ID của user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.tokenRepository.revokeAllUserTokens(userId);
  }

  /**
   * Xóa các refresh token đã hết hạn từ database
   */
  async cleanExpiredTokens(): Promise<void> {
    await this.tokenRepository.deleteExpiredTokens();
  }
}
