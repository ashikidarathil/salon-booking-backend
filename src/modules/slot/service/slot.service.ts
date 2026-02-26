import { SlotResponseDto } from '../dto/slot.response.dto';
import { ISlotService } from './ISlotService';
import { IHolidayRepository } from '../../holiday/repository/IHolidayRepository';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { SLOT_MESSAGES } from '../constants/slot.messages';
import { SlotStatus, SLOT_GRID_SIZE } from '../constants/slot.constants';
import { IStylist, StylistModel } from '../../../models/stylist.model';
import { StylistBranchModel } from '../../../models/stylistBranch.model';
import { BookingModel, BookingStatus, IBooking } from '../../../models/booking.model';
import { IStylistBreak } from '../../../models/stylistBreak.model';

import {
  IStylistOffDay,
  OffDayStatus,
  StylistOffDayModel,
} from '../../../models/stylistOffDay.model';
import {
  IStylistDailyOverride,
  StylistDailyOverrideModel,
} from '../../../models/stylistDailyOverride.model';
import {
  IStylistWeeklySchedule,
  StylistWeeklyScheduleModel,
} from '../../../models/stylistWeeklySchedule.model';
import { ISlotRepository } from '../repository/ISlotRepository';
import { toObjectId, isValidObjectId } from '../../../common/utils/mongoose.util';
import {
  ISpecialSlot,
  SpecialSlotModel,
  SpecialSlotStatus,
} from '../../../models/specialSlot.model';
import mongoose, { QueryFilter } from 'mongoose';

interface PopulatedStylist {
  _id: mongoose.Types.ObjectId;
  userId?: {
    name: string;
    email: string;
  };
}

interface PopulatedBookingItem {
  serviceId: {
    _id: mongoose.Types.ObjectId;
    name: string;
  };
}

interface PopulatedBooking {
  _id: mongoose.Types.ObjectId;
  items: PopulatedBookingItem[];
}

interface PopulatedSpecialSlot {
  _id: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  stylistId: PopulatedStylist;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  note?: string;
  bookingId?: PopulatedBooking;
  createdAt: Date;
  updatedAt: Date;
}

@injectable()
export class SlotService implements ISlotService {
  constructor(
    @inject(TOKENS.HolidayRepository)
    private readonly holidayRepo: IHolidayRepository,
    @inject(TOKENS.SlotRepository)
    private readonly slotRepo: ISlotRepository,
  ) {}

  // Saloon Timezone Offset (IST = +5:30)
  private readonly SALOON_OFFSET_MINS = 330;

  // Helper to resolve user ID to stylist ID
  private async resolveStylistId(userIdOrStylistId: string): Promise<string> {
    if (!isValidObjectId(userIdOrStylistId)) {
      return userIdOrStylistId;
    }

    const stylistByUserId = await StylistModel.findOne({ userId: userIdOrStylistId })
      .select('_id')
      .lean();

    const result =
      stylistByUserId && stylistByUserId._id ? stylistByUserId._id.toString() : userIdOrStylistId;
    return result;
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

  async blockSlot(slotId: string, reason?: string): Promise<SlotResponseDto> {
    if (!slotId.startsWith('dynamic_')) {
      throw new AppError(SLOT_MESSAGES.LEGACY_UNSUPPORTED, HttpStatus.BAD_REQUEST);
    }

    const parts = slotId.split('_');
    const branchId = parts[1];
    const stylistId = parts[2];
    const dateString = parts[3];
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    const startTime = parts[4];
    const endTime = parts[5];

    // [VALIDATION] Ensure the slot is at least 30 minutes in the future (Saloon Time)
    const now = new Date();
    const slotStartTimeMinutes = this.timeToMinutes(startTime);
    const saloonNow = new Date(now.getTime() + this.SALOON_OFFSET_MINS * 60000);
    const currentSaloonMinutes = saloonNow.getUTCHours() * 60 + saloonNow.getUTCMinutes();
    const saloonDateStr =
      saloonNow.getUTCFullYear() +
      '-' +
      String(saloonNow.getUTCMonth() + 1).padStart(2, '0') +
      '-' +
      String(saloonNow.getUTCDate()).padStart(2, '0');

    const bufferMinutes = 30;
    const isToday = dateString === saloonDateStr;

    if (isToday && slotStartTimeMinutes < currentSaloonMinutes + bufferMinutes) {
      throw new AppError(SLOT_MESSAGES.BLOCK_LEAD_TIME, HttpStatus.BAD_REQUEST);
    }

    // Create a BLOCKED booking
    await BookingModel.create({
      userId: toObjectId('000000000000000000000000'),
      branchId: toObjectId(branchId),
      stylistId: toObjectId(stylistId),
      date,
      startTime,
      endTime,
      status: BookingStatus.BLOCKED,
      totalPrice: 0,
      notes: reason || 'Admin blocked',
    });

    return {
      id: slotId,
      branchId,
      stylistId,
      date: date.toISOString(),
      startTime,
      endTime,
      startTimeUTC: date.toISOString(),
      status: SlotStatus.BLOCKED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as SlotResponseDto;
  }

  async createSpecialSlot(dto: {
    stylistId: string;
    branchId: string;
    date: string;
    startTime: string;
    endTime: string;
    note?: string;
    serviceId?: string;
    createdBy?: string;
  }): Promise<SlotResponseDto> {
    const {
      stylistId: rawStylistId,
      branchId,
      date: dateStr,
      startTime,
      endTime,
      note,
      createdBy,
    } = dto;

    const resolvedStylistId = await this.resolveStylistId(rawStylistId);

    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    // ─── Day-Status Validation ───
    // 1. Check holiday
    const holiday = await this.holidayRepo.findOne({
      $or: [{ branchId: null, isAllBranches: true }, { branchId: toObjectId(branchId) }],
      date,
    });
    if (holiday) {
      throw new AppError(SLOT_MESSAGES.SPECIAL_HOLIDAY(holiday.name), HttpStatus.BAD_REQUEST);
    }

    // 2. Check off-day
    const offDay = await StylistOffDayModel.findOne({
      stylistId: toObjectId(resolvedStylistId),
      status: OffDayStatus.APPROVED,
      startDate: { $lte: new Date(date.getTime() + 86399999) },
      endDate: { $gte: date },
    }).lean();
    if (offDay) {
      throw new AppError(SLOT_MESSAGES.SPECIAL_OFF_DAY, HttpStatus.BAD_REQUEST);
    }

    // 3. Check weekly schedule / daily override
    const dayOfWeek = date.getUTCDay();
    const [override, weeklySchedule] = await Promise.all([
      StylistDailyOverrideModel.findOne({
        stylistId: toObjectId(resolvedStylistId),
        branchId: toObjectId(branchId),
        date,
      }).lean(),
      StylistWeeklyScheduleModel.findOne({
        stylistId: toObjectId(resolvedStylistId),
        branchId: toObjectId(branchId),
        dayOfWeek,
      }).lean(),
    ]);
    const effectiveSchedule = override || weeklySchedule;

    if (!effectiveSchedule) {
      throw new AppError(SLOT_MESSAGES.SPECIAL_NO_SCHEDULE, HttpStatus.BAD_REQUEST);
    }
    if (!effectiveSchedule.isWorkingDay) {
      throw new AppError(SLOT_MESSAGES.SPECIAL_NON_WORKING, HttpStatus.BAD_REQUEST);
    }

    // ─── Create Special Slot (AVAILABLE) ───
    const specialSlot = await SpecialSlotModel.create({
      branchId: toObjectId(branchId),
      stylistId: toObjectId(resolvedStylistId),
      date,
      startTime,
      endTime,
      price: 0, // Customer picks their own service
      status: SpecialSlotStatus.AVAILABLE,
      note: note || 'Special slot created by stylist/admin',
      createdBy: toObjectId(createdBy || '000000000000000000000000'),
    });

    return {
      id: `special_${specialSlot._id}`,
      branchId,
      stylistId: resolvedStylistId,
      date: date.toISOString(),
      startTime,
      endTime,
      startTimeUTC: date.toISOString(),
      status: SlotStatus.SPECIAL,
      price: 0,
      note: specialSlot.note,
      createdAt: specialSlot.createdAt.toISOString(),
      updatedAt: specialSlot.updatedAt.toISOString(),
    } as SlotResponseDto;
  }

  async unblockSlot(slotId: string): Promise<SlotResponseDto> {
    if (!slotId.startsWith('dynamic_')) {
      throw new AppError(SLOT_MESSAGES.LEGACY_UNSUPPORTED, HttpStatus.BAD_REQUEST);
    }

    const parts = slotId.split('_');
    const branchId = parts[1];
    const stylistId = parts[2];
    const dateString = parts[3];
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    const startTime = parts[4];

    // [VALIDATION] Ensure the slot is at least 30 minutes in the future (Saloon Time)
    const now = new Date();
    const slotStartTimeMinutes = this.timeToMinutes(startTime);
    const saloonNow = new Date(now.getTime() + this.SALOON_OFFSET_MINS * 60000);
    const currentSaloonMinutes = saloonNow.getUTCHours() * 60 + saloonNow.getUTCMinutes();
    const saloonDateStr =
      saloonNow.getUTCFullYear() +
      '-' +
      String(saloonNow.getUTCMonth() + 1).padStart(2, '0') +
      '-' +
      String(saloonNow.getUTCDate()).padStart(2, '0');

    const bufferMinutes = 30;
    const isToday = dateString === saloonDateStr;

    if (isToday && slotStartTimeMinutes < currentSaloonMinutes + bufferMinutes) {
      throw new AppError(SLOT_MESSAGES.UNBLOCK_LEAD_TIME, HttpStatus.BAD_REQUEST);
    }

    await BookingModel.deleteOne({
      branchId: toObjectId(branchId),
      stylistId: toObjectId(stylistId),
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
    includeAll: boolean = false,
    serviceId?: string,
  ): Promise<SlotResponseDto[]> {
    // 0. Resolve Duration if serviceId provided
    if (serviceId && !duration) {
      const branchService = await this.slotRepo.findBranchService(branchId, serviceId);
      if (branchService) {
        duration = branchService.duration;
      }
    }

    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    // Enforce Booking Window
    const nowBoundary = new Date();
    nowBoundary.setUTCHours(0, 0, 0, 0);
    const maxDate = new Date(nowBoundary.getTime() + 14 * 24 * 60 * 60 * 1000);

    if (queryDate < nowBoundary || queryDate > maxDate) {
      return [];
    }

    // Pre-calculate saloon current time for filtering today's slots
    const realNow = new Date();
    const saloonNow = new Date(realNow.getTime() + this.SALOON_OFFSET_MINS * 60000);
    const currentSaloonMinutes = saloonNow.getUTCHours() * 60 + saloonNow.getUTCMinutes();
    const saloonDateStr =
      saloonNow.getUTCFullYear() +
      '-' +
      String(saloonNow.getUTCMonth() + 1).padStart(2, '0') +
      '-' +
      String(saloonNow.getUTCDate()).padStart(2, '0');

    // 1. Get Target Stylists
    let stylistIds: string[] = [];
    if (userIdOrStylistId) {
      const resolved = await this.resolveStylistId(userIdOrStylistId);
      stylistIds = [resolved];
    } else {
      const activeStylists = await StylistBranchModel.find({ branchId, isActive: true }).select(
        'stylistId',
      );
      stylistIds = activeStylists.map((s) => s.stylistId.toString());
    }

    const validStylistObjectIds = stylistIds
      .filter((id) => isValidObjectId(id))
      .map((id) => toObjectId(id));

    if (validStylistObjectIds.length === 0) return [];

    // 2. Batch Fetch All Required Data
    const [
      stylistsData,
      branchData,
      customBreaks,
      allBookings,
      allOffDays,
      allOverrides,
      allWeeklySchedules,
      holidays,
      allSpecialSlots,
    ] = await Promise.all([
      this.slotRepo.findStylistsByIds(stylistIds),
      this.slotRepo.findBranchById(branchId),
      this.slotRepo.findStylistBreaks(branchId, stylistIds, queryDate.getUTCDay(), queryDate),
      this.slotRepo.findBookings(branchId, stylistIds, queryDate),
      this.slotRepo.findOffDays(stylistIds, queryDate),
      this.slotRepo.findDailyOverrides(branchId, stylistIds, queryDate),
      this.slotRepo.findWeeklySchedules(branchId, stylistIds, queryDate.getUTCDay()),
      this.holidayRepo.find({
        $or: [{ branchId: null, isAllBranches: true }, { branchId: toObjectId(branchId) }],
        date: queryDate,
      }),
      this.slotRepo.findSpecialSlots(branchId, stylistIds, queryDate),
    ]);

    // 3. Create Lookup Maps
    const stylistInfoMap = new Map(stylistsData.map((s) => [s._id.toString(), s]));
    const defaultBreaks = branchData?.defaultBreaks || [
      { startTime: '13:00', endTime: '14:00', description: 'Lunch Break' },
      { startTime: '16:00', endTime: '16:30', description: 'Tea Break' },
    ];

    const breakMap = new Map<string, IStylistBreak[]>();
    customBreaks.forEach((b) => {
      const sid = b.stylistId.toString();
      if (!breakMap.has(sid)) breakMap.set(sid, []);
      breakMap.get(sid)?.push(b);
    });

    const bookingMap = new Map<string, IBooking[]>();
    allBookings.forEach((b) => {
      const sid = b.stylistId.toString();
      if (!bookingMap.has(sid)) bookingMap.set(sid, []);
      bookingMap.get(sid)?.push(b);

      b.items?.forEach((item) => {
        const itemSid = item.stylistId.toString();
        if (itemSid !== sid) {
          if (!bookingMap.has(itemSid)) bookingMap.set(itemSid, []);
          bookingMap.get(itemSid)?.push(b);
        }
      });
    });

    const offDayMap = new Map<string, IStylistOffDay>(
      allOffDays.map((od) => [od.stylistId.toString(), od]),
    );
    const overrideMap = new Map<string, IStylistDailyOverride>(
      allOverrides.map((o) => [o.stylistId.toString(), o]),
    );
    const weeklyScheduleMap = new Map<string, IStylistWeeklySchedule>(
      allWeeklySchedules.map((ws) => [ws.stylistId.toString(), ws]),
    );

    // 3.1 Check for Holidays
    const holiday = holidays[0]; // Assuming one holiday per date/branch pair as enforced by index
    if (holiday) {
      return [
        {
          id: `holiday_${branchId}_${queryDate.toISOString().split('T')[0]}`,
          branchId,
          stylistId: 'SYSTEM',
          stylistName: 'SYSTEM',
          stylistEmail: '',
          date: queryDate.toISOString(),
          startTime: '00:00',
          endTime: '23:59',
          startTimeUTC: queryDate.toISOString(),
          status: SlotStatus.HOLIDAY,
          note: `HOLIDAY: ${holiday.name}`,
          createdAt: queryDate.toISOString(),
          updatedAt: queryDate.toISOString(),
        },
      ];
    }

    const allSlots: SlotResponseDto[] = [];
    const requestedDuration = duration || SLOT_GRID_SIZE;

    // 4. Generate Slots
    for (const stylistId of stylistIds) {
      const stylistData = stylistInfoMap.get(stylistId) as
        | (IStylist & { userId: { name: string; email?: string } })
        | undefined;
      const stylistName = stylistData?.userId?.name || 'Unknown';
      const stylistEmail = stylistData?.userId?.email || '';

      const offDay = offDayMap.get(stylistId);
      const schedule = overrideMap.get(stylistId) || weeklyScheduleMap.get(stylistId);

      if (offDay || !schedule || !schedule.isWorkingDay) {
        if (includeAll || userIdOrStylistId) {
          let status = SlotStatus.NON_WORKING;
          if (offDay) status = SlotStatus.OFF_DAY;
          else if (!schedule) status = SlotStatus.NO_SCHEDULE;

          allSlots.push({
            id: `status_${branchId}_${stylistId}_${queryDate.toISOString().split('T')[0]}`,
            branchId,
            stylistId,
            stylistName,
            stylistEmail,
            date: queryDate.toISOString(),
            startTime: '00:00',
            endTime: '23:59',
            startTimeUTC: queryDate.toISOString(),
            status,
            createdAt: queryDate.toISOString(),
            updatedAt: queryDate.toISOString(),
          });
        }
        continue;
      }

      const shifts = schedule.shifts || [];
      const stylistBreaks = breakMap.get(stylistId)?.length
        ? breakMap.get(stylistId)
        : defaultBreaks;
      const bookingsForStylist = bookingMap.get(stylistId) || [];

      for (const shift of shifts) {
        const start = this.timeToMinutes(shift.startTime);
        const end = this.timeToMinutes(shift.endTime);

        for (let t = start; t + requestedDuration <= end; t += SLOT_GRID_SIZE) {
          const slotStart = t;
          const slotEnd = t + requestedDuration;
          const startTimeStr = this.minutesToTime(slotStart);
          const endTimeStr = this.minutesToTime(slotEnd);
          const virtualId = `dynamic_${branchId}_${stylistId}_${queryDate.toISOString().split('T')[0]}_${startTimeStr}_${endTimeStr}`;

          // Check Breaks
          const isBreak = stylistBreaks!.some(
            (b: IStylistBreak | { startTime: string; endTime: string }) => {
              const bStart = this.timeToMinutes(b.startTime);
              const bEnd = this.timeToMinutes(b.endTime);
              return slotStart < bEnd && slotEnd > bStart;
            },
          );

          if (isBreak) {
            if (includeAll) {
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
                status: SlotStatus.BREAK,
                createdAt: queryDate.toISOString(),
                updatedAt: queryDate.toISOString(),
              });
            }
            continue;
          }

          // Check Bookings
          let status = SlotStatus.AVAILABLE;
          let note: string | undefined;

          for (const b of bookingsForStylist) {
            // All bookings (including SPECIAL) now block normal slots
            const isBlocked = b.status === BookingStatus.BLOCKED;
            const bookingIntervals = isBlocked
              ? [{ start: this.timeToMinutes(b.startTime), end: this.timeToMinutes(b.endTime) }]
              : (b.items || [])
                  .filter((i) => i.stylistId.toString() === stylistId)
                  .map((i) => ({
                    start: this.timeToMinutes(i.startTime),
                    end: this.timeToMinutes(i.endTime),
                  }));

            const overlapped = bookingIntervals.some(
              (interval: { start: number; end: number }) =>
                slotStart < interval.end && slotEnd > interval.start,
            );
            if (overlapped) {
              status = isBlocked ? SlotStatus.BLOCKED : SlotStatus.BOOKED;
              note = b.notes || (isBlocked ? 'Blocked' : undefined);
              break;
            }
          }

          if (!includeAll && userIdOrStylistId && status !== SlotStatus.AVAILABLE) continue;

          // Past Slot Filter
          if (
            queryDate.toISOString().split('T')[0] === saloonDateStr &&
            slotStart < currentSaloonMinutes + 30
          )
            continue;

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
            note,
            createdAt: queryDate.toISOString(),
            updatedAt: queryDate.toISOString(),
          });
        }
      }
    }

    // 5. Inject Special Slots
    allSpecialSlots.forEach((ss) => {
      // Check if duration fits
      const ssStart = this.timeToMinutes(ss.startTime);
      const ssEnd = this.timeToMinutes(ss.endTime);
      const requestedDuration = duration || 0;
      if (requestedDuration > ssEnd - ssStart) return;

      const sid = ss.stylistId.toString();
      const stylistData = stylistInfoMap.get(sid);
      if (!stylistData) return;

      // Check if this special slot overlaps with ANY existing booking for this stylist
      const bookingsForStylist = bookingMap.get(sid) || [];
      let currentStatus = SlotStatus.SPECIAL as SlotStatus;

      for (const b of bookingsForStylist) {
        const intervals =
          b.status === BookingStatus.BLOCKED
            ? [{ start: this.timeToMinutes(b.startTime), end: this.timeToMinutes(b.endTime) }]
            : (b.items || [])
                .filter((i) => i.stylistId.toString() === sid)
                .map((i) => ({
                  start: this.timeToMinutes(i.startTime),
                  end: this.timeToMinutes(i.endTime),
                }));

        if (intervals.some((interval) => ssStart < interval.end && ssEnd > interval.start)) {
          currentStatus = SlotStatus.BOOKED; // Special slot is blocked by another booking
          break;
        }
      }

      allSlots.push({
        id: `special_${ss._id}`,
        branchId,
        stylistId: sid,
        stylistName: (stylistData as unknown as PopulatedStylist)?.userId?.name || 'Unknown',
        stylistEmail: (stylistData as unknown as PopulatedStylist)?.userId?.email || '',
        date: queryDate.toISOString(),
        startTime: ss.startTime,
        endTime: ss.endTime,
        startTimeUTC: new Date(
          queryDate.getTime() + this.timeToMinutes(ss.startTime) * 60000,
        ).toISOString(),
        status: currentStatus,
        price: ss.price,
        note: ss.note,
        createdAt: ss.createdAt.toISOString(),
        updatedAt: ss.updatedAt.toISOString(),
      });
    });

    return allSlots.sort((a, b) => a.startTime.trim().localeCompare(b.startTime.trim()));
  }

  async validateSlot(
    branchId: string,
    stylistId: string,
    date: Date,
    startTime: string,
    duration: number,
  ): Promise<boolean> {
    const availableSlots = await this.getDynamicAvailability(branchId, date, stylistId, duration);
    return availableSlots.some(
      (s) =>
        s.startTime === startTime &&
        (s.status === SlotStatus.AVAILABLE || s.status === SlotStatus.SPECIAL),
    );
  }

  async listSpecialSlots(filter: {
    branchId?: string;
    stylistId?: string;
    date?: string;
    status?: string;
  }): Promise<SlotResponseDto[]> {
    const query: QueryFilter<ISpecialSlot> = {};
    if (filter.branchId) query.branchId = toObjectId(filter.branchId);

    if (filter.stylistId) {
      const resolvedId = await this.resolveStylistId(filter.stylistId);
      query.stylistId = toObjectId(resolvedId);
    }

    if (filter.date) {
      const d = new Date(filter.date);
      d.setUTCHours(0, 0, 0, 0);
      query.date = d;
    }
    if (filter.status) query.status = filter.status;

    const specialSlots = await SpecialSlotModel.find(query)
      .populate({
        path: 'stylistId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'bookingId',
        select: 'items',
        populate: { path: 'items.serviceId', select: 'name' },
      })
      .sort({ startTime: 1 })
      .lean();

    return (specialSlots as unknown as PopulatedSpecialSlot[]).map((ss) => {
      const bookedServices =
        ss.bookingId?.items?.map((item) =>
          typeof item.serviceId === 'object' ? item.serviceId.name : 'Unknown Service',
        ) || [];

      return {
        id: `special_${ss._id}`,
        branchId: ss.branchId.toString(),
        stylistId: ss.stylistId._id?.toString() || ss.stylistId.toString(),
        date: ss.date.toISOString(),
        startTime: ss.startTime,
        endTime: ss.endTime,
        startTimeUTC: ss.date.toISOString(),
        status: ss.status as SlotStatus, // Return actual status (AVAILABLE/BOOKED/CANCELLED)
        price: ss.price,
        note: ss.note,
        stylistName: ss.stylistId?.userId?.name || 'Unknown',
        stylistEmail: ss.stylistId?.userId?.email || '',
        bookedServices, // List of user-selected services
        createdAt: ss.createdAt.toISOString(),
        updatedAt: ss.updatedAt.toISOString(),
      };
    });
  }

  async cancelSpecialSlot(id: string): Promise<SlotResponseDto> {
    const updated = await SpecialSlotModel.findByIdAndUpdate(
      id,
      { status: SpecialSlotStatus.CANCELLED },
      { new: true },
    )
      .populate({
        path: 'stylistId',
        populate: { path: 'userId', select: 'name email' },
      })
      .lean();

    if (!updated) {
      throw new AppError('Special slot not found', HttpStatus.NOT_FOUND);
    }

    const ss = updated as unknown as PopulatedSpecialSlot;
    return {
      id: `special_${ss._id}`,
      branchId: ss.branchId.toString(),
      stylistId: ss.stylistId._id?.toString() || ss.stylistId.toString(),
      date: ss.date.toISOString(),
      startTime: ss.startTime,
      endTime: ss.endTime,
      startTimeUTC: ss.date.toISOString(),
      status: ss.status as SlotStatus,
      price: ss.price,
      note: ss.note,
      stylistName: ss.stylistId?.userId?.name || 'Unknown',
      stylistEmail: ss.stylistId?.userId?.email || '',
      createdAt: ss.createdAt.toISOString(),
      updatedAt: ss.updatedAt.toISOString(),
    };
  }
}
