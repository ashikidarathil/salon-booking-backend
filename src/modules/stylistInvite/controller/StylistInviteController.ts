import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';

import type { IStylistInviteService } from '../service/IStylistInviteService';
import { AuthRequest } from '../type/AuthRequest';

import { STYLIST_INVITE_MESSAGES } from '../constants/stylistInvite.messages';

import type { CreateStylistInviteRequest } from '../dto/request/CreateStylistInvite.request';
import type { AcceptInviteRequest } from '../dto/request/AcceptInvite.request';
import type { ValidateInviteRequest } from '../dto/request/ValidateInvite.request';

@injectable()
export class StylistInviteController {
  constructor(
    @inject(TOKENS.StylistInviteService) private readonly _service: IStylistInviteService,
  ) {}

  private getTabId(req: Request): string {
    return (req.headers['x-tab-id'] as string) || '';
  }

  private adminId(req: AuthRequest): string {
    return req.auth?.userId ?? '';
  }

  async createInvite(req: AuthRequest, res: Response): Promise<void> {
    const adminId = this.adminId(req);

    const dto: CreateStylistInviteRequest = {
      email: String(req.body.email || ''),
      specialization: String(req.body.specialization || ''),
      experience: Number(req.body.experience || 0),
    };

    const data = await this._service.createInvite(adminId, dto);

    res
      .status(HttpStatus.CREATED)
      .json(new ApiResponse(true, STYLIST_INVITE_MESSAGES.INVITE_CREATED, data));
  }

  async validate(req: AuthRequest, res: Response): Promise<void> {
    const dto: ValidateInviteRequest = { token: String(req.params.token || '') };

    const data = await this._service.validateInvite(dto);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, STYLIST_INVITE_MESSAGES.INVITE_VALID, data));
  }

  async accept(req: AuthRequest, res: Response): Promise<void> {
    const tabId = this.getTabId(req);

    const dto: AcceptInviteRequest = {
      token: String(req.params.token || ''),
      name: String(req.body.name || ''),
      phone: req.body.phone ? String(req.body.phone) : undefined,
      password: String(req.body.password || ''),
    };

    const data = await this._service.acceptInvite(dto, tabId);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, STYLIST_INVITE_MESSAGES.INVITE_ACCEPTED, data));
  }

  async approve(req: AuthRequest, res: Response): Promise<void> {
    const adminId = this.adminId(req);
    const userId = String(req.params.userId || '');

    const data = await this._service.approveStylist(adminId, userId);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, STYLIST_INVITE_MESSAGES.STYLIST_APPROVED, data));
  }

  async reject(req: AuthRequest, res: Response): Promise<void> {
    const adminId = this.adminId(req);
    const userId = String(req.params.userId || '');

    const data = await this._service.rejectStylist(adminId, userId);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, STYLIST_INVITE_MESSAGES.STYLIST_REJECTED, data));
  }

  async toggleBlock(req: AuthRequest, res: Response): Promise<void> {
    const adminId = this.adminId(req);
    const userId = String(req.params.userId || '');
    const block = Boolean(req.body.block);

    const data = await this._service.toggleBlock(adminId, userId, block);

    res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          true,
          block ? STYLIST_INVITE_MESSAGES.USER_BLOCKED : STYLIST_INVITE_MESSAGES.USER_UNBLOCKED,
          data,
        ),
      );
  }

  async sendInviteToApplied(req: AuthRequest, res: Response): Promise<void> {
    const adminId = this.adminId(req);
    const userId = String(req.params.userId || '');

    const data = await this._service.sendInviteToAppliedStylist(adminId, userId);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, STYLIST_INVITE_MESSAGES.INVITE_SENT, data));
  }
}
