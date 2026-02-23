import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TokenRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Tìm user theo ID
   */
  async findUserById(userId: string) {
    return this.prisma.users.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Tạo refresh token trong database
   */
  async createRefreshToken(data: {
    userId: string;
    token: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return this.prisma.refresh_tokens.create({
      data: {
        user_id: data.userId,
        token: data.token,
        expires_at: data.expiresAt,
        user_agent: data.userAgent,
        ip_address: data.ipAddress,
        is_revoked: false,
      },
    });
  }

  /**
   * Tìm refresh token theo token string
   */
  async findRefreshToken(token: string, includeUser = false) {
    if (includeUser) {
      return this.prisma.refresh_tokens.findUnique({
        where: { token },
        include: { users: true },
      });
    }
    return this.prisma.refresh_tokens.findUnique({
      where: { token },
    });
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token: string) {
    // Kiểm tra token có tồn tại không trước khi update
    const existingToken = await this.prisma.refresh_tokens.findUnique({
      where: { token },
    });

    // Nếu token không tồn tại hoặc đã bị revoke, bỏ qua
    if (!existingToken) {
      return null;
    }

    // Nếu đã revoke rồi, không cần update nữa
    if (existingToken.is_revoked) {
      return existingToken;
    }

    return this.prisma.refresh_tokens.update({
      where: { token },
      data: { is_revoked: true },
    });
  }

  /**
   * Revoke tất cả refresh tokens của user
   */
  async revokeAllUserTokens(userId: string) {
    return this.prisma.refresh_tokens.updateMany({
      where: {
        user_id: userId,
        is_revoked: false,
      },
      data: {
        is_revoked: true,
      },
    });
  }

  /**
   * Xóa các refresh token đã hết hạn
   */
  async deleteExpiredTokens() {
    return this.prisma.refresh_tokens.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
  }
}
