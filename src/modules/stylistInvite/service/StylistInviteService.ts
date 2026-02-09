import { injectable, inject } from 'tsyringe';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { UserRole } from '../../../common/enums/userRole.enum';
import { env } from '../../../config/env';
import type { IEmailService } from '../../../common/service/email/IEmailService';
import { stylistInviteEmailTemplate } from '../../../common/service/email/stylistInvite.template';

import type { IStylistInviteService } from './IStylistInviteService';
import type { CreateStylistInviteRequest } from '../dto/request/CreateStylistInvite.request';
import type { ValidateInviteRequest } from '../dto/request/ValidateInvite.request';
import type { AcceptInviteRequest } from '../dto/request/AcceptInvite.request';
import type { CreateInviteResponse } from '../dto/response/CreateInvite.response';
import type { ValidateInviteResponse } from '../dto/response/ValidateInvite.response';
import type { SendInviteResponse } from '../dto/response/CreateInvite.response';

import type { IStylistInviteRepository } from '../repository/IStylistInviteRepository';
import type { IStylistRepository } from '../repository/IStylistRepository';
import type { IUserRepository } from '../../auth/repository/IUserRepository';

import { STYLIST_INVITE_MESSAGES } from '../constants/stylistInvite.messages';

/**
 * Utility function to generate SHA256 hash of input string
 */
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

  /**
   * Creates a new stylist invitation with email
   * Validates email, creates user draft, sends invitation email
   */
  async createInvite(
    adminId: string,
    dto: CreateStylistInviteRequest,
  ): Promise<CreateInviteResponse> {
    const email = dto.email.toLowerCase().trim();

    const existing = await this._userRepo.findByEmail(email);
    if (existing) {
      throw new AppError(STYLIST_INVITE_MESSAGES.EMAIL_ALREADY_REGISTERED, HttpStatus.BAD_REQUEST);
    }

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
      specialization: dto.specialization.trim(),
      experience: dto.experience,
      createdBy: adminId,
    });

    const template = stylistInviteEmailTemplate(inviteLink);

    await this._email.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    return { inviteLink, userId: user.id };
  }

  /**
   * Sends invitation to an already applied stylist
   * Validates user status and sends new invitation email
   */

  async sendInviteToAppliedStylist(adminId: string, userId: string): Promise<SendInviteResponse> {
    const user = await this._userRepo.findById(userId);

    if (!user) {
      throw new AppError(STYLIST_INVITE_MESSAGES.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (user.role !== UserRole.STYLIST) {
      throw new AppError(STYLIST_INVITE_MESSAGES.NOT_STYLIST_APPLICANT, HttpStatus.BAD_REQUEST);
    }

    if (user.status !== 'APPLIED') {
      throw new AppError(STYLIST_INVITE_MESSAGES.STYLIST_ALREADY_INVITED, HttpStatus.BAD_REQUEST);
    }

    if (!user.email) {
      throw new AppError(STYLIST_INVITE_MESSAGES.MISSING_EMAIL, HttpStatus.BAD_REQUEST);
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
      specialization: 'Applied Stylist',
      experience: 0,
      createdBy: adminId,
    });

    const template = stylistInviteEmailTemplate(inviteLink);

    await this._email.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    return { inviteLink };
  }

  /**
   * Validates an invitation token
   * Checks token validity and expiration
   */
  async validateInvite(dto: ValidateInviteRequest): Promise<ValidateInviteResponse> {
    const tokenHash = sha256(dto.token);

    const invite = await this._inviteRepo.findPendingByTokenHash(tokenHash);
    if (!invite) {
      throw new AppError(STYLIST_INVITE_MESSAGES.INVALID_INVITE, HttpStatus.BAD_REQUEST);
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      await this._inviteRepo.markExpired(invite.id);
      throw new AppError(STYLIST_INVITE_MESSAGES.INVITE_EXPIRED, HttpStatus.BAD_REQUEST);
    }

    return {
      email: invite.email,
      specialization: invite.specialization,
      experience: invite.experience,
      expiresAt: invite.expiresAt,
    };
  }

  /**
   * Accepts an invitation and completes stylist registration
   * Validates password, updates user details, marks invite as accepted
   */
  async acceptInvite(dto: AcceptInviteRequest, tabId?: string): Promise<{ success: true }> {
    const tokenHash = sha256(dto.token);

    const invite = await this._inviteRepo.findPendingByTokenHash(tokenHash);
    if (!invite) {
      throw new AppError(STYLIST_INVITE_MESSAGES.INVALID_INVITE, HttpStatus.BAD_REQUEST);
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      await this._inviteRepo.markExpired(invite.id);
      throw new AppError(STYLIST_INVITE_MESSAGES.INVITE_EXPIRED, HttpStatus.BAD_REQUEST);
    }

    if (dto.password.length < 6) {
      throw new AppError(STYLIST_INVITE_MESSAGES.PASSWORD_TOO_SHORT, HttpStatus.BAD_REQUEST);
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const ok = await this._userRepo.updateInvitedStylist(invite.userId, {
      name: dto.name.trim(),
      phone: dto.phone?.trim(),
      password: hashed,
      isActive: false,
    });

    if (!ok) {
      throw new AppError(STYLIST_INVITE_MESSAGES.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this._inviteRepo.markAccepted(invite.id);

    return { success: true };
  }

  /**
   * Approves a stylist applicant
   * Activates user account and stylist profile
   */
  async approveStylist(adminId: string, userId: string): Promise<{ success: true }> {
    await this._userRepo.setActiveById(userId, true);
    await this._userRepo.setStatusById(userId, 'ACTIVE');
    await this._stylistRepo.activateByUserId(userId);
    return { success: true };
  }

  /**
   * Rejects a stylist applicant
   * Cancels invites, deactivates account, and blocks user
   */
  async rejectStylist(adminId: string, userId: string): Promise<{ success: true }> {
    await this._inviteRepo.cancelByUserId(userId);
    await this._userRepo.setActiveById(userId, false);
    await this._userRepo.setStatusById(userId, 'REJECTED');
    await this._userRepo.setBlockedById(userId, true);
    return { success: true };
  }

  /**
   * Toggles block status for a stylist user
   */
  async toggleBlock(adminId: string, userId: string, block: boolean): Promise<{ success: true }> {
    await this._userRepo.setBlockedById(userId, block);
    return { success: true };
  }
}
