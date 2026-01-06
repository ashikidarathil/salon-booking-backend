import { injectable, inject } from 'tsyringe';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { UserRole } from '../../../common/enums/userRole.enum';
import { env } from '../../../config/env';

import type { IStylistInviteService } from './IStylistInviteService';
import type { CreateStylistInviteDto } from '../dto/CreateStylistInvite.dto';
import type { ValidateInviteDto } from '../dto/ValidateInvite.dto';
import type { AcceptInviteDto } from '../dto/AcceptInvite.dto';

import type { IStylistInviteRepository } from '../repository/IStylistInviteRepository';
import type { IStylistRepository } from '../repository/IStylistRepository';
import type { IUserRepository } from '../../auth/repository/IUserRepository';
import type { IEmailService } from '../../../common/service/email/IEmailService';

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

@injectable()
export class StylistInviteService implements IStylistInviteService {
  constructor(
    @inject(TOKENS.StylistInviteRepository) private readonly _inviteRepo: IStylistInviteRepository,
    @inject(TOKENS.StylistRepository) private readonly _stylistRepo: IStylistRepository,
    @inject(TOKENS.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TOKENS.EmailService) private readonly _email: IEmailService,
  ) {}

  async createInvite(
    adminId: string,
    dto: CreateStylistInviteDto,
  ): Promise<{ inviteLink: string; userId: string }> {
    const email = dto.email.toLowerCase().trim();

    const existing = await this._userRepo.findByEmail(email);
    if (existing) throw new AppError('Email already registered', HttpStatus.BAD_REQUEST);

    const tempPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

    const user = await this._userRepo.createUser({
      name: 'Stylist',
      email,
      phone: undefined,
      password: tempPasswordHash,
      role: UserRole.STYLIST,
      emailVerified: true,
      phoneVerified: false,
      isActive: false,
      status: 'PENDING',
    });

    await this._stylistRepo.createStylistDraft({
      userId: user.id,
      branchId: dto.branchId,
      specialization: dto.specialization.trim(),
      experience: dto.experience,
    });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const inviteLink = `${env.FRONTEND_ORIGIN}/stylist/invite/${rawToken}`;

    await this._inviteRepo.createInvite({
      email,
      userId: user.id,
      tokenHash,
      rawToken,
      inviteLink,
      expiresAt,
      branchId: dto.branchId,
      specialization: dto.specialization.trim(),
      experience: dto.experience,
      createdBy: adminId,
    });

    await this._email.send(
      email,
      'Stylist Invitation - Complete Your Registration',
      `
      <div style="font-family: Arial, sans-serif;">
        <h2>You are invited as a Stylist</h2>
        <p>Complete registration using:</p>
        <p><a href="${inviteLink}">${inviteLink}</a></p>
        <p>This link expires in 24 hours.</p>
      </div>
      `,
    );

    return { inviteLink, userId: user.id };
  }

  async sendInviteToAppliedStylist(
    adminId: string,
    userId: string,
  ): Promise<{ inviteLink: string }> {
    const user = await this._userRepo.findById(userId);

    if (!user) throw new AppError('User not found', HttpStatus.NOT_FOUND);

    if (user.role !== UserRole.STYLIST) {
      throw new AppError('User is not a stylist applicant', HttpStatus.BAD_REQUEST);
    }

    if (user.status !== 'APPLIED') {
      throw new AppError('Stylist already invited / accepted / active', HttpStatus.BAD_REQUEST);
    }

    if (!user.email) {
      throw new AppError(
        'Applied stylist must have an email to send invite',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this._userRepo.setStatusById(userId, 'PENDING');

    await this._inviteRepo.cancelByUserId(userId);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const inviteLink = `${env.FRONTEND_ORIGIN}/stylist/invite/${rawToken}`;

    await this._inviteRepo.createInvite({
      email: user.email.toLowerCase().trim(),
      userId,
      tokenHash,
      rawToken,
      inviteLink,
      expiresAt,
      branchId: undefined,
      specialization: 'Applied Stylist',
      experience: 0,
      createdBy: adminId,
    });

    await this._email.send(
      user.email,
      'Stylist Invitation - Complete Your Registration',
      `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your stylist application is approved for registration</h2>
        <p>Complete registration using:</p>
        <p><a href="${inviteLink}">${inviteLink}</a></p>
        <p>This link expires in 24 hours.</p>
      </div>
      `,
    );

    return { inviteLink };
  }

  async validateInvite(dto: ValidateInviteDto): Promise<{
    email: string;
    branchId?: string;
    specialization: string;
    experience: number;
    expiresAt: Date;
  }> {
    const tokenHash = sha256(dto.token);

    const invite = await this._inviteRepo.findPendingByTokenHash(tokenHash);
    if (!invite) throw new AppError('Invalid or used invite', HttpStatus.BAD_REQUEST);

    if (invite.expiresAt.getTime() < Date.now()) {
      await this._inviteRepo.markExpired(invite.id);
      throw new AppError('Invite expired', HttpStatus.BAD_REQUEST);
    }

    return {
      email: invite.email,
      branchId: invite.branchId,
      specialization: invite.specialization,
      experience: invite.experience,
      expiresAt: invite.expiresAt,
    };
  }

  async acceptInvite(dto: AcceptInviteDto, tabId?: string): Promise<{ success: true }> {
    const tokenHash = sha256(dto.token);

    const invite = await this._inviteRepo.findPendingByTokenHash(tokenHash);
    if (!invite) {
      throw new AppError('Invalid or used invite link', HttpStatus.BAD_REQUEST);
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      await this._inviteRepo.markExpired(invite.id);
      throw new AppError('Invite link has expired', HttpStatus.BAD_REQUEST);
    }

    if (dto.password.length < 6) {
      throw new AppError('Password must be at least 6 characters', HttpStatus.BAD_REQUEST);
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const ok = await this._userRepo.updateInvitedStylist(invite.userId, {
      name: dto.name.trim(),
      phone: dto.phone?.trim(),
      password: hashed,
      isActive: false,
    });

    if (!ok) {
      throw new AppError(
        'Failed to update stylist account. User not found.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this._inviteRepo.markAccepted(invite.id);

    return { success: true };
  }

  async approveStylist(adminId: string, userId: string): Promise<{ success: true }> {
    await this._userRepo.setActiveById(userId, true);
    await this._userRepo.setStatusById(userId, 'ACTIVE');
    await this._stylistRepo.activateByUserId(userId);
    return { success: true };
  }

  async rejectStylist(adminId: string, userId: string): Promise<{ success: true }> {
    await this._inviteRepo.cancelByUserId(userId);
    await this._userRepo.setActiveById(userId, false);
    await this._userRepo.setStatusById(userId, 'REJECTED');
    await this._userRepo.setBlockedById(userId, true);
    return { success: true };
  }

  async toggleBlock(adminId: string, userId: string, block: boolean): Promise<{ success: true }> {
    await this._userRepo.setBlockedById(userId, block);
    return { success: true };
  }
}
