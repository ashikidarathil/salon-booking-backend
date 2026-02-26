import { Request, Response } from 'express';
import { IBookingController } from './IBookingController';
import { IBookingService } from '../service/IBookingService';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BOOKING_MESSAGES } from '../constants/booking.messages';
import {
  CreateBookingDto,
  CancelBookingDto,
  ExtendBookingDto,
  RescheduleBookingDto,
  UpdateBookingStatusDto,
} from '../dto/booking.request.dto';
import { BookingStatus } from '../../../models/booking.model';

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
    const { slotId, items, notes }: CreateBookingDto = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;

    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse(false, BOOKING_MESSAGES.UNAUTHORIZED));
      return;
    }

    const booking = await this.bookingService.createBooking(
      userId,
      slotId || undefined,
      items,
      notes,
    );
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

  listAll = async (req: Request, res: Response) => {
    const { branchId, date } = req.query;
    const bookings = await this.bookingService.listAllBookings(branchId as string, date as string);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.LISTED, bookings));
  };

  listStylistBookings = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;
    const { date } = req.query;

    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse(false, BOOKING_MESSAGES.UNAUTHORIZED));
      return;
    }

    const bookings = await this.bookingService.listStylistBookings(userId, date as string);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.LISTED, bookings));
  };

  extend = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: ExtendBookingDto = req.body;
    const booking = await this.bookingService.extendBooking(id, data);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.EXTENDED, booking));
  };

  reschedule = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { items, reason }: RescheduleBookingDto = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;

    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse(false, BOOKING_MESSAGES.UNAUTHORIZED));
      return;
    }

    const booking = await this.bookingService.rescheduleBooking(id, userId, items, reason);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.RESCHEDULED, booking));
  };

  updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status }: UpdateBookingStatusDto = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;
    const role = (req as Request & { auth?: { role?: string } }).auth?.role || 'STYLIST';

    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse(false, BOOKING_MESSAGES.UNAUTHORIZED));
      return;
    }

    const booking = await this.bookingService.updateBookingStatus(
      id,
      userId,
      status as BookingStatus,
      role,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.STATUS_UPDATED, booking));
  };

  getTodayBookings = async (req: Request, res: Response) => {
    const { branchId } = req.query;
    const bookings = await this.bookingService.getTodayBookings(branchId as string | undefined);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.LISTED, bookings));
  };

  getStylistTodayBookings = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;

    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse(false, BOOKING_MESSAGES.UNAUTHORIZED));
      return;
    }

    const bookings = await this.bookingService.getStylistTodayBookings(userId);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.LISTED, bookings));
  };
}
