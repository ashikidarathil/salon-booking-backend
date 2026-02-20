export interface ShiftDto {
  startTime: string;
  endTime: string;
}

export interface StylistBreakRequestDto {
  stylistId: string;
  branchId: string;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface StylistBreakResponseDto {
  id: string;
  stylistId: string;
  branchId: string;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyScheduleRequestDto {
  stylistId: string;
  branchId: string;
  dayOfWeek: number;
  isWorkingDay: boolean;
  shifts: ShiftDto[];
}

export interface WeeklyScheduleResponseDto {
  id: string;
  stylistId: string;
  branchId: string;
  dayOfWeek: number;
  isWorkingDay: boolean;
  shifts: ShiftDto[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyOverrideRequestDto {
  stylistId: string;
  branchId: string;
  date: string;
  isWorkingDay: boolean;
  shifts: ShiftDto[];
  reason?: string;
}

export interface DailyOverrideResponseDto {
  id: string;
  stylistId: string;
  branchId: string;
  date: string;
  isWorkingDay: boolean;
  shifts: ShiftDto[];
  reason?: string;
  createdAt: string;
  updatedAt: string;
}
