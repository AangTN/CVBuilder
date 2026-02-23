import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';
import { TokenPayload } from '../../modules/auth/token.service';
import { type Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayload) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Kiểm tra token trong database
    const tokenRecord = await this.prisma.refresh_tokens.findUnique({
      where: { token: refreshToken },
      include: { users: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (tokenRecord.is_revoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (tokenRecord.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      refreshToken,
    };
  }
}
