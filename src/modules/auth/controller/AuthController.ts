import type { Request, Response } from 'express';
import { ApiResponse } from '../../../common/response/ApiResponse';
import { HttpStatus } from '../../../common/enums/HttpStatus.enum';

import type { IAuthController } from './IAuthController';
import type { IAuthService } from '../service/IAuthService';

import type { SignupDto } from '../dto/Signup.dto';
import type { LoginDto } from '../dto/Login.dto';
import type { VerifyOtpDto } from '../dto/VerifyOtp.dto';
import type { ResetPasswordDto } from '../dto/ResetPassword.dto';
import type { ForgotPasswordDto } from '../dto/ForgotPassword.dto';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';

@injectable()
export class AuthController implements IAuthController {
  constructor(@inject(TOKENS.AuthService) private readonly _authService: IAuthService) {}

  async signup(req: Request, res: Response) {
    const dto: SignupDto = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    };

    const data = await this._authService.signup(dto);

    res.status(HttpStatus.CREATED).json(new ApiResponse(true, 'Signup successful', data));
  }

  async verifyOtp(req: Request, res: Response) {
    const dto: VerifyOtpDto = {
      email: req.body.email,
      otp: req.body.otp,
    };

    const data = await this._authService.verifyOtp(dto);

    res.status(HttpStatus.OK).json(new ApiResponse(true, 'OTP verified', data));
  }

  async login(req: Request, res: Response) {
    const dto: LoginDto = {
      email: req.body.email,
      password: req.body.password,
    };

    const data = await this._authService.login(dto);

    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Login successful', data));
  }

  async forgotPassword(req: Request, res: Response) {
    const dto: ForgotPasswordDto = {
      email: req.body.email,
    };

    const data = await this._authService.forgotPassword(dto);

    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Reset OTP sent', data));
  }

  async resetPassword(req: Request, res: Response) {
    const dto: ResetPasswordDto = {
      email: req.body.email,
      otp: req.body.otp,
      newPassword: req.body.newPassword,
    };

    const data = await this._authService.resetPassword(dto);

    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Password reset successful', data));
  }
}
