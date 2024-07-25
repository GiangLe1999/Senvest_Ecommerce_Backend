import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from '../schemas/admin.schema';
import { AdminLoginInput, AdminLoginOutput } from './dtos/admin-login.dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  AdminRegisterInput,
  AdminRegisterOutput,
} from './dtos/admin-register.dto';
import { AuthService } from '../auth/auth.service';
import { AdminRefreshTokenOutput } from './dtos/admin-refresh-token';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private readonly authService: AuthService,
  ) {}

  async findAdminById(_id: string): Promise<AdminDocument> {
    return this.adminModel.findById(_id);
  }

  async findAdminByEmail(email: string): Promise<AdminDocument> {
    return this.adminModel.findOne({ email });
  }

  async adminRegister(
    adminRegisterInput: AdminRegisterInput,
  ): Promise<AdminRegisterOutput> {
    const existingAdmin = await this.findAdminByEmail(adminRegisterInput.email);
    if (existingAdmin) {
      throw new BadRequestException({ ok: false, error: 'Admin đã tồn tại' });
    }
    const hashedPassword = await bcrypt.hash(adminRegisterInput.password, 10);
    const newAdmin = new this.adminModel({
      email: adminRegisterInput.email,
      password: hashedPassword,
    });
    await newAdmin.save();

    return { ok: true };
  }

  async adminLogin(
    adminLoginInput: AdminLoginInput,
  ): Promise<AdminLoginOutput> {
    const existingAdmin = await this.findAdminByEmail(adminLoginInput.email);

    if (!existingAdmin) {
      throw new BadRequestException({
        ok: false,
        error: 'Admin không tồn tại',
      });
    }

    const isMatchPassword = await bcrypt.compare(
      adminLoginInput.password,
      existingAdmin.password,
    );

    if (!isMatchPassword) {
      throw new BadRequestException({
        ok: false,
        error: 'Mật khẩu không chính xác',
      });
    }

    const { accessToken, expiresIn, refreshToken } =
      await this.authService.provideToken(existingAdmin._id.toString());

    const adminObj = existingAdmin.toObject();

    delete adminObj.password;

    return {
      ok: true,
      accessToken,
      refreshToken,
      expiresIn,
      admin: adminObj,
    };
  }

  async adminRefreshToken(_id: string): Promise<AdminRefreshTokenOutput> {
    if (!_id) {
      throw new BadRequestException({
        ok: false,
        error: 'Thiếu id của admin',
      });
    }

    const { accessToken, expiresIn, refreshToken } =
      await this.authService.provideToken(_id);
    return {
      ok: true,
      accessToken,
      refreshToken,
      expiresIn,
    };
  }
}
