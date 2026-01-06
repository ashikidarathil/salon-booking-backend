import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';

import type { IStylistInviteService } from '../service/IStylistInviteService';
import type { IStylistInviteController } from './IStylistInviteController';

interface AuthRequest extends Request {
  auth?: { userId: string };
}

@injectable()
export class StylistInviteController implements IStylistInviteController {
  constructor(
    @inject(TOKENS.StylistInviteService) private readonly _service: IStylistInviteService,
  ) {}

  private getTabId(req: Request): string {
    return (req.headers['x-tab-id'] as string) || '';
  }

  async createInvite(req: AuthRequest, res: Response): Promise<void> {
    const adminId = req.auth?.userId ?? '';
    const tabId = this.getTabId(req);
    const data = await this._service.createInvite(adminId, {
      email: req.body.email,
      branchId: req.body.branchId,
      specialization: req.body.specialization,
      experience: Number(req.body.experience),
    });
    res.status(HttpStatus.CREATED).json(new ApiResponse(true, 'Invite created', data));
  }

  async validate(req: Request, res: Response): Promise<void> {
    const token = req.params.token;
    const data = await this._service.validateInvite({ token });
    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Invite valid', data));
  }

  async accept(req: Request, res: Response): Promise<void> {
    const token = req.params.token;
    const tabId = this.getTabId(req);
    const data = await this._service.acceptInvite(
      {
        token,
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password,
      },
      tabId,
    );
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, 'Stylist registered. Wait for admin approval.', data));
  }

  async approve(req: AuthRequest, res: Response): Promise<void> {
    const adminId = req.auth?.userId ?? '';
    const userId = req.params.userId;
    const data = await this._service.approveStylist(adminId, userId);
    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Stylist approved', data));
  }

  async reject(req: AuthRequest, res: Response): Promise<void> {
    const adminId = req.auth?.userId ?? '';
    const userId = req.params.userId;
    const data = await this._service.rejectStylist(adminId, userId);
    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Stylist rejected', data));
  }

  async toggleBlock(req: AuthRequest, res: Response): Promise<void> {
    const adminId = req.auth?.userId ?? '';
    const userId = req.params.userId;
    const block = Boolean(req.body.block);
    const data = await this._service.toggleBlock(adminId, userId, block);
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, block ? 'User blocked' : 'User unblocked', data));
  }

  async sendInviteToApplied(req: AuthRequest, res: Response): Promise<void> {
    const adminId = req.auth?.userId ?? '';
    const userId = req.params.userId;

    const data = await this._service.sendInviteToAppliedStylist(adminId, userId);

    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Invite sent', data));
  }
}
