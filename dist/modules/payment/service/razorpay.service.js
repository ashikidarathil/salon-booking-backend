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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const env_1 = require("../../../config/env");
const tsyringe_1 = require("tsyringe");
const crypto_1 = __importDefault(require("crypto"));
let RazorpayService = class RazorpayService {
    constructor() {
        this.razorpay = new razorpay_1.default({
            key_id: env_1.env.RAZORPAY_KEY_ID,
            key_secret: env_1.env.RAZORPAY_KEY_SECRET,
        });
    }
    async createOrder(amount, currency, receipt) {
        const options = {
            amount: amount * 100,
            currency: currency,
            receipt: receipt,
        };
        return this.razorpay.orders.create(options);
    }
    verifySignature(orderId, paymentId, signature) {
        const generated_signature = crypto_1.default
            .createHmac('sha256', env_1.env.RAZORPAY_KEY_SECRET)
            .update(orderId + '|' + paymentId)
            .digest('hex');
        return generated_signature === signature;
    }
};
exports.RazorpayService = RazorpayService;
exports.RazorpayService = RazorpayService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], RazorpayService);
