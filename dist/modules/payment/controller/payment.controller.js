"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const tsyringe_1 = require("tsyringe");
const appError_1 = require("../../../common/errors/appError");
const tokens_1 = require("../../../common/di/tokens");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const apiResponse_1 = require("../../../common/response/apiResponse");
const payment_messages_1 = require("../constants/payment.messages");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
        this.createOrder = async (req, res) => {
            const userId = req.auth?.userId;
            if (!userId) {
                throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.UNAUTH, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            }
            const order = await this.paymentService.createOrder(req.body, userId);
            return apiResponse_1.ApiResponse.success(res, order, payment_messages_1.PAYMENT_MESSAGES.ORDER_CREATE_SUCCESS, httpStatus_enum_1.HttpStatus.CREATED);
        };
        this.verifyPayment = async (req, res) => {
            const result = await this.paymentService.verifyPayment(req.body);
            return apiResponse_1.ApiResponse.success(res, result, payment_messages_1.PAYMENT_MESSAGES.VERIFY_SUCCESS);
        };
        this.payWithWallet = async (req, res) => {
            const userId = req.auth?.userId;
            if (!userId)
                throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.UNAUTH, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            const { bookingId } = req.body;
            const result = await this.paymentService.payWithWallet(bookingId, userId);
            return apiResponse_1.ApiResponse.success(res, result, payment_messages_1.PAYMENT_MESSAGES.VERIFY_SUCCESS);
        };
        this.createRemainingOrder = async (req, res) => {
            const userId = req.auth?.userId;
            if (!userId)
                throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.UNAUTH, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            const { bookingId } = req.body;
            const order = await this.paymentService.createRemainingOrder(bookingId, userId);
            return apiResponse_1.ApiResponse.success(res, order, payment_messages_1.PAYMENT_MESSAGES.ORDER_CREATE_SUCCESS, httpStatus_enum_1.HttpStatus.CREATED);
        };
        this.payRemainingWithWallet = async (req, res) => {
            const userId = req.auth?.userId;
            if (!userId)
                throw new appError_1.AppError(payment_messages_1.PAYMENT_MESSAGES.UNAUTH, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            const { bookingId } = req.body;
            const result = await this.paymentService.payRemainingWithWallet(bookingId, userId);
            return apiResponse_1.ApiResponse.success(res, result, payment_messages_1.PAYMENT_MESSAGES.VERIFY_SUCCESS);
        };
        this.getPaymentById = async (req, res) => {
            const { id } = req.params;
            const payment = await this.paymentService.getPaymentById(id);
            return apiResponse_1.ApiResponse.success(res, payment, payment_messages_1.PAYMENT_MESSAGES.FETCH_SUCCESS);
        };
    }
};
exports.PaymentController = PaymentController;
exports.PaymentController = PaymentController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.PaymentService)),
    __metadata("design:paramtypes", [Object])
], PaymentController);
