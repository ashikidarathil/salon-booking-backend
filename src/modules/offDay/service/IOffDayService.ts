import { OffDayRequestDto, OffDayResponseDto, OffDayActionDto } from '../dto/offDay.dto';

export interface IOffDayService {
  requestOffDay(dto: OffDayRequestDto): Promise<OffDayResponseDto>;
  getOffDays(stylistId: string, startDate?: Date, endDate?: Date): Promise<OffDayResponseDto[]>;
  getAllOffDays(startDate?: Date, endDate?: Date): Promise<OffDayResponseDto[]>;
  updateOffDayStatus(id: string, adminId: string, dto: OffDayActionDto): Promise<OffDayResponseDto>;
  deleteOffDay(id: string): Promise<void>;
}
