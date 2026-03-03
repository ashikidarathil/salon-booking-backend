import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ISlotRepository } from '../repository/ISlotRepository';
import { IBookingRepository } from '../../booking/repository/IBookingRepository';
import { ISlotValidator } from './ISlotValidator';
import { SpecialSlotStatus } from '../../../models/specialSlot.model';
import { timeToMinutes, minutesToTime } from './slot.helpers';
import { toObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class SlotValidator implements ISlotValidator {
  constructor(
    @inject(TOKENS.SlotRepository)
    private readonly slotRepo: ISlotRepository,
    @inject(TOKENS.BookingRepository)
    private readonly bookingRepo: IBookingRepository,
  ) {}

  timeToMinutes(time: string): number {
    return timeToMinutes(time);
  }

  minutesToTime(minutes: number): string {
    return minutesToTime(minutes);
  }

  async validateSlot(
    branchId: string,
    stylistId: string,
    date: Date,
    startTime: string,
    duration: number,
  ): Promise<boolean> {
    const startMin = this.timeToMinutes(startTime);
    const endMin = startMin + duration;

    const hasBookingOverlap = await this.checkBookingOverlap(stylistId, date, startMin, endMin);
    if (hasBookingOverlap) return false;

    const hasSpecialOverlap = await this.checkSpecialSlotOverlap(
      branchId,
      stylistId,
      date,
      startMin,
      endMin,
    );
    if (hasSpecialOverlap) return false;

    return true;
  }

  async checkSpecialSlotOverlap(
    branchId: string,
    stylistId: string,
    date: Date,
    newStartMin: number,
    newEndMin: number,
    excludeId?: string,
  ): Promise<boolean> {
    const query: Record<string, unknown> = {
      branchId: toObjectId(branchId),
      stylistId: toObjectId(stylistId),
      date,
      status: SpecialSlotStatus.AVAILABLE,
    };

    if (excludeId) {
      query._id = { $ne: toObjectId(excludeId) };
    }

    const specialSlots = await this.slotRepo.findSpecialSlotsWithStylist(query);

    for (const slot of specialSlots) {
      const existingStartMin = this.timeToMinutes(slot.startTime);
      const existingEndMin = this.timeToMinutes(slot.endTime);

      if (newStartMin < existingEndMin && newEndMin > existingStartMin) {
        return true;
      }
    }

    return false;
  }

  async checkBookingOverlap(
    stylistId: string,
    date: Date,
    newStartMin: number,
    newEndMin: number,
  ): Promise<boolean> {
    const existingBookings = await this.bookingRepo.find({
      stylistId: toObjectId(stylistId),
      date,
      status: { $nin: ['CANCELLED', 'RESCHEDULED', 'BLOCKED'] },
    });

    for (const b of existingBookings) {
      for (const item of b.items) {
        if (item.stylistId.toString() !== stylistId) continue;

        const bStartMin = this.timeToMinutes(item.startTime);
        const bEndMin = this.timeToMinutes(item.endTime);

        if (newStartMin < bEndMin && newEndMin > bStartMin) {
          return true;
        }
      }
    }

    return false;
  }
}
