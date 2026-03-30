"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponModel = exports.CouponFilterStatus = exports.DiscountType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "PERCENTAGE";
    DiscountType["FIXED"] = "FIXED";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
var CouponFilterStatus;
(function (CouponFilterStatus) {
    CouponFilterStatus["ACTIVE"] = "ACTIVE";
    CouponFilterStatus["INACTIVE"] = "INACTIVE";
    CouponFilterStatus["DELETED"] = "DELETED";
    CouponFilterStatus["ALL"] = "ALL";
})(CouponFilterStatus || (exports.CouponFilterStatus = CouponFilterStatus = {}));
const CouponSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true,
    },
    discountType: {
        type: String,
        enum: Object.values(DiscountType),
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
    },
    minBookingAmount: {
        type: Number,
        required: true,
        min: 1,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    maxUsage: {
        type: Number,
        required: true,
        min: 1,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    maxDiscountAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
    applicableServices: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Service',
        },
    ],
}, {
    timestamps: true,
});
exports.CouponModel = mongoose_1.default.model('Coupon', CouponSchema);
