import { isValidObjectId } from '../../../common/utils/mongoose.util';
import { ISlotRepository } from '../repository/ISlotRepository';

/**
 * Resolves a stylist's ObjectId from either a stylistId or a userId.
 */
export async function resolveStylistId(
  userIdOrStylistId: string,
  slotRepo: ISlotRepository,
): Promise<string> {
  if (isValidObjectId(userIdOrStylistId)) {
    const stylist = await slotRepo.findStylistById(userIdOrStylistId);
    if (stylist) return userIdOrStylistId;
  }
  const stylist = await slotRepo.findStylistByUserId(userIdOrStylistId);
  return stylist?._id.toString() ?? userIdOrStylistId;
}

/**
 * Converts HH:MM time string to total minutes since midnight.
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts total minutes since midnight to HH:MM time string.
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
