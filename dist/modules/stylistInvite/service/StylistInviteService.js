"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistInviteService = void 0;
const tsyringe_1 = require("tsyringe");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const env_1 = require("../../../config/env");
const stylistInvite_template_1 = require("../../../common/service/email/stylistInvite.template");
const notification_model_1 = require("../../../models/notification.model");
const stylistInvite_messages_1 = require("../constants/stylistInvite.messages");
/**
 * Utility function to generate SHA256 hash of input string
 */
function sha256(input) {
    return crypto_1.default.createHash('sha256').update(input).digest('hex');
}
let StylistInviteService = class StylistInviteService {
    constructor(_inviteRepo, _stylistRepo, _userRepo, _email, _notification) {
        this._inviteRepo = _inviteRepo;
        this._stylistRepo = _stylistRepo;
        this._userRepo = _userRepo;
        this._email = _email;
        this._notification = _notification;
    }
    /**
     * Creates a new stylist invitation with email
     * Validates email, creates user draft, sends invitation email
     */
    async createInvite(adminId, dto) {
        const email = dto.email.toLowerCase().trim();
        const existing = await this._userRepo.findByEmail(email);
        if (existing) {
            throw new appError_1.AppError(stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.EMAIL_ALREADY_REGISTERED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const tempPasswordHash = await bcrypt_1.default.hash(crypto_1.default.randomBytes(16).toString('hex'), 10);
        const user = await this._userRepo.createUser({
            name: 'Stylist',
            email,
            phone: undefined,
            password: tempPasswordHash,
            role: userRole_enum_1.UserRole.STYLIST,
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
        const rawToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = sha256(rawToken);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
        const inviteLink = `${env_1.env.FRONTEND_ORIGIN}/stylist/invite/${rawToken}`;
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
        const template = (0, stylistInvite_template_1.stylistInviteEmailTemplate)(inviteLink);
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
    async sendInviteToAppliedStylist(adminId, userId) {
        const user = await this._userRepo.findById(userId);
        if (!user) {
            throw new appError_1.AppError(stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.USER_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (user.role !== userRole_enum_1.UserRole.STYLIST) {
            throw new appError_1.AppError(stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.NOT_STYLIST_APPLICANT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (user.status !== 'APPLIED') {
            throw new appError_1.AppError(stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLIST_ALREADY_INVITED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (!user.email) {
            throw new appError_1.AppError(stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.MISSING_EMAIL, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        await this._userRepo.setStatusById(userId, 'PENDING');
        await this._inviteRepo.cancelByUserId(userId);
        const rawToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = sha256(rawToken);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
        const inviteLink = `${env_1.env.FRONTEND_ORIGIN}/stylist/invite/${rawToken}`;
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
        const template = (0, stylistInvite_template_1.stylistInviteEmailTemplate)(inviteLink);
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
    async validateInvite(dto) {
        const tokenHash = sha256(dto.token);
        const invite = await this._inviteRepo.findPendingByTokenHash(tokenHash);
        if (!invite) {
            throw new appError_1.AppError(stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.INVALID_INVITE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (invite.expiresAt.getTime() < Date.now()) {
            await this._inviteRepo.markExpired(invite.id);
            throw new appError_1.AppError(stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.INVITE_EXPIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
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
    async acceptInvite(dto, _tabId) {
        const tokenHash = sha256(dto.token);
        const invite = await this._inviteRepo.findPendingByTokenHash(tokenHash);
        if (!invite) {
            throw new appError_1.AppError(stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.INVALID_INVITE, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (invite.expiresAt.getTime() < Date.now()) {
            await this._inviteRepo.markExpired(invite.id);
            throw new appError_1.AppError(stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.INVITE_EXPIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (dto.password.length < 6) {
            throw new appError_1.AppError(stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.PASSWORD_TOO_SHORT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const hashed = await bcrypt_1.default.hash(dto.password, 10);
        const ok = await this._userRepo.updateInvitedStylist(invite.userId, {
            name: dto.name.trim(),
            phone: dto.phone?.trim(),
            password: hashed,
            isActive: false,
        });
        if (!ok) {
            throw new appError_1.AppError(stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.UPDATE_FAILED, httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        await this._inviteRepo.markAccepted(invite.id);
        return { success: true };
    }
    /**
     * Approves a stylist applicant
     * Activates user account and stylist profile
     */
    async approveStylist(adminId, userId) {
        const user = await this._userRepo.findByIdWithPassword(userId);
        if (user && !user.password) {
            const tempPassword = crypto_1.default.randomBytes(32).toString('hex');
            const hashed = await bcrypt_1.default.hash(tempPassword, 10);
            await this._userRepo.updatePasswordById(userId, hashed);
        }
        await this._userRepo.setActiveById(userId, true);
        await this._userRepo.setStatusById(userId, 'ACTIVE');
        await this._stylistRepo.activateByUserId(userId);
        // Notify Stylist
        await this._notification.createNotification({
            recipientId: userId,
            senderId: adminId,
            type: notification_model_1.NotificationType.STYLIST_STATUS_UPDATE,
            title: 'Stylist Application Approved 🎉',
            message: 'Congratulations! Your application to join as a stylist has been approved. You can now log in to the Stylist Portal.',
            link: '/stylist',
        });
        return { success: true };
    }
    /**
     * Rejects a stylist applicant
     * Cancels invites, deactivates account, and blocks user
     */
    async rejectStylist(adminId, userId) {
        await this._inviteRepo.cancelByUserId(userId);
        await this._userRepo.setActiveById(userId, false);
        await this._userRepo.setStatusById(userId, 'REJECTED');
        await this._userRepo.setBlockedById(userId, true);
        // Notify Stylist
        await this._notification.createNotification({
            recipientId: userId,
            senderId: adminId,
            type: notification_model_1.NotificationType.STYLIST_STATUS_UPDATE,
            title: 'Stylist Application Update',
            message: 'Unfortunately, your application to join as a stylist has not been approved at this time.',
        });
        return { success: true };
    }
    /**
     * Toggles block status for a stylist user
     */
    async toggleBlock(adminId, userId, block) {
        await this._userRepo.setBlockedById(userId, block);
        return { success: true };
    }
};
exports.StylistInviteService = StylistInviteService;
exports.StylistInviteService = StylistInviteService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistInviteRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserRepository)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.EmailService)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], StylistInviteService);
