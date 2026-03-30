"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCouponController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const coupon_repository_1 = require("./repository/coupon.repository");
const coupon_service_1 = require("./service/coupon.service");
const coupon_controller_1 = require("./controller/coupon.controller");
tsyringe_1.container.register(tokens_1.TOKENS.CouponRepository, { useClass: coupon_repository_1.CouponRepository });
tsyringe_1.container.register(tokens_1.TOKENS.CouponService, { useClass: coupon_service_1.CouponService });
tsyringe_1.container.register(tokens_1.TOKENS.CouponController, { useClass: coupon_controller_1.CouponController });
const resolveCouponController = () => {
    return tsyringe_1.container.resolve(tokens_1.TOKENS.CouponController);
};
exports.resolveCouponController = resolveCouponController;
