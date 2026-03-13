import { Request, Response } from 'express';
import { IBookingController } from './IBookingController';
import { IBookingService } from '../service/IBookingService';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BOOKING_MESSAGES } from '../constants/booking.messages';
import { AppError } from '../../../common/errors/appError';

import {
  CreateBookingDto,
  CancelBookingDto,
  RescheduleBookingDto,
  UpdateBookingStatusDto,
  StylistBookingPaginationQueryDto,
} from '../dto/booking.request.dto';

interface AuthPayload {
  userId: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  auth?: AuthPayload;
}

@injectable()
export class BookingController implements IBookingController {
  constructor(
    @inject(TOKENS.BookingService)
    private readonly bookingService: IBookingService,
  ) {}

  private extractAuth(req: Request): AuthPayload {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth?.userId) {
      throw new AppError(BOOKING_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    return auth;
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    const { items, notes }: CreateBookingDto = req.body;
    const booking = await this.bookingService.createBooking(auth.userId, items, notes);
    res.status(HttpStatus.CREATED).json(ApiResponse.success(BOOKING_MESSAGES.CREATED, booking));
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    const { id } = req.params;
    const { reason }: CancelBookingDto = req.body;
    const booking = await this.bookingService.cancelBooking(id, auth.userId, reason, auth.role);
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.CANCELLED, booking));
  };

  getDetails = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const booking = await this.bookingService.getBookingDetails(id);
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.FETCHED, booking));
  };

  listMyBookings = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    const bookings = await this.bookingService.listUserBookings(auth.userId);
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.LISTED, bookings));
  };

  listAll = async (req: Request, res: Response): Promise<void> => {
    const { branchId, date } = req.query;
    const bookings = await this.bookingService.listAllBookings(
      branchId as string | undefined,
      date as string | undefined,
    );
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.LISTED, bookings));
  };

  listStylistBookings = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    const query = req.query as unknown as StylistBookingPaginationQueryDto;
    const paginatedResult = await this.bookingService.listStylistBookings(auth.userId, query);
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.LISTED, paginatedResult));
  };

  reschedule = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    const { id } = req.params;
    const { items, reason }: RescheduleBookingDto = req.body;
    const booking = await this.bookingService.rescheduleBooking(
      id,
      auth.userId,
      items,
      reason,
      auth.role,
    );
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.RESCHEDULED, booking));
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    const { id } = req.params;
    const { status }: UpdateBookingStatusDto = req.body;
    const booking = await this.bookingService.updateBookingStatus(
      id,
      auth.userId,
      status,
      auth.role,
    );
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.STATUS_UPDATED, booking));
  };

  getTodayBookings = async (req: Request, res: Response): Promise<void> => {
    const { branchId } = req.query;
    const bookings = await this.bookingService.getTodayBookings(branchId as string | undefined);
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.LISTED, bookings));
  };

  getStylistTodayBookings = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    const bookings = await this.bookingService.getStylistTodayBookings(auth.userId);
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.LISTED, bookings));
  };

  getStylistStats = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    const { period, date } = req.query;
    const stats = await this.bookingService.getStylistStats(
      auth.userId,
      period as string,
      date as string,
    );
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.FETCHED, stats));
  };

  applyCoupon = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    const { id } = req.params;
    const { code } = req.body;
    const booking = await this.bookingService.applyCoupon(id, code, auth.userId);
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.FETCHED, booking));
  };

  removeCoupon = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req);
    const { id } = req.params;
    const booking = await this.bookingService.removeCoupon(id, auth.userId);
    res.status(HttpStatus.OK).json(ApiResponse.success(BOOKING_MESSAGES.FETCHED, booking));
  };
}

