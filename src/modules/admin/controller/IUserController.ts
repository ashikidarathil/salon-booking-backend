import { Request, Response } from 'express';

export interface IUserController {
  // getAllUsers(req: Request, res: Response): Promise<void>;
  toggleBlock(req: Request, res: Response): Promise<void>;
  getUsers(req: Request, res: Response): Promise<void>;
}
