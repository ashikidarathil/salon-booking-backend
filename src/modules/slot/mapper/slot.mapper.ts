import { SlotStatus } from '../constants/slot.constants';

// Slot structure as per DTO
interface ISlot {
  _id: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  stylistId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  startTimeUTC: Date;
  status: SlotStatus;
  lockedBy?: mongoose.Types.ObjectId;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}
import type { SlotResponseDto } from '../dto/slot.response.dto';
import mongoose from 'mongoose';

export interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
}

export interface PopulatedStylist {
  _id: mongoose.Types.ObjectId;
  userId?: PopulatedUser;
}

export class SlotMapper {
  static toResponse(slot: ISlot): SlotResponseDto {
    const stylist = slot.stylistId as unknown as PopulatedStylist | undefined;

    return {
      id: slot._id.toString(),
      branchId: slot.branchId.toString(),
      stylistId: stylist?._id?.toString() || slot.stylistId?.toString() || '',
      date: slot.date.toISOString(),
      startTime: slot.startTime,
      endTime: slot.endTime,
      startTimeUTC: slot.startTimeUTC.toISOString(),
      status: slot.status,
      lockedBy: slot.lockedBy ? slot.lockedBy.toString() : null,
      lockedUntil: slot.lockedUntil ? slot.lockedUntil.toISOString() : null,
      stylistName: stylist?.userId?.name || 'Unknown',
      stylistEmail: stylist?.userId?.email,
      createdAt: slot.createdAt.toISOString(),
      updatedAt: slot.updatedAt.toISOString(),
    };
  }
}
