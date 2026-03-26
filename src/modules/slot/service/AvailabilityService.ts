import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ISlotRepository } from '../repository/ISlotRepository';
import { IHolidayRepository } from '../../holiday/repository/IHolidayRepository';
import { ISlotValidator } from './ISlotValidator';
import { SlotResponseDto } from '../dto/slot.response.dto';
import { IAvailabilityService } from './IAvailabilityService';
import {
  SlotStatus,
  SLOT_GRID_SIZE,
  SLOT_PREFIXES,
  SLOT_LABELS,
} from '../constants/slot.constants';
import { BookingStatus, IBooking, IBookingItem } from '../../../models/booking.model';
import { toObjectId } from '../../../common/utils/mongoose.util';
import { IStylistOffDay } from '../../../models/stylistOffDay.model';
import { IStylistDailyOverride } from '../../../models/stylistDailyOverride.model';
import { IStylistWeeklySchedule, IShift } from '../../../models/stylistWeeklySchedule.model';
import { SALOON_TIMEZONE_OFFSET } from '../../../common/constants/app.constants';
import { resolveStylistId, timeToMinutes, minutesToTime } from './slot.helpers';
import { PopulatedStylist } from '../mapper/slot.mapper';
import { IStylistBreak } from '../../../models/stylistBreak.model';

interface BreakObject {
  startTime: string;
  endTime: string;
  description: string;
}

@injectable()
export class AvailabilityService implements IAvailabilityService {
  private readonly SALOON_OFFSET_MINS = SALOON_TIMEZONE_OFFSET;

  constructor(
    @inject(TOKENS.SlotRepository)
    private readonly slotRepo: ISlotRepository,
    @inject(TOKENS.HolidayRepository)
    private readonly holidayRepo: IHolidayRepository,
    @inject(TOKENS.SlotValidator)
    private readonly slotValidator: ISlotValidator,
  ) {}

  async getDynamicAvailability(
    branchId: string,
    date: Date,
    userIdOrStylistId?: string,
    duration?: number,
    includeAll: boolean = false,
    serviceId?: string,
  ): Promise<SlotResponseDto[]> {
    if (serviceId && !duration) {
      const branchService = await this.slotRepo.findBranchService(branchId, serviceId);
      if (branchService) {
        duration = branchService.duration;
      }
    }

    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    const nowBoundary = new Date();
    nowBoundary.setUTCHours(0, 0, 0, 0);
    const maxDate = new Date(nowBoundary.getTime() + 14 * 24 * 60 * 60 * 1000);

    if (queryDate < nowBoundary || queryDate > maxDate) {
      return [];
    }

    const realNow = new Date();
    const saloonNow = new Date(realNow.getTime() + this.SALOON_OFFSET_MINS * 60000);
    const currentSaloonMinutes = saloonNow.getUTCHours() * 60 + saloonNow.getUTCMinutes();
    const saloonDateStr =
      saloonNow.getUTCFullYear() +
      '-' +
      String(saloonNow.getUTCMonth() + 1).padStart(2, '0') +
      '-' +
      String(saloonNow.getUTCDate()).padStart(2, '0');

    let stylistIds: string[] = [];
    if (userIdOrStylistId) {
      const resolved = await resolveStylistId(userIdOrStylistId, this.slotRepo);
      stylistIds = [resolved];
    } else {
      stylistIds = await this.slotRepo.findActiveStylistIds(branchId);
    }

    if (stylistIds.length === 0) return [];

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

    const stylistInfoMap = new Map<string, PopulatedStylist>(
      stylistsData.map((s) => [s._id.toString(), s as unknown as PopulatedStylist]),
    );
    const defaultBreaks: BreakObject[] = branchData?.defaultBreaks || [
      { startTime: '13:00', endTime: '14:00', description: SLOT_LABELS.LUNCH_BREAK },
      { startTime: '16:00', endTime: '16:30', description: SLOT_LABELS.TEA_BREAK },
    ];

    const breakMap = new Map<string, BreakObject[]>();
    customBreaks.forEach((b: IStylistBreak) => {
      const sid = b.stylistId.toString();
      if (!breakMap.has(sid)) breakMap.set(sid, []);
      breakMap.get(sid)?.push({
        startTime: b.startTime,
        endTime: b.endTime,
        description: b.description || SLOT_LABELS.GENERIC_BREAK,
      });
    });

    const bookingMap = new Map<string, IBooking[]>();
    allBookings.forEach((b: IBooking) => {
      const sid = b.stylistId.toString();
      if (!bookingMap.has(sid)) bookingMap.set(sid, []);
      bookingMap.get(sid)?.push(b);

      b.items?.forEach((item: IBookingItem) => {
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

    const holiday = holidays[0];
    if (holiday) {
      return [
        {
          id: `${SLOT_PREFIXES.HOLIDAY}${branchId}_${queryDate.toISOString().split('T')[0]}`,
          branchId,
          stylistId: SLOT_LABELS.SYSTEM,
          stylistName: SLOT_LABELS.SYSTEM,
          stylistEmail: '',
          date: queryDate.toISOString(),
          startTime: '00:00',
          endTime: '23:59',
          startTimeUTC: queryDate.toISOString(),
          status: SlotStatus.HOLIDAY,
          note: `${SLOT_LABELS.HOLIDAY_PREFIX}${holiday.name}`,
          createdAt: queryDate.toISOString(),
          updatedAt: queryDate.toISOString(),
        },
      ];
    }

    const allSlots: SlotResponseDto[] = [];
    const requestedDuration = duration || SLOT_GRID_SIZE;

    for (const stylistId of stylistIds) {
      const stylistData = stylistInfoMap.get(stylistId);
      const stylistName = stylistData?.userId?.name || SLOT_LABELS.UNKNOWN;
      const stylistEmail = stylistData?.userId?.email || '';

      const offDay = offDayMap.get(stylistId);
      const schedule = (overrideMap.get(stylistId) || weeklyScheduleMap.get(stylistId)) as
        | IStylistDailyOverride
        | IStylistWeeklySchedule
        | undefined;

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

      const shifts = (schedule.shifts || []) as IShift[];
      const stylistBreaks = breakMap.get(stylistId)?.length
        ? breakMap.get(stylistId)
        : defaultBreaks;
      const bookingsForStylist = bookingMap.get(stylistId) || [];

      for (const shift of shifts) {
        const start = timeToMinutes(shift.startTime);
        const end = timeToMinutes(shift.endTime);

        for (let t = start; t + requestedDuration <= end; t += SLOT_GRID_SIZE) {
          const slotStart = t;
          const slotEnd = t + requestedDuration;
          const startTimeStr = minutesToTime(slotStart);
          const endTimeStr = minutesToTime(slotEnd);
          const virtualId = `${SLOT_PREFIXES.DYNAMIC}${branchId}_${stylistId}_${queryDate.toISOString().split('T')[0]}_${startTimeStr}_${endTimeStr}`;

          const isBreak = stylistBreaks!.some((b: BreakObject) => {
            const bStart = timeToMinutes(b.startTime);
            const bEnd = timeToMinutes(b.endTime);
            return slotStart < bEnd && slotEnd > bStart;
          });

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

          let status = SlotStatus.AVAILABLE;
          let note: string | undefined;

          // Check if a CANCELLED (blocked) special slot covers this time slot
          const blockedSpecialSlot = allSpecialSlots.find((ss) => {
            if (ss.stylistId.toString() !== stylistId) return false;
            const ssStart = timeToMinutes(ss.startTime);
            const ssEnd = timeToMinutes(ss.endTime);
            return ss.status === 'CANCELLED' && slotStart < ssEnd && slotEnd > ssStart;
          });

          if (blockedSpecialSlot) {
            status = SlotStatus.BLOCKED;
            note = blockedSpecialSlot.note || SLOT_LABELS.BLOCKED_NOTE;
          } else {
            for (const b of bookingsForStylist) {
              const isBlocked = b.status === BookingStatus.BLOCKED;
              const bookingIntervals = isBlocked
                ? [
                    {
                      start: timeToMinutes(b.startTime),
                      end: timeToMinutes(b.endTime),
                    },
                  ]
                : (b.items || [])
                    .filter((i: IBookingItem) => i.stylistId.toString() === stylistId)
                    .map((i: IBookingItem) => ({
                      start: timeToMinutes(i.startTime),
                      end: timeToMinutes(i.endTime),
                    }));

              const overlapped = bookingIntervals.some(
                (interval: { start: number; end: number }) =>
                  slotStart < interval.end && slotEnd > interval.start,
              );
              if (overlapped) {
                status = isBlocked ? SlotStatus.BLOCKED : SlotStatus.BOOKED;
                note = b.notes || (isBlocked ? SLOT_LABELS.BLOCKED_NOTE : undefined);
                break;
              }
            }
          }

          if (!includeAll && userIdOrStylistId && status !== SlotStatus.AVAILABLE) continue;

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

    allSpecialSlots.forEach((ss) => {
      const ssStart = timeToMinutes(ss.startTime);
      const ssEnd = timeToMinutes(ss.endTime);
      const reqDuration = duration || 0;
      if (reqDuration > ssEnd - ssStart) return;

      const sid = ss.stylistId.toString();
      const stylistData = stylistInfoMap.get(sid);
      if (!stylistData) return;

      const bookingsForStylist = bookingMap.get(sid) || [];
      let currentStatus = SlotStatus.SPECIAL as SlotStatus;

      for (const b of bookingsForStylist) {
        const intervals =
          b.status === BookingStatus.BLOCKED
            ? [
                {
                  start: timeToMinutes(b.startTime),
                  end: timeToMinutes(b.endTime),
                },
              ]
            : (b.items || [])
                .filter((i: IBookingItem) => i.stylistId.toString() === sid)
                .map((i: IBookingItem) => ({
                  start: timeToMinutes(i.startTime),
                  end: timeToMinutes(i.endTime),
                }));

        if (intervals.some((interval) => ssStart < interval.end && ssEnd > interval.start)) {
          currentStatus = SlotStatus.BOOKED;
          break;
        }
      }

      allSlots.push({
        id: `${SLOT_PREFIXES.SPECIAL}${ss._id}`,
        branchId,
        stylistId: sid,
        stylistName: stylistData.userId?.name || SLOT_LABELS.UNKNOWN,
        stylistEmail: stylistData.userId?.email || '',
        date: queryDate.toISOString(),
        startTime: ss.startTime,
        endTime: ss.endTime,
        startTimeUTC: new Date(queryDate.getTime() + ssStart * 60000).toISOString(),
        status: currentStatus,
        price: ss.price,
        note: ss.note,
        createdAt: ss.createdAt.toISOString(),
        updatedAt: ss.updatedAt.toISOString(),
      });
    });

    return allSlots.sort((a, b) => a.startTime.trim().localeCompare(b.startTime.trim()));
  }
}
