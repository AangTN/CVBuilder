import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AuthRepository } from './auth.repository';
import { TokenRepository } from './token.repository';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma.service';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { RefreshTokenStrategy } from '../../common/strategies/refresh-token.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), // Cấu hình động trong service
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    AuthRepository,
    TokenRepository,
    PrismaService,
    JwtStrategy,
    RefreshTokenStrategy,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
