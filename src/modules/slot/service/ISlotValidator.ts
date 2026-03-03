export interface ISlotValidator {
  timeToMinutes(time: string): number;
  minutesToTime(minutes: number): string;
  validateSlot(
    branchId: string,
    stylistId: string,
    date: Date,
    startTime: string,
    duration: number,
  ): Promise<boolean>;
  checkSpecialSlotOverlap(
    branchId: string,
    stylistId: string,
    date: Date,
    newStartMin: number,
    newEndMin: number,
    excludeId?: string,
  ): Promise<boolean>;
  checkBookingOverlap(
    stylistId: string,
    date: Date,
    newStartMin: number,
    newEndMin: number,
  ): Promise<boolean>;
}
