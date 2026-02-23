import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type {
  AuthRequest,
  AuthenticatedUser,
} from '../types/auth-request.type';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
