import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { AdminsService } from 'src/admins/admins.service';

@Injectable()
export class AuthAdminMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly adminsService: AdminsService,
  ) {}

  private extractTokenFromHeader(
    request: Request,
  ): { type: string; token: string } | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (token) {
      return { type, token };
    } else return undefined;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization) {
      const { type, token } = this.extractTokenFromHeader(req);
      try {
        let payload = null;
        if (type === 'Bearer') {
          payload = await this.authService.verifyAccessToken(token);
        } else if (type === 'Refresh') {
          payload = await this.authService.verifyRefreshToken(token);
        }
        if (typeof payload === 'object' && payload?.hasOwnProperty('_id')) {
          try {
            const adminId = payload['_id'];
            const admin = await this.adminsService.findAdminById(adminId);
            if (admin) {
              req['admin'] = admin;
            }
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    next();
  }
}
