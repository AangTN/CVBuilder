import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Tìm user theo email
   */
  async findUserByEmail(email: string, includeAuthProviders = false) {
    if (includeAuthProviders) {
      return this.prisma.users.findUnique({
        where: { primary_email: email },
        include: {
          auth_providers: {
            where: { provider: 'local' },
          },
        },
      });
    }
    return this.prisma.users.findUnique({
      where: { primary_email: email },
    });
  }

  /**
   * Tạo user mới với local auth provider
   */
  async createUser(email: string, password: string, fullName?: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    return this.prisma.users.create({
      data: {
        primary_email: email,
        full_name: fullName,
        balance: 0,
        is_active: true,
        auth_providers: {
          create: {
            provider: 'local',
            provider_id: email,
            password_hash: passwordHash,
          },
        },
      },
    });
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Tìm auth provider theo provider + provider_id
   */
  async findAuthProvider(provider: 'google' | 'local', providerId: string) {
    return this.prisma.auth_providers.findFirst({
      where: {
        provider,
        provider_id: providerId,
      },
      include: {
        users: true,
      },
    });
  }

  /**
   * Tạo auth provider cho user có sẵn
   */
  async createAuthProviderForUser(
    userId: string,
    provider: 'google' | 'local',
    providerId: string,
  ) {
    return this.prisma.auth_providers.create({
      data: {
        user_id: userId,
        provider,
        provider_id: providerId,
      },
    });
  }

  /**
   * Tạo user mới với google provider
   */
  async createGoogleUser(data: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
    providerId: string;
  }) {
    return this.prisma.users.create({
      data: {
        primary_email: data.email,
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        balance: 0,
        is_active: true,
        auth_providers: {
          create: {
            provider: 'google',
            provider_id: data.providerId,
          },
        },
      },
    });
  }
}
