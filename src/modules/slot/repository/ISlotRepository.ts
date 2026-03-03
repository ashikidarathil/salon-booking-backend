import { IStylist } from '../../../models/stylist.model';
import { IStylistBranch } from '../../../models/stylistBranch.model';
import { IStylistOffDay } from '../../../models/stylistOffDay.model';
import { IStylistDailyOverride } from '../../../models/stylistDailyOverride.model';
import { IStylistWeeklySchedule } from '../../../models/stylistWeeklySchedule.model';
import { IStylistBreak } from '../../../models/stylistBreak.model';
import { IBooking } from '../../../models/booking.model';
import { IBranch } from '../../../models/branch.model';
import { IBranchService } from '../../../models/branchService.model';
import { ISpecialSlot } from '../../../models/specialSlot.model';

export interface ISlotRepository {
  findActiveStylistsByBranch(branchId: string): Promise<IStylistBranch[]>;
  findStylistsByIds(stylistIds: string[]): Promise<IStylist[]>;
  findBranchById(branchId: string): Promise<IBranch | null>;
  findStylistBreaks(
    branchId: string,
    stylistIds: string[],
    dayOfWeek: number,
    date: Date,
  ): Promise<IStylistBreak[]>;
  findBookings(branchId: string, stylistIds: string[], date: Date): Promise<IBooking[]>;
  findOffDays(stylistIds: string[], date: Date): Promise<IStylistOffDay[]>;
  findDailyOverrides(
    branchId: string,
    stylistIds: string[],
    date: Date,
  ): Promise<IStylistDailyOverride[]>;
  findWeeklySchedules(
    branchId: string,
    stylistIds: string[],
    dayOfWeek: number,
  ): Promise<IStylistWeeklySchedule[]>;
  findBranchService(branchId: string, serviceId: string): Promise<IBranchService | null>;
  findSpecialSlots(branchId: string, stylistIds: string[], date: Date): Promise<ISpecialSlot[]>;
  findSpecialSlotById(id: string): Promise<ISpecialSlot | null>;
  updateSpecialSlot(id: string, data: Partial<ISpecialSlot>): Promise<ISpecialSlot | null>;
  findStylistById(id: string): Promise<IStylist | null>;
  findStylistByUserId(userId: string): Promise<IStylist | null>;
  createSpecialSlot(data: Partial<ISpecialSlot>): Promise<ISpecialSlot>;
  findSpecialSlotsWithStylist(query: Record<string, unknown>): Promise<ISpecialSlot[]>;
  findActiveStylistIds(branchId: string): Promise<string[]>;
}
