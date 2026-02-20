import { Request, Response } from 'express';
import { IBookingController } from './IBookingController';
import { IBookingService } from '../service/IBookingService';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BOOKING_MESSAGES } from '../constants/booking.messages';
import { CreateBookingDto, CancelBookingDto, ExtendBookingDto } from '../dto/booking.request.dto';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

@injectable()
export class BookingController implements IBookingController {
  constructor(
    @inject(TOKENS.BookingService)
    private readonly bookingService: IBookingService,
  ) {}

  create = async (req: Request, res: Response) => {
    const { slotId, serviceId, notes }: CreateBookingDto = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;

    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse(false, BOOKING_MESSAGES.UNAUTHORIZED));
      return;
    }

    const booking = await this.bookingService.createBooking(userId, slotId, serviceId, notes);
    res.status(HttpStatus.CREATED).json(new ApiResponse(true, BOOKING_MESSAGES.CREATED, booking));
  };

  cancel = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason }: CancelBookingDto = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;

    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse(false, BOOKING_MESSAGES.UNAUTHORIZED));
      return;
    }

    const booking = await this.bookingService.cancelBooking(id, userId, reason);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.CANCELLED, booking));
  };

  getDetails = async (req: Request, res: Response) => {
    const { id } = req.params;
    const booking = await this.bookingService.getBookingDetails(id);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.FETCHED, booking));
  };

  listMyBookings = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;

    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse(false, BOOKING_MESSAGES.UNAUTHORIZED));
      return;
    }

    const bookings = await this.bookingService.listUserBookings(userId);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.LISTED, bookings));
  };

  extend = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { additionalDuration }: ExtendBookingDto = req.body;
    const booking = await this.bookingService.extendBooking(id, additionalDuration);
    res.status(HttpStatus.OK).json(new ApiResponse(true, 'Booking extended successfully', booking));
  };
}
