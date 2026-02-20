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

// Type for populated stylist in slot
interface PopulatedStylist {
  _id: mongoose.Types.ObjectId;
  userId?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email?: string;
  };
}

// Type guard to check if stylistId is populated
function isPopulatedStylist(stylistId: unknown): stylistId is PopulatedStylist {
  return (
    typeof stylistId === 'object' &&
    stylistId !== null &&
    '_id' in stylistId &&
    (stylistId as { _id: mongoose.Types.ObjectId })._id instanceof mongoose.Types.ObjectId
  );
}

export class SlotMapper {
  static toResponse(slot: ISlot): SlotResponseDto {
    const stylistId = slot.stylistId as unknown;
    let stylistIdString = '';
    let stylistName: string | undefined;
    let stylistEmail: string | undefined;

    if (stylistId) {
      if (isPopulatedStylist(stylistId)) {
        stylistIdString = stylistId._id.toString();

        if (stylistId.userId && typeof stylistId.userId === 'object') {
          stylistName = stylistId.userId.name;
          stylistEmail = stylistId.userId.email;
        }
      } else if (typeof stylistId === 'object' && stylistId !== null && 'toString' in stylistId) {
        stylistIdString = (stylistId as mongoose.Types.ObjectId).toString();
      }
    }

    const response: SlotResponseDto = {
      id: slot._id.toString(),
      branchId: slot.branchId.toString(),
      stylistId: stylistIdString,
      date: slot.date.toISOString(),
      startTime: slot.startTime,
      endTime: slot.endTime,
      startTimeUTC: slot.startTimeUTC.toISOString(),
      status: slot.status,
      lockedBy: slot.lockedBy ? slot.lockedBy.toString() : null,
      lockedUntil: slot.lockedUntil ? slot.lockedUntil.toISOString() : null,
      createdAt: slot.createdAt.toISOString(),
      updatedAt: slot.updatedAt.toISOString(),
    };

    if (stylistName) {
      response.stylistName = stylistName;
    }
    if (stylistEmail) {
      response.stylistEmail = stylistEmail;
    }

    return response;
  }
}
