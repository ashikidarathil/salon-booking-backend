import { SlotResponseDto } from '../dto/slot.response.dto';
import { ISlotService } from './ISlotService';
import { IHolidayRepository } from '../../holiday/repository/IHolidayRepository';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { StylistBranchModel } from '../../../models/stylistBranch.model';
import { StylistOffDayModel, OffDayStatus } from '../../../models/stylistOffDay.model';
import { StylistDailyOverrideModel } from '../../../models/stylistDailyOverride.model';
import { StylistWeeklyScheduleModel } from '../../../models/stylistWeeklySchedule.model';
import { SlotStatus, SLOT_GRID_SIZE } from '../constants/slot.constants';
import { StylistModel } from '../../../models/stylist.model';
import { BookingModel, BookingStatus } from '../../../models/booking.model';
import { StylistBreakModel } from '../../../models/stylistBreak.model';
import mongoose from 'mongoose';

@injectable()
export class SlotService implements ISlotService {
  constructor(
    @inject(TOKENS.HolidayRepository)
    private readonly holidayRepo: IHolidayRepository,
  ) {}

  // Helper to resolve user ID to stylist ID
  private async resolveStylistId(userIdOrStylistId: string): Promise<string> {
    const stylistByUserId = await StylistModel.findOne({ userId: userIdOrStylistId })
      .select('_id')
      .lean();
    if (stylistByUserId && stylistByUserId._id) {
      return stylistByUserId._id.toString();
    }
    return userIdOrStylistId;
  }

  private timeToMinutes(time: string): number {
    const [hrs, mins] = time.split(':').map(Number);
    return hrs * 60 + mins;
  }

  private minutesToTime(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  async lockSlot(slotId: string, userId: string): Promise<SlotResponseDto> {
    if (!slotId.startsWith('dynamic_')) {
      throw new AppError('Legacy slots are no longer supported', HttpStatus.BAD_REQUEST);
    }

    const parts = slotId.split('_');
    return {
      id: slotId,
      branchId: parts[1],
      stylistId: parts[2],
      date: parts[3],
      startTime: parts[4],
      endTime: parts[5],
      startTimeUTC: new Date(parts[3]).toISOString(), // Approximate
      status: SlotStatus.LOCKED,
      lockedBy: userId,
      lockedUntil: new Date(Date.now() + 10 * 60000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async blockSlot(slotId: string, reason?: string): Promise<SlotResponseDto> {
    if (!slotId.startsWith('dynamic_')) {
      throw new AppError('Legacy slots are no longer supported', HttpStatus.BAD_REQUEST);
    }

    const parts = slotId.split('_');
    const branchId = parts[1];
    const stylistId = parts[2];
    const date = new Date(parts[3]);
    const startTime = parts[4];
    const endTime = parts[5];

    // Create a BLOCKED booking
    await BookingModel.create({
      userId: new mongoose.Types.ObjectId(), // Placeholder
      branchId: new mongoose.Types.ObjectId(branchId),
      stylistId: new mongoose.Types.ObjectId(stylistId),
      date,
      startTime,
      endTime,
      status: BookingStatus.BLOCKED,
      notes: reason || 'Admin blocked',
    });

    return {
      id: slotId,
      branchId,
      stylistId,
      date: date.toISOString(),
      startTime,
      endTime,
      status: SlotStatus.BLOCKED,
      lockedBy: null,
      lockedUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as SlotResponseDto;
  }

  async unblockSlot(slotId: string): Promise<SlotResponseDto> {
    if (!slotId.startsWith('dynamic_')) {
      throw new AppError('Legacy slots are no longer supported', HttpStatus.BAD_REQUEST);
    }

    const parts = slotId.split('_');
    const branchId = parts[1];
    const stylistId = parts[2];
    const date = new Date(parts[3]);
    const startTime = parts[4];

    await BookingModel.deleteOne({
      branchId: new mongoose.Types.ObjectId(branchId),
      stylistId: new mongoose.Types.ObjectId(stylistId),
      date,
      startTime,
      status: BookingStatus.BLOCKED,
    });

    return {
      id: slotId,
      status: SlotStatus.AVAILABLE,
    } as SlotResponseDto;
  }

  async getDynamicAvailability(
    branchId: string,
    date: Date,
    userIdOrStylistId?: string,
    duration?: number,
  ): Promise<SlotResponseDto[]> {
    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    // Enforce Booking Window
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    const maxDate = new Date(now);
    maxDate.setUTCDate(now.getUTCDate() + 14); // BOOKING_WINDOW_DAYS

    if (queryDate < now || queryDate > maxDate) {
      return []; // Return no slots for dates outside the window
    }

    // 1. Get Target Stylists
    let stylistIds: string[] = [];
    if (userIdOrStylistId) {
      stylistIds = [await this.resolveStylistId(userIdOrStylistId)];
    } else {
      const activeStylists = await StylistBranchModel.find({ branchId, isActive: true }).select(
        'stylistId',
      );
      stylistIds = activeStylists.map((s) => s.stylistId.toString());
    }

    const allSlots: SlotResponseDto[] = [];

    // 2. Fetch Stylist Info in Batch
    const stylistsData = await StylistModel.find({ _id: { $in: stylistIds } })
      .populate('userId', 'name email')
      .lean();

    const stylistInfoMap = new Map<string, (typeof stylistsData)[0]>(
      stylistsData.map((s) => [s._id.toString(), s]),
    );

    // 2b. Fetch Breaks in Batch
    const breaks = await StylistBreakModel.find({
      branchId: new mongoose.Types.ObjectId(branchId),
      stylistId: { $in: stylistIds.map((id) => new mongoose.Types.ObjectId(id)) },
      $or: [{ dayOfWeek: queryDate.getUTCDay() }, { date: queryDate }],
    }).lean();

    const breakMap = new Map<string, Array<(typeof breaks)[0]>>();
    breaks.forEach((b) => {
      const sid = b.stylistId.toString();
      if (!breakMap.has(sid)) breakMap.set(sid, []);
      breakMap.get(sid)?.push(b);
    });

    for (const stylistId of stylistIds) {
      const stylistData = stylistInfoMap.get(stylistId);
      const stylistName = stylistData?.userId?.name || 'Unknown';
      const stylistEmail = stylistData?.userId?.email || '';

      // 3. Check for Off-Day
      const offDay = await StylistOffDayModel.findOne({
        stylistId: new mongoose.Types.ObjectId(stylistId),
        status: OffDayStatus.APPROVED,
        startDate: { $lte: queryDate },
        endDate: { $gte: queryDate },
      });
      if (offDay) continue;

      // 4. Get Schedule (Override or Weekly)
      let schedule: {
        isWorkingDay: boolean;
        shifts: Array<{ startTime: string; endTime: string }>;
      } | null = await StylistDailyOverrideModel.findOne({
        stylistId: new mongoose.Types.ObjectId(stylistId),
        branchId: new mongoose.Types.ObjectId(branchId),
        date: queryDate,
      }).lean();

      if (!schedule) {
        schedule = await StylistWeeklyScheduleModel.findOne({
          stylistId: new mongoose.Types.ObjectId(stylistId),
          branchId: new mongoose.Types.ObjectId(branchId),
          dayOfWeek: queryDate.getUTCDay(),
        }).lean();
      }

      if (!schedule || !schedule.isWorkingDay || !schedule.shifts || schedule.shifts.length === 0)
        continue;

      // 5. Get Existing Bookings
      const bookings = await BookingModel.find({
        branchId: new mongoose.Types.ObjectId(branchId),
        stylistId: new mongoose.Types.ObjectId(stylistId),
        date: queryDate,
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.BLOCKED] },
      })
        .select('startTime endTime status')
        .lean();

      const stylistBreaks = breakMap.get(stylistId) || [];

      // 6. Generate Virtual Slots on Grid (15m increments)
      const requestedDuration = duration || 30; // Default to 30m if no duration provided
      const blocksNeeded = Math.ceil(requestedDuration / SLOT_GRID_SIZE);
      const slotDurationMinutes = blocksNeeded * SLOT_GRID_SIZE;

      for (const shift of schedule.shifts) {
        const start = this.timeToMinutes(shift.startTime);
        const end = this.timeToMinutes(shift.endTime);

        // Move by SLOT_GRID_SIZE (15m) increments
        for (let t = start; t + slotDurationMinutes <= end; t += SLOT_GRID_SIZE) {
          const slotStart = t;
          const slotEnd = t + slotDurationMinutes;

          // Check if ANY part of this duration overlaps with a break
          let overlapsWithBreak = false;
          for (const b of stylistBreaks) {
            const bStart = this.timeToMinutes(b.startTime);
            const bEnd = this.timeToMinutes(b.endTime);
            if (slotStart < bEnd && slotEnd > bStart) {
              overlapsWithBreak = true;
              break;
            }
          }
          if (overlapsWithBreak) continue;

          // Check if ANY part of this duration overlaps with an existing booking
          let overlapsWithBooking = false;
          let overlappedBookingStatus: BookingStatus | undefined;

          for (const booking of bookings) {
            const bStart = this.timeToMinutes(booking.startTime);
            const bEnd = this.timeToMinutes(booking.endTime);
            if (slotStart < bEnd && slotEnd > bStart) {
              overlapsWithBooking = true;
              overlappedBookingStatus = booking.status as BookingStatus;
              break;
            }
          }

          const startTimeStr = this.minutesToTime(slotStart);
          const endTimeStr = this.minutesToTime(slotEnd);
          let status: SlotStatus = SlotStatus.AVAILABLE;

          if (overlapsWithBooking) {
            if (overlappedBookingStatus === BookingStatus.BLOCKED) {
              status = SlotStatus.BLOCKED;
            } else {
              status = SlotStatus.BOOKED;
            }
          }

          // In "Available" mode, we only return AVAILABLE slots
          if (userIdOrStylistId && status !== SlotStatus.AVAILABLE) {
            // For customers, hide BOOKED slots.
            // But if it's an admin view, they might want all.
            // Currently, getAvailableSlots and getStylistSlots call this with userIdOrStylistId.
            // Let's only return AVAILABLE for now to match the "Selection" UI.
            continue;
          }

          const virtualId = `dynamic_${branchId}_${stylistId}_${queryDate.toISOString().split('T')[0]}_${startTimeStr}_${endTimeStr}`;

          allSlots.push({
            id: virtualId,
            branchId,
            stylistId,
            stylistName,
            stylistEmail,
            date: queryDate.toISOString(),
            startTime: startTimeStr,
            endTime: endTimeStr,
            startTimeUTC: new Date(queryDate.getTime() + slotStart * 60000).toISOString(),
            status,
            lockedBy: null,
            lockedUntil: null,
            createdAt: queryDate.toISOString(),
            updatedAt: queryDate.toISOString(),
          });
        }
      }
    }

    return allSlots;
  }

  async validateSlot(
    branchId: string,
    stylistId: string,
    date: Date,
    startTime: string,
    duration: number,
  ): Promise<boolean> {
    // Simply check if this specific slot exists in the available list
    const availableSlots = await this.getDynamicAvailability(branchId, date, stylistId, duration);
    return availableSlots.some(
      (s) => s.startTime === startTime && s.status === SlotStatus.AVAILABLE,
    );
  }
}
