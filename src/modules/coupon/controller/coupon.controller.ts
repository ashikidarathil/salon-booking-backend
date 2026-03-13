import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { ICouponController } from './ICouponController';
import { ICouponService } from '../service/ICouponService';
import { TOKENS } from '../../../common/di/tokens';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { ApiResponse } from '../../../common/response/apiResponse';
import { COUPON_MESSAGES } from '../constants/coupon.messages';
import { CouponPaginationQueryDto, ValidateCouponRequestDto, CreateCouponRequestDto, UpdateCouponRequestDto } from '../dto/coupon.request.dto';

@injectable()
export class CouponController implements ICouponController {
  constructor(
    @inject(TOKENS.CouponService)
    private couponService: ICouponService,
  ) {}

  createCoupon = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CreateCouponRequestDto;
    const coupon = await this.couponService.createCoupon(body);
    res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.success(COUPON_MESSAGES.CREATE_SUCCESS, coupon));
  };

  updateCoupon = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const body = req.body as UpdateCouponRequestDto;
    const coupon = await this.couponService.updateCoupon(id, body);
    res.status(HttpStatus.OK).json(ApiResponse.success('Coupon updated successfully', coupon));
  };

  validateCoupon = async (req: Request, res: Response): Promise<void> => {
    const { code, amount } = req.body as ValidateCouponRequestDto;
    const coupon = await this.couponService.validateCoupon(code, amount);
    res.status(HttpStatus.OK).json(ApiResponse.success(COUPON_MESSAGES.VALIDATE_SUCCESS, coupon));
  };

  listAvailableCoupons = async (_req: Request, res: Response): Promise<void> => {
    const coupons = await this.couponService.listAvailableCoupons();
    res.status(HttpStatus.OK).json(ApiResponse.success(COUPON_MESSAGES.FETCH_SUCCESS, coupons));
  };

  listAllCoupons = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as CouponPaginationQueryDto;
    const coupons = await this.couponService.listCoupons(query);
    res.status(HttpStatus.OK).json(ApiResponse.success(COUPON_MESSAGES.FETCH_SUCCESS, coupons));
  };

  toggleStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const coupon = await this.couponService.toggleCouponStatus(id);
    res.status(HttpStatus.OK).json(ApiResponse.success(COUPON_MESSAGES.TOGGLE_SUCCESS, coupon));
  };

  toggleDelete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const coupon = await this.couponService.toggleDeleteStatus(id);
    res.status(HttpStatus.OK).json(ApiResponse.success(COUPON_MESSAGES.DELETE_SUCCESS, coupon));
  };
}
