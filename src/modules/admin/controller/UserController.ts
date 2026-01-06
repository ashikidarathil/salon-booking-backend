// backend/src/modules/admin/controller/UserController.ts

import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { ApiResponse } from '../../../common/response/apiResponse';
import { IUserController } from './IUserController';
import { UserAdminService } from '../service/UserAdminService';

@injectable()
export class UserController implements IUserController {
  constructor(@inject(UserAdminService) private readonly userAdminService: UserAdminService) {}

  async getAllUsers(req: Request, res: Response): Promise<void> {
    const users = await this.userAdminService.getAllUsers();

    const formatted = users.map((u) => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      isBlocked: u.isBlocked,
      createdAt: u.createdAt,
    }));

    res.json(new ApiResponse(true, 'Users fetched successfully', { users: formatted }));
  }

  async toggleBlock(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const { isBlocked } = req.body as { isBlocked: boolean };

    if (typeof isBlocked !== 'boolean') {
      res.status(400).json({ success: false, message: 'isBlocked must be boolean' });
      return;
    }

    await this.userAdminService.toggleBlockUser(userId, isBlocked);

    res.json(new ApiResponse(true, `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`));
  }
}
