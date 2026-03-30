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
exports.StylistWeeklyScheduleModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const appError_1 = require("../common/errors/appError");
const httpStatus_enum_1 = require("../common/enums/httpStatus.enum");
const messages_1 = require("../common/constants/messages");
/**
 * Shift Schema
 */
const ShiftSchema = new mongoose_1.Schema({
    startTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
}, { _id: false });
/**
 * Stylist Weekly Schedule Schema
 */
const StylistWeeklyScheduleSchema = new mongoose_1.Schema({
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
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6,
        index: true,
    },
    isWorkingDay: {
        type: Boolean,
        required: true,
        default: true,
    },
    shifts: {
        type: [ShiftSchema],
        default: [],
    },
}, {
    timestamps: true,
});
StylistWeeklyScheduleSchema.index({ stylistId: 1, branchId: 1, dayOfWeek: 1 }, { unique: true });
StylistWeeklyScheduleSchema.pre('save', function () {
    if (this.isWorkingDay && this.shifts.length === 0) {
        throw new appError_1.AppError(messages_1.MESSAGES.STYLIST_SCHEDULE.WORKING_DAY_NEEDS_SHIFT, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
    }
});
exports.StylistWeeklyScheduleModel = mongoose_1.default.model('StylistWeeklySchedule', StylistWeeklyScheduleSchema);
