import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthAdmin = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const admin = request.admin;
    return admin;
  },
);
