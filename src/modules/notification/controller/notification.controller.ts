import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { INotificationService } from '../service/INotificationService';
import { TOKENS } from '../../../common/di/tokens';
import { NOTIFICATION_MESSAGES } from '../constants/notification.messages';
import { NotificationMapper } from '../mapper/notification.mapper';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { AppError } from '../../../common/errors/appError';
import { isValidObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class NotificationController {
  constructor(
    @inject(TOKENS.NotificationService)
    private notificationService: INotificationService,
  ) {}

  getMyNotifications = async (
    req: Request & { auth?: { userId: string } },
    res: Response,
  ): Promise<Response> => {
    const userId = req.auth!.userId;
    const { limit, skip, isRead } = req.query;

    let isReadBool: boolean | undefined = undefined;
    if (isRead === 'true') isReadBool = true;
    else if (isRead === 'false') isReadBool = false;

    const notifications = await this.notificationService.getUserNotifications(
      userId,
      isReadBool,
      limit ? parseInt(limit as string) : 20,
      skip ? parseInt(skip as string) : 0,
    );
    const unreadCount = await this.notificationService.getUnreadCount(userId);

    return ApiResponse.success(
      res,
      {
        notifications: NotificationMapper.toResponseDtoList(notifications),
        unreadCount,
      },
      NOTIFICATION_MESSAGES.FETCHED,
    );
  };

  markAsRead = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      throw new AppError(NOTIFICATION_MESSAGES.ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    await this.notificationService.markAsRead(id);
    return ApiResponse.success(res, undefined, NOTIFICATION_MESSAGES.READ_SUCCESS);
  };

  markAllAsRead = async (
    req: Request & { auth?: { userId: string } },
    res: Response,
  ): Promise<Response> => {
    const userId = req.auth!.userId;
    await this.notificationService.markAllAsRead(userId);
    return ApiResponse.success(res, undefined, NOTIFICATION_MESSAGES.ALL_READ_SUCCESS);
  };
}
