import { Request, Response } from 'express';

export interface IUserController {
  toggleBlock(req: Request, res: Response): Promise<void>;
  getUsers(req: Request, res: Response): Promise<void>;
}
