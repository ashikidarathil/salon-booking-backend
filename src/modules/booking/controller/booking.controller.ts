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
  RescheduleBookingDto,
  UpdateBookingStatusDto,
} from '../dto/booking.request.dto';
import { BookingStatus } from '../../../models/booking.model';

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

  // ─── Private helper ────────────────────────────────────────────────────────

  private extractAuth(req: Request, res: Response): AuthPayload | null {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth?.userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse(false, BOOKING_MESSAGES.UNAUTHORIZED));
      return null;
    }
    return auth;
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  create = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req, res);
    if (!auth) return;

    const { slotId, items, notes }: CreateBookingDto = req.body;
    const booking = await this.bookingService.createBooking(auth.userId, slotId, items, notes);
    res.status(HttpStatus.CREATED).json(new ApiResponse(true, BOOKING_MESSAGES.CREATED, booking));
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req, res);
    if (!auth) return;

    const { id } = req.params;
    const { reason }: CancelBookingDto = req.body;
    const booking = await this.bookingService.cancelBooking(id, auth.userId, reason, auth.role);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.CANCELLED, booking));
  };

  getDetails = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const booking = await this.bookingService.getBookingDetails(id);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.FETCHED, booking));
  };

  listMyBookings = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req, res);
    if (!auth) return;

    const bookings = await this.bookingService.listUserBookings(auth.userId);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.LISTED, bookings));
  };

  listAll = async (req: Request, res: Response): Promise<void> => {
    const { branchId, date } = req.query;
    const bookings = await this.bookingService.listAllBookings(
      branchId as string | undefined,
      date as string | undefined,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.LISTED, bookings));
  };

  listStylistBookings = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req, res);
    if (!auth) return;

    const { page, limit, search, date } = req.query;
    const paginatedResult = await this.bookingService.listStylistBookings(auth.userId, {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      date: date as string,
    });
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.LISTED, paginatedResult));
  };

  reschedule = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req, res);
    if (!auth) return;

    const { id } = req.params;
    const { items, reason }: RescheduleBookingDto = req.body;
    const booking = await this.bookingService.rescheduleBooking(
      id,
      auth.userId,
      items,
      reason,
      auth.role,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.RESCHEDULED, booking));
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req, res);
    if (!auth) return;

    const { id } = req.params;
    const { status }: UpdateBookingStatusDto = req.body;
    const booking = await this.bookingService.updateBookingStatus(
      id,
      auth.userId,
      status as BookingStatus,
      auth.role,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.STATUS_UPDATED, booking));
  };

  getTodayBookings = async (req: Request, res: Response): Promise<void> => {
    const { branchId } = req.query;
    const bookings = await this.bookingService.getTodayBookings(branchId as string | undefined);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.LISTED, bookings));
  };

  getStylistTodayBookings = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req, res);
    if (!auth) return;

    const bookings = await this.bookingService.getStylistTodayBookings(auth.userId);
    res.status(HttpStatus.OK).json(new ApiResponse(true, BOOKING_MESSAGES.LISTED, bookings));
  };
}
