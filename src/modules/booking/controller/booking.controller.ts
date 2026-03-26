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
  BookingStatsQueryDto,
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

  create = async (req: Request, res: Response): Promise<Response> => {
    const auth = this.extractAuth(req);
    const { items, notes }: CreateBookingDto = req.body;
    const booking = await this.bookingService.createBooking(auth.userId, items, notes);
    return ApiResponse.success(res, booking, BOOKING_MESSAGES.CREATED, HttpStatus.CREATED);
  };

  cancel = async (req: Request, res: Response): Promise<Response> => {
    const auth = this.extractAuth(req);
    const { id } = req.params;
    const { reason }: CancelBookingDto = req.body;
    const booking = await this.bookingService.cancelBooking(id, auth.userId, reason, auth.role);
    return ApiResponse.success(res, booking, BOOKING_MESSAGES.CANCELLED);
  };

  getDetails = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const booking = await this.bookingService.getBookingDetails(id);
    return ApiResponse.success(res, booking, BOOKING_MESSAGES.FETCHED);
  };

  listMyBookings = async (req: Request, res: Response): Promise<Response> => {
    const auth = this.extractAuth(req);
    const bookings = await this.bookingService.listUserBookings(auth.userId);
    return ApiResponse.success(res, bookings, BOOKING_MESSAGES.LISTED);
  };

  listAll = async (req: Request, res: Response): Promise<Response> => {
    const { branchId, date } = req.query;
    const bookings = await this.bookingService.listAllBookings(
      branchId as string | undefined,
      date as string | undefined,
    );
    return ApiResponse.success(res, bookings, BOOKING_MESSAGES.LISTED);
  };

  listStylistBookings = async (req: Request, res: Response): Promise<Response> => {
    const auth = this.extractAuth(req);
    const query = req.query as unknown as StylistBookingPaginationQueryDto;
    const paginatedResult = await this.bookingService.listStylistBookings(auth.userId, query);
    return ApiResponse.success(res, paginatedResult, BOOKING_MESSAGES.LISTED);
  };

  reschedule = async (req: Request, res: Response): Promise<Response> => {
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
    return ApiResponse.success(res, booking, BOOKING_MESSAGES.RESCHEDULED);
  };

  updateStatus = async (req: Request, res: Response): Promise<Response> => {
    const auth = this.extractAuth(req);
    const { id } = req.params;
    const { status }: UpdateBookingStatusDto = req.body;
    const booking = await this.bookingService.updateBookingStatus(
      id,
      auth.userId,
      status,
      auth.role,
    );
    return ApiResponse.success(res, booking, BOOKING_MESSAGES.STATUS_UPDATED);
  };

  getTodayBookings = async (req: Request, res: Response): Promise<Response> => {
    const { branchId } = req.query;
    const bookings = await this.bookingService.getTodayBookings(branchId as string | undefined);
    return ApiResponse.success(res, bookings, BOOKING_MESSAGES.LISTED);
  };

  getStylistTodayBookings = async (req: Request, res: Response): Promise<Response> => {
    const auth = this.extractAuth(req);
    const bookings = await this.bookingService.getStylistTodayBookings(auth.userId);
    return ApiResponse.success(res, bookings, BOOKING_MESSAGES.LISTED);
  };

  getStylistStats = async (req: Request, res: Response): Promise<Response> => {
    const auth = this.extractAuth(req);
    const { period, date }: BookingStatsQueryDto = req.query as unknown as BookingStatsQueryDto;
    const stats = await this.bookingService.getStylistStats(auth.userId, period, date);
    return ApiResponse.success(res, stats, BOOKING_MESSAGES.FETCHED);
  };

  applyCoupon = async (req: Request, res: Response): Promise<Response> => {
    const auth = this.extractAuth(req);
    const { id } = req.params;
    const { code } = req.body;
    const booking = await this.bookingService.applyCoupon(id, code, auth.userId);
    return ApiResponse.success(res, booking, BOOKING_MESSAGES.FETCHED);
  };

  removeCoupon = async (req: Request, res: Response): Promise<Response> => {
    const auth = this.extractAuth(req);
    const { id } = req.params;
    const booking = await this.bookingService.removeCoupon(id, auth.userId);
    return ApiResponse.success(res, booking, BOOKING_MESSAGES.FETCHED);
  };
}
