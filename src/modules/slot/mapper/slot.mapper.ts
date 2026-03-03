import { SlotStatus } from '../constants/slot.constants';
import type { SlotResponseDto } from '../dto/slot.response.dto';
import { SpecialSlotStatus } from '../../../models/specialSlot.model';
import { timeToMinutes } from '../service/slot.helpers';
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

export interface SlotLike {
  _id: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  stylistId: mongoose.Types.ObjectId | PopulatedStylist;
  date: Date | string;
  startTime: string;
  endTime: string;
  startTimeUTC?: Date | string;
  status: SlotStatus | SpecialSlotStatus;
  lockedBy?: mongoose.Types.ObjectId | null;
  lockedUntil?: Date | string | null;
  note?: string;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SlotMapper {
  static toResponse(slot: SlotLike): SlotResponseDto {
    const stylist = slot.stylistId as unknown as PopulatedStylist | undefined;
    const date = slot.date instanceof Date ? slot.date : new Date(slot.date);

    // Calculate startTimeUTC if not present (for special slots)
    const startTimeUTC = slot.startTimeUTC
      ? slot.startTimeUTC instanceof Date
        ? slot.startTimeUTC
        : new Date(slot.startTimeUTC)
      : new Date(date.getTime() + timeToMinutes(slot.startTime) * 60000);

    return {
      id: slot._id.toString(),
      branchId: slot.branchId.toString(),
      stylistId: (stylist?._id || slot.stylistId || '').toString(),
      stylistName: stylist?.userId?.name || 'Unknown',
      stylistEmail: stylist?.userId?.email,
      date: date.toISOString(),
      startTime: slot.startTime,
      endTime: slot.endTime,
      startTimeUTC: startTimeUTC.toISOString(),
      status: this.mapStatus(slot.status),
      lockedBy: slot.lockedBy ? slot.lockedBy.toString() : null,
      lockedUntil: slot.lockedUntil
        ? slot.lockedUntil instanceof Date
          ? slot.lockedUntil.toISOString()
          : slot.lockedUntil
        : null,
      note: slot.note,
      price: slot.price,
      createdAt: slot.createdAt.toISOString(),
      updatedAt: slot.updatedAt.toISOString(),
    };
  }

  private static mapStatus(status: SlotStatus | SpecialSlotStatus): SlotStatus {
    if (Object.values(SlotStatus).includes(status as SlotStatus)) {
      return status as SlotStatus;
    }

    switch (status) {
      case SpecialSlotStatus.AVAILABLE:
        return SlotStatus.SPECIAL;
      case SpecialSlotStatus.BOOKED:
        return SlotStatus.BOOKED;
      case SpecialSlotStatus.CANCELLED:
        return SlotStatus.BLOCKED;
      default:
        return SlotStatus.SPECIAL;
    }
  }
}
