import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { ICouponController } from './ICouponController';
import { ICouponService } from '../service/ICouponService';
import { TOKENS } from '../../../common/di/tokens';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { ApiResponse } from '../../../common/response/apiResponse';
import { COUPON_MESSAGES } from '../constants/coupon.messages';
import {
  CouponPaginationQueryDto,
  ValidateCouponRequestDto,
  CreateCouponRequestDto,
  UpdateCouponRequestDto,
} from '../dto/coupon.request.dto';

@injectable()
export class CouponController implements ICouponController {
  constructor(
    @inject(TOKENS.CouponService)
    private couponService: ICouponService,
  ) {}

  createCoupon = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body as CreateCouponRequestDto;
    const coupon = await this.couponService.createCoupon(body);
    return ApiResponse.success(res, coupon, COUPON_MESSAGES.CREATE_SUCCESS, HttpStatus.CREATED);
  };

  updateCoupon = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const body = req.body as UpdateCouponRequestDto;
    const coupon = await this.couponService.updateCoupon(id, body);
    return ApiResponse.success(res, coupon, COUPON_MESSAGES.COUPON_UPDATED);
  };

  validateCoupon = async (req: Request, res: Response): Promise<Response> => {
    const { code, amount } = req.body as ValidateCouponRequestDto;
    const coupon = await this.couponService.validateCoupon(code, amount);
    return ApiResponse.success(res, coupon, COUPON_MESSAGES.VALIDATE_SUCCESS);
  };

  listAvailableCoupons = async (_req: Request, res: Response): Promise<Response> => {
    const coupons = await this.couponService.listAvailableCoupons();
    return ApiResponse.success(res, coupons, COUPON_MESSAGES.FETCH_SUCCESS);
  };

  listAllCoupons = async (req: Request, res: Response): Promise<Response> => {
    const coupons = await this.couponService.listCoupons(
      req.query as unknown as CouponPaginationQueryDto,
    );
    return ApiResponse.success(res, coupons, COUPON_MESSAGES.FETCH_SUCCESS);
  };

  toggleStatus = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const coupon = await this.couponService.toggleCouponStatus(id);
    return ApiResponse.success(res, coupon, COUPON_MESSAGES.TOGGLE_SUCCESS);
  };

  toggleDelete = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const coupon = await this.couponService.toggleDeleteStatus(id);
    return ApiResponse.success(res, coupon, COUPON_MESSAGES.DELETE_SUCCESS);
  };
}
