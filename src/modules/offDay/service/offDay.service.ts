import { IOffDayService } from './IOffDayService';
import { IOffDayRepository } from '../repository/IOffDayRepository';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { OffDayRequestDto, OffDayResponseDto, OffDayActionDto } from '../dto/offDay.dto';
import { OffDayMapper } from '../mapper/offDay.mapper';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { OFF_DAY_MESSAGES } from '../constants/offDay.constants';
import { OffDayStatus, IStylistOffDay } from '../../../models/stylistOffDay.model';
import { IStylistRepository } from '../../stylistInvite/repository/IStylistRepository';
import { toObjectId, isValidObjectId } from '../../../common/utils/mongoose.util';

import { UserRole } from '../../../common/enums/userRole.enum';
import { IUserRepository } from '../../auth/repository/IUserRepository';
import { INotificationService } from '../../notification/service/INotificationService';
import { NotificationType } from '../../../models/notification.model';

@injectable()
export class OffDayService implements IOffDayService {
  constructor(
    @inject(TOKENS.OffDayRepository)
    private readonly offDayRepo: IOffDayRepository,
    @inject(TOKENS.StylistRepository)
    private readonly stylistRepo: IStylistRepository,
    @inject(TOKENS.UserRepository)
    private readonly userRepo: IUserRepository,
    @inject(TOKENS.NotificationService)
    private readonly notificationService: INotificationService,
  ) {}

  // Helper to resolve user ID to stylist ID
  private async resolveStylistId(userIdOrStylistId: string): Promise<string> {
    if (!isValidObjectId(userIdOrStylistId)) {
      return userIdOrStylistId;
    }
    const stylistId = await this.stylistRepo.findIdByUserId(userIdOrStylistId);
    return stylistId || userIdOrStylistId;
  }

  async requestOffDay(dto: OffDayRequestDto): Promise<OffDayResponseDto> {
    const stylistId = await this.resolveStylistId(dto.stylistId);

    // Validation: 3-day advance notice
    const startDate = new Date(dto.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 3);

    if (startDate < minDate) {
      throw new AppError(OFF_DAY_MESSAGES.INVALID_DATE, HttpStatus.BAD_REQUEST);
    }

    const offDay = await this.offDayRepo.create({
      stylistId: toObjectId(stylistId),
      branchId: toObjectId(dto.branchId),
      type: dto.type,
      startDate,
      endDate: new Date(dto.endDate),
      reason: dto.reason,
      status: OffDayStatus.PENDING,
    });

    // Notify all admins
    try {
      const admins = await this.userRepo.findAllByRole(UserRole.ADMIN);
      const notifications = admins.map((admin) => ({
        recipientId: admin.id.toString(),
        senderId: dto.stylistId,
        type: NotificationType.SYSTEM,
        title: 'New Leave Request',
        message: `A stylist has requested an off-day (${dto.type}) starting on ${startDate.toLocaleDateString()}.`,
        link: '/admin/off-days',
      }));

      await Promise.all(notifications.map((n) => this.notificationService.createNotification(n)));
    } catch (error) {
      console.error('Failed to send admin notifications for leave request:', error);
    }

    return OffDayMapper.toResponse(offDay);
  }

  async getOffDays(
    userIdOrStylistId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<OffDayResponseDto[]> {
    const stylistId = await this.resolveStylistId(userIdOrStylistId);
    const filter: Record<string, unknown> = {
      stylistId: toObjectId(stylistId),
    };
    if (startDate || endDate) {
      const dateFilter: Record<string, unknown> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.startDate = dateFilter;
    }
    const offDays = await this.offDayRepo.find(filter);
    return offDays.map(OffDayMapper.toResponse);
  }

  async getAllOffDays(startDate?: Date, endDate?: Date): Promise<OffDayResponseDto[]> {
    const filter: Record<string, unknown> = {};
    if (startDate || endDate) {
      const dateFilter: Record<string, unknown> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.startDate = dateFilter;
    }
    const offDays = await this.offDayRepo.find(filter);
    return offDays.map(OffDayMapper.toResponse);
  }

  async updateOffDayStatus(
    id: string,
    adminId: string,
    dto: OffDayActionDto,
  ): Promise<OffDayResponseDto> {
    const offDay = await this.offDayRepo.findById(id);
    if (!offDay) {
      throw new AppError(OFF_DAY_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updateData: Partial<IStylistOffDay> = {
      status: dto.status,
      adminRemarks: dto.adminRemarks,
    };

    if (dto.status === OffDayStatus.APPROVED) {
      updateData.approvedBy = toObjectId(adminId);
      updateData.approvedAt = new Date();
    }

    const updated = await this.offDayRepo.update(id, updateData);
    if (!updated) {
      throw new AppError(OFF_DAY_MESSAGES.FAILED_STATUS, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const stylist = await this.stylistRepo.getById(offDay.stylistId.toString());
      if (stylist && stylist.userId) {
        await this.notificationService.createNotification({
          recipientId: stylist.userId.toString(),
          senderId: adminId,
          type: NotificationType.SYSTEM,
          title: `Leave Request ${dto.status}`,
          message: `Your leave request has been ${dto.status.toLowerCase()}. ${
            dto.adminRemarks ? `Admin remarks: "${dto.adminRemarks}"` : ''
          }`,
          link: '/stylist/off-days',
        });
      }
    } catch (error) {
      console.error('Failed to notify stylist of leave status update:', error);
    }

    return OffDayMapper.toResponse(updated);
  }

  async deleteOffDay(id: string): Promise<void> {
    const success = await this.offDayRepo.delete(id);
    if (!success) {
      throw new AppError(OFF_DAY_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }
}
