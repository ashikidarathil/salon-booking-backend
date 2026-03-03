import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IEscrowController } from './IEscrowController';
import { IEscrowService } from '../service/IEscrowService';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { ESCROW_MESSAGES } from '../constants/escrow.constants';
import { IEscrowRepository } from '../repository/IEscrowRepository';
import { AppError } from '../../../common/errors/appError';

@injectable()
export class EscrowController implements IEscrowController {
  constructor(
    @inject(TOKENS.EscrowService)
    private readonly escrowService: IEscrowService,
    @inject(TOKENS.EscrowRepository)
    private readonly escrowRepository: IEscrowRepository,
  ) {}

  getAllEscrows = async (req: Request, res: Response): Promise<void> => {
    // For admin panel: using repository directly for simple listing or implement a query service later
    // For now, let's use the repository's find method
    const escrows = await this.escrowRepository.find(
      {},
      [{ path: 'bookingId' }, { path: 'userId' }],
      { createdAt: -1 },
    );
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, 'Escrow records fetched successfully', escrows));
  };

  getEscrowByBooking = async (req: Request, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const escrow = await this.escrowService.getEscrowByBookingId(bookingId);
    if (!escrow) {
      throw new AppError(ESCROW_MESSAGES.ERROR.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, 'Escrow record fetched successfully', escrow));
  };
}
