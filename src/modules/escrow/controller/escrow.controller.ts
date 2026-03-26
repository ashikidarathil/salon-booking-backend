import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IEscrowController } from './IEscrowController';
import { IEscrowService } from '../service/IEscrowService';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { ESCROW_MESSAGES } from '../constants/escrow.constants';
import { AuthPayload } from '../../../common/types/authPayload';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { EscrowPaginationQueryDto } from '../dto/escrow.request.dto';

@injectable()
export class EscrowController implements IEscrowController {
  constructor(
    @inject(TOKENS.EscrowService)
    private readonly escrowService: IEscrowService,
  ) {}

  getAllEscrows = async (req: Request, res: Response): Promise<Response> => {
    const query = req.query as EscrowPaginationQueryDto;
    const escrows = await this.escrowService.getAllEscrows(query);
    return ApiResponse.success(res, escrows, ESCROW_MESSAGES.FETCHED_ALL);
  };

  getEscrowByBooking = async (req: Request, res: Response): Promise<Response> => {
    const { bookingId } = req.params;
    const escrow = await this.escrowService.getEscrowByBookingId(bookingId);
    return ApiResponse.success(res, escrow, ESCROW_MESSAGES.FETCHED_ONE);
  };

  getStylistEscrows = async (
    req: Request & { auth?: AuthPayload },
    res: Response,
  ): Promise<Response> => {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError(ESCROW_MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    const query = req.query as EscrowPaginationQueryDto;
    const escrows = await this.escrowService.getStylistEscrows(userId, query);
    return ApiResponse.success(res, escrows, ESCROW_MESSAGES.FETCHED_ALL);
  };

  getHeldBalance = async (
    req: Request & { auth?: AuthPayload },
    res: Response,
  ): Promise<Response> => {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError(ESCROW_MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    const balance = await this.escrowService.getHeldBalance(userId);
    return ApiResponse.success(res, balance, ESCROW_MESSAGES.HELD_BALANCE);
  };

  getAdminStylistEscrows = async (req: Request, res: Response): Promise<Response> => {
    const { stylistId } = req.params;
    const query = req.query as EscrowPaginationQueryDto;
    const escrows = await this.escrowService.getAdminStylistEscrows(stylistId, query);
    return ApiResponse.success(res, escrows, ESCROW_MESSAGES.FETCHED_ALL);
  };

  getAdminStylistHeldBalance = async (req: Request, res: Response): Promise<Response> => {
    const { stylistId } = req.params;
    const balance = await this.escrowService.getHeldBalance(stylistId);
    return ApiResponse.success(res, balance, ESCROW_MESSAGES.HELD_BALANCE);
  };
}
