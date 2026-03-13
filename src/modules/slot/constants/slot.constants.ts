export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  BLOCKED = 'BLOCKED',
  BREAK = 'BREAK',
  OFF_DAY = 'OFF_DAY',
  NON_WORKING = 'NON_WORKING',
  NO_SCHEDULE = 'NO_SCHEDULE',
  HOLIDAY = 'HOLIDAY',
  SPECIAL = 'SPECIAL',
}

export const BOOKING_WINDOW_DAYS = 14;
export const SLOT_GRID_SIZE = 15;

export const SLOT_PREFIXES = {
  DYNAMIC: 'dynamic_',
  SPECIAL: 'special_',
  HOLIDAY: 'holiday_',
};

export const SLOT_LABELS = {
  SYSTEM: 'SYSTEM',
  UNKNOWN: 'Unknown',
  LUNCH_BREAK: 'Lunch Break',
  TEA_BREAK: 'Tea Break',
  GENERIC_BREAK: 'Break',
  BLOCKED_NOTE: 'Blocked',
  HOLIDAY_PREFIX: 'HOLIDAY: ',
};
