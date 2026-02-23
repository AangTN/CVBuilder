import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { type Request, type Response } from 'express';
import type {
  AuthRequest,
  AuthenticatedUser,
} from '../../common/types/auth-request.type';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ auth: { ttl: 60_000, limit: 10 } })
  @Post('register')
  async register(
    @Body() body: { email: string; password: string; fullName?: string },
  ) {
    return this.authService.register(body.email, body.password, body.fullName);
  }

  @Public()
  @Throttle({ auth: { ttl: 60_000, limit: 10 } })
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.get('user-agent');
    const ipAddress = req.ip;
    const result = await this.authService.login(
      body.email,
      body.password,
      userAgent,
      ipAddress,
    );

    // Set refreshToken vào HTTP-only cookie
    if (result.tokens?.refreshToken) {
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    // Trả về response không bao gồm refreshToken
    return {
      user: result.user,
      tokens: {
        accessToken: result.tokens.accessToken,
      },
    };
  }

  @Public()
  @Throttle({ auth: { ttl: 60_000, limit: 10 } })
  @Post('google')
  async googleLogin(
    @Body() body: { credential: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.get('user-agent');
    const ipAddress = req.ip;

    const result = await this.authService.loginWithGoogleCredential(
      body.credential,
      userAgent,
      ipAddress,
    );

    if (result.tokens?.refreshToken) {
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return {
      user: result.user,
      tokens: {
        accessToken: result.tokens.accessToken,
      },
    };
  }

  @Public()
  @Throttle({ auth: { ttl: 60_000, limit: 20 } })
  @Post('refresh')
  async refreshToken(@Req() req: AuthRequest) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const accessToken = await this.authService.refreshAccessToken(refreshToken);
    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() _user: AuthenticatedUser,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    // Revoke refreshToken nếu có
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear cookie
    res.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }
}
