import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IEscrowController } from './IEscrowController';
import { IEscrowService } from '../service/IEscrowService';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { ESCROW_MESSAGES } from '../constants/escrow.constants';
import { AuthPayload } from '../../../common/types/authPayload';
import { EscrowPaginationQueryDto } from '../dto/escrow.request.dto';

@injectable()
export class EscrowController implements IEscrowController {
  constructor(
    @inject(TOKENS.EscrowService)
    private readonly escrowService: IEscrowService,
  ) {}

  getAllEscrows = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as EscrowPaginationQueryDto;
    const escrows = await this.escrowService.getAllEscrows(query);
    res.json(ApiResponse.success(ESCROW_MESSAGES.FETCHED_ALL, escrows));
  };

  getEscrowByBooking = async (req: Request, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const escrow = await this.escrowService.getEscrowByBookingId(bookingId);
    res.json(ApiResponse.success(ESCROW_MESSAGES.FETCHED_ONE, escrow));
  };

  getStylistEscrows = async (req: Request & { auth?: AuthPayload }, res: Response): Promise<void> => {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json(ApiResponse.error('Unauthorized'));
      return;
    }
    const query = req.query as unknown as EscrowPaginationQueryDto;
    const escrows = await this.escrowService.getStylistEscrows(userId, query);
    res.json(ApiResponse.success(ESCROW_MESSAGES.FETCHED_ALL, escrows));
  };

  getHeldBalance = async (req: Request & { auth?: AuthPayload }, res: Response): Promise<void> => {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json(ApiResponse.error('Unauthorized'));
      return;
    }
    const balance = await this.escrowService.getHeldBalance(userId);
    res.json(ApiResponse.success('Held balance fetched successfully', balance));
  };

  getAdminStylistEscrows = async (req: Request, res: Response): Promise<void> => {
    const { stylistId } = req.params;
    const query = req.query as unknown as EscrowPaginationQueryDto;
    const escrows = await this.escrowService.getAdminStylistEscrows(stylistId, query);
    res.json(ApiResponse.success(ESCROW_MESSAGES.FETCHED_ALL, escrows));
  };

  getAdminStylistHeldBalance = async (req: Request, res: Response): Promise<void> => {
    const { stylistId } = req.params;
    const balance = await this.escrowService.getHeldBalance(stylistId);
    res.json(ApiResponse.success('Held balance fetched successfully', balance));
  };
}
