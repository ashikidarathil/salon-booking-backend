import { injectable } from 'tsyringe';
import { ISlotRepository } from './ISlotRepository';
import { StylistModel, IStylist } from '../../../models/stylist.model';
import { StylistBranchModel, IStylistBranch } from '../../../models/stylistBranch.model';
import {
  StylistOffDayModel,
  IStylistOffDay,
  OffDayStatus,
} from '../../../models/stylistOffDay.model';
import {
  StylistDailyOverrideModel,
  IStylistDailyOverride,
} from '../../../models/stylistDailyOverride.model';
import {
  StylistWeeklyScheduleModel,
  IStylistWeeklySchedule,
} from '../../../models/stylistWeeklySchedule.model';
import { StylistBreakModel, IStylistBreak } from '../../../models/stylistBreak.model';
import { BookingModel, IBooking, BookingStatus } from '../../../models/booking.model';
import { BranchModel, IBranch } from '../../../models/branch.model';
import { BranchServiceModel, IBranchService } from '../../../models/branchService.model';
import {
  SpecialSlotModel,
  ISpecialSlot,
  SpecialSlotStatus,
} from '../../../models/specialSlot.model';
import { toObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class SlotRepository implements ISlotRepository {
  async findActiveStylistsByBranch(branchId: string): Promise<IStylistBranch[]> {
    return await StylistBranchModel.find({ branchId, isActive: true }).lean();
  }

  async findStylistsByIds(stylistIds: string[]): Promise<IStylist[]> {
    const objectIds = stylistIds.map((id) => toObjectId(id));
    return await StylistModel.find({ _id: { $in: objectIds } })
      .populate('userId', 'name email')
      .lean();
  }

  async findBranchById(branchId: string): Promise<IBranch | null> {
    return await BranchModel.findById(branchId).lean();
  }

  async findStylistBreaks(
    branchId: string,
    stylistIds: string[],
    dayOfWeek: number,
    date: Date,
  ): Promise<IStylistBreak[]> {
    const sIds = stylistIds.map((id) => toObjectId(id));
    return await StylistBreakModel.find({
      branchId: toObjectId(branchId),
      stylistId: { $in: sIds },
      $or: [{ dayOfWeek }, { date }],
    }).lean();
  }

  async findBookings(branchId: string, stylistIds: string[], date: Date): Promise<IBooking[]> {
    const sIds = stylistIds.map((id) => toObjectId(id));
    return await BookingModel.find({
      branchId: toObjectId(branchId),
      $or: [{ stylistId: { $in: sIds } }, { 'items.stylistId': { $in: sIds } }],
      date,
      status: {
        $in: [
          BookingStatus.CONFIRMED,
          BookingStatus.PENDING,
          BookingStatus.BLOCKED,
          BookingStatus.SPECIAL,
        ],
      },
    })
      .select('startTime endTime status items notes stylistId')
      .lean();
  }

  async findOffDays(stylistIds: string[], date: Date): Promise<IStylistOffDay[]> {
    const sIds = stylistIds.map((id) => toObjectId(id));
    return await StylistOffDayModel.find({
      stylistId: { $in: sIds },
      status: OffDayStatus.APPROVED,
      startDate: { $lte: new Date(date.getTime() + 86399999) },
      endDate: { $gte: date },
    }).lean();
  }

  async findDailyOverrides(
    branchId: string,
    stylistIds: string[],
    date: Date,
  ): Promise<IStylistDailyOverride[]> {
    const sIds = stylistIds.map((id) => toObjectId(id));
    return await StylistDailyOverrideModel.find({
      stylistId: { $in: sIds },
      branchId: toObjectId(branchId),
      date,
    }).lean();
  }

  async findWeeklySchedules(
    branchId: string,
    stylistIds: string[],
    dayOfWeek: number,
  ): Promise<IStylistWeeklySchedule[]> {
    const sIds = stylistIds.map((id) => toObjectId(id));
    return await StylistWeeklyScheduleModel.find({
      stylistId: { $in: sIds },
      branchId: toObjectId(branchId),
      dayOfWeek,
    }).lean();
  }

  async findBranchService(branchId: string, serviceId: string): Promise<IBranchService | null> {
    return await BranchServiceModel.findOne({ branchId, serviceId, isActive: true }).lean();
  }

  async findSpecialSlots(
    branchId: string,
    stylistIds: string[],
    date: Date,
  ): Promise<ISpecialSlot[]> {
    const sIds = stylistIds.map((id) => toObjectId(id));
    return await SpecialSlotModel.find({
      branchId: toObjectId(branchId),
      stylistId: { $in: sIds },
      date,
      status: SpecialSlotStatus.AVAILABLE,
    }).lean();
  }

  async findSpecialSlotById(id: string): Promise<ISpecialSlot | null> {
    return await SpecialSlotModel.findById(id).lean();
  }

  async updateSpecialSlot(id: string, data: Partial<ISpecialSlot>): Promise<ISpecialSlot | null> {
    return await SpecialSlotModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }
  async findStylistById(id: string): Promise<IStylist | null> {
    return await StylistModel.findById(id).populate('userId', 'name email').lean();
  }

  async findStylistByUserId(userId: string): Promise<IStylist | null> {
    return await StylistModel.findOne({ userId: toObjectId(userId) })
      .populate('userId', 'name email')
      .lean();
  }

  async createSpecialSlot(data: Partial<ISpecialSlot>): Promise<ISpecialSlot> {
    const slot = await SpecialSlotModel.create(data);
    return slot.toObject();
  }

  async findSpecialSlotsWithStylist(query: Record<string, unknown>): Promise<ISpecialSlot[]> {
    return (await SpecialSlotModel.find(query)
      .populate('stylistId')
      .sort({ date: 1, startTime: 1 })
      .lean()) as unknown as ISpecialSlot[];
  }

  async findActiveStylistIds(branchId: string): Promise<string[]> {
    const activeStylists = await StylistBranchModel.find({ branchId, isActive: true })
      .select('stylistId')
      .lean();
    return activeStylists.map((s) => s.stylistId.toString());
  }
}
