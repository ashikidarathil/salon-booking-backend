import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../common/errors/appError';
import { IPaymentController } from './IPaymentController';
import { IPaymentService } from '../service/IPaymentService';
import { TOKENS } from '../../../common/di/tokens';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { ApiResponse } from '../../../common/response/apiResponse';
import { PAYMENT_MESSAGES } from '../constants/payment.messages';
import { AuthPayload } from '../../../common/types/authPayload';

@injectable()
export class PaymentController implements IPaymentController {
  constructor(
    @inject(TOKENS.PaymentService)
    private paymentService: IPaymentService,
  ) {}

  createOrder = async (req: Request & { auth?: AuthPayload }, res: Response): Promise<Response> => {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError(PAYMENT_MESSAGES.UNAUTH, HttpStatus.UNAUTHORIZED);
    }
    const order = await this.paymentService.createOrder(req.body, userId);
    return ApiResponse.success(
      res,
      order,
      PAYMENT_MESSAGES.ORDER_CREATE_SUCCESS,
      HttpStatus.CREATED,
    );
  };

  verifyPayment = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.paymentService.verifyPayment(req.body);
    return ApiResponse.success(res, result, PAYMENT_MESSAGES.VERIFY_SUCCESS);
  };

  payWithWallet = async (
    req: Request & { auth?: AuthPayload },
    res: Response,
  ): Promise<Response> => {
    const userId = req.auth?.userId;
    if (!userId) throw new AppError(PAYMENT_MESSAGES.UNAUTH, HttpStatus.UNAUTHORIZED);

    const { bookingId } = req.body;
    const result = await this.paymentService.payWithWallet(bookingId, userId);
    return ApiResponse.success(res, result, PAYMENT_MESSAGES.VERIFY_SUCCESS);
  };

  createRemainingOrder = async (
    req: Request & { auth?: AuthPayload },
    res: Response,
  ): Promise<Response> => {
    const userId = req.auth?.userId;
    if (!userId) throw new AppError(PAYMENT_MESSAGES.UNAUTH, HttpStatus.UNAUTHORIZED);
    const { bookingId } = req.body;
    const order = await this.paymentService.createRemainingOrder(bookingId, userId);
    return ApiResponse.success(
      res,
      order,
      PAYMENT_MESSAGES.ORDER_CREATE_SUCCESS,
      HttpStatus.CREATED,
    );
  };

  payRemainingWithWallet = async (
    req: Request & { auth?: AuthPayload },
    res: Response,
  ): Promise<Response> => {
    const userId = req.auth?.userId;
    if (!userId) throw new AppError(PAYMENT_MESSAGES.UNAUTH, HttpStatus.UNAUTHORIZED);
    const { bookingId } = req.body;
    const result = await this.paymentService.payRemainingWithWallet(bookingId, userId);
    return ApiResponse.success(res, result, PAYMENT_MESSAGES.VERIFY_SUCCESS);
  };

  getPaymentById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const payment = await this.paymentService.getPaymentById(id);
    return ApiResponse.success(res, payment, PAYMENT_MESSAGES.FETCH_SUCCESS);
  };
}
