import type { Request, Response } from 'express';

export interface IStylistController {
  list(req: Request, res: Response): Promise<void>;
}
