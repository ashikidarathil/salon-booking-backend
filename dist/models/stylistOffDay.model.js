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
exports.StylistOffDayModel = exports.OffDayStatus = exports.OffDayType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const appError_1 = require("../common/errors/appError");
const httpStatus_enum_1 = require("../common/enums/httpStatus.enum");
const messages_1 = require("../common/constants/messages");
/**
 * Off-day type enum
 */
var OffDayType;
(function (OffDayType) {
    OffDayType["SICK_LEAVE"] = "SICK_LEAVE";
    OffDayType["VACATION"] = "VACATION";
    OffDayType["PERSONAL"] = "PERSONAL";
    OffDayType["EMERGENCY"] = "EMERGENCY";
})(OffDayType || (exports.OffDayType = OffDayType = {}));
/**
 * Off-day status enum
 */
var OffDayStatus;
(function (OffDayStatus) {
    OffDayStatus["PENDING"] = "PENDING";
    OffDayStatus["APPROVED"] = "APPROVED";
    OffDayStatus["REJECTED"] = "REJECTED";
})(OffDayStatus || (exports.OffDayStatus = OffDayStatus = {}));
/**
 * Stylist Off-Day Schema
 */
const StylistOffDaySchema = new mongoose_1.Schema({
    stylistId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Stylist',
        required: true,
        index: true,
    },
    branchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
        index: true,
    },
    startDate: {
        type: Date,
        required: true,
        index: true,
    },
    endDate: {
        type: Date,
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: Object.values(OffDayType),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(OffDayStatus),
        required: true,
        default: OffDayStatus.PENDING,
        index: true,
    },
    reason: {
        type: String,
        maxlength: 500,
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    approvedAt: {
        type: Date,
    },
    adminRemarks: {
        type: String,
        maxlength: 500,
    },
}, {
    timestamps: true,
});
StylistOffDaySchema.index({ stylistId: 1, branchId: 1, startDate: 1, endDate: 1 });
StylistOffDaySchema.index({ status: 1, branchId: 1 });
StylistOffDaySchema.pre('save', function () {
    if (this.endDate < this.startDate) {
        throw new appError_1.AppError(messages_1.MESSAGES.STYLIST_SCHEDULE.END_DATE_BEFORE_START, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
    }
});
StylistOffDaySchema.pre('save', function () {
    if (this.isModified('status') && this.status !== OffDayStatus.PENDING) {
        if (!this.approvedAt) {
            this.approvedAt = new Date();
        }
    }
});
exports.StylistOffDayModel = mongoose_1.default.model('StylistOffDay', StylistOffDaySchema);
