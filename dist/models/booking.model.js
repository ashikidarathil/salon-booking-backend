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
exports.BookingModel = exports.PaymentStatus = exports.BookingStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING_PAYMENT"] = "PENDING_PAYMENT";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["NO_SHOW"] = "NO_SHOW";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["FAILED"] = "FAILED";
    BookingStatus["BLOCKED"] = "BLOCKED";
    BookingStatus["SPECIAL"] = "SPECIAL";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["ADVANCE_PAID"] = "ADVANCE_PAID";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["FAILED"] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
const BookingSchema = new mongoose_1.Schema({
    bookingNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    branchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
        index: true,
    },
    slotId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Slot',
        required: false,
        index: true,
    },
    items: [
        {
            serviceId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Service',
                required: true,
            },
            stylistId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Stylist',
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            duration: {
                type: Number,
                required: true,
            },
            date: {
                type: Date,
                required: true,
            },
            startTime: {
                type: String,
                required: true,
            },
            endTime: {
                type: String,
                required: true,
            },
        },
    ],
    stylistId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Stylist',
        required: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    discountAmount: {
        type: Number,
        default: 0,
    },
    payableAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    advanceAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    couponId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Coupon',
    },
    status: {
        type: String,
        enum: Object.values(BookingStatus),
        default: BookingStatus.PENDING_PAYMENT,
        index: true,
    },
    paymentStatus: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING,
    },
    notes: {
        type: String,
        maxlength: 500,
    },
    cancelledBy: {
        type: String,
        enum: ['USER', 'ADMIN', 'STYLIST', 'SYSTEM'],
    },
    cancelledReason: {
        type: String,
        maxlength: 200,
    },
    cancelledAt: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
    rescheduleCount: {
        type: Number,
        default: 0,
    },
    rescheduleReason: {
        type: String,
        maxlength: 200,
    },
    paymentWindowExpiresAt: {
        type: Date,
        index: true,
    },
}, {
    timestamps: true,
});
BookingSchema.index({ branchId: 1, stylistId: 1, date: 1, startTime: 1 }, {
    unique: true,
    partialFilterExpression: {
        status: { $in: ['PENDING_PAYMENT', 'CONFIRMED', 'BLOCKED', 'SPECIAL'] },
    },
});
BookingSchema.index({ stylistId: 1, date: 1 });
BookingSchema.index({ 'items.stylistId': 1, date: 1 });
exports.BookingModel = mongoose_1.default.model('Booking', BookingSchema);
