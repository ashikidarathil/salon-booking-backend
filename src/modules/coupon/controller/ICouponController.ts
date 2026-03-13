import { Request, Response } from 'express';
import { CouponPaginationQueryDto, ValidateCouponRequestDto } from '../dto/coupon.request.dto';

export interface ICouponController {
  createCoupon(req: Request, res: Response): Promise<void>;
  updateCoupon(req: Request, res: Response): Promise<void>;
  validateCoupon(req: Request, res: Response): Promise<void>;
  listAvailableCoupons(req: Request, res: Response): Promise<void>;
  listAllCoupons(req: Request, res: Response): Promise<void>;
  toggleStatus(req: Request, res: Response): Promise<void>;
  toggleDelete(req: Request, res: Response): Promise<void>;
}
