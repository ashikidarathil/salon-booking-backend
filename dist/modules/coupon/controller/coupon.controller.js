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
exports.CouponController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const apiResponse_1 = require("../../../common/response/apiResponse");
const coupon_messages_1 = require("../constants/coupon.messages");
let CouponController = class CouponController {
    constructor(couponService) {
        this.couponService = couponService;
        this.createCoupon = async (req, res) => {
            const body = req.body;
            const coupon = await this.couponService.createCoupon(body);
            return apiResponse_1.ApiResponse.success(res, coupon, coupon_messages_1.COUPON_MESSAGES.CREATE_SUCCESS, httpStatus_enum_1.HttpStatus.CREATED);
        };
        this.updateCoupon = async (req, res) => {
            const { id } = req.params;
            const body = req.body;
            const coupon = await this.couponService.updateCoupon(id, body);
            return apiResponse_1.ApiResponse.success(res, coupon, coupon_messages_1.COUPON_MESSAGES.COUPON_UPDATED);
        };
        this.validateCoupon = async (req, res) => {
            const { code, amount } = req.body;
            const coupon = await this.couponService.validateCoupon(code, amount);
            return apiResponse_1.ApiResponse.success(res, coupon, coupon_messages_1.COUPON_MESSAGES.VALIDATE_SUCCESS);
        };
        this.listAvailableCoupons = async (_req, res) => {
            const coupons = await this.couponService.listAvailableCoupons();
            return apiResponse_1.ApiResponse.success(res, coupons, coupon_messages_1.COUPON_MESSAGES.FETCH_SUCCESS);
        };
        this.listAllCoupons = async (req, res) => {
            const coupons = await this.couponService.listCoupons(req.query);
            return apiResponse_1.ApiResponse.success(res, coupons, coupon_messages_1.COUPON_MESSAGES.FETCH_SUCCESS);
        };
        this.toggleStatus = async (req, res) => {
            const { id } = req.params;
            const coupon = await this.couponService.toggleCouponStatus(id);
            return apiResponse_1.ApiResponse.success(res, coupon, coupon_messages_1.COUPON_MESSAGES.TOGGLE_SUCCESS);
        };
        this.toggleDelete = async (req, res) => {
            const { id } = req.params;
            const coupon = await this.couponService.toggleDeleteStatus(id);
            return apiResponse_1.ApiResponse.success(res, coupon, coupon_messages_1.COUPON_MESSAGES.DELETE_SUCCESS);
        };
    }
};
exports.CouponController = CouponController;
exports.CouponController = CouponController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.CouponService)),
    __metadata("design:paramtypes", [Object])
], CouponController);
