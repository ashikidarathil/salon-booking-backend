import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import type { IStylistService } from '../service/IStylistService';
import type { IStylistController } from './IStylistController';

@injectable()
export class StylistController implements IStylistController {
  constructor(@inject(TOKENS.StylistService) private readonly _service: IStylistService) {}

  async list(req: Request, res: Response): Promise<void> {
    const data = await this._service.listAllWithInviteStatus();
    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Stylists', data));
  }
}
