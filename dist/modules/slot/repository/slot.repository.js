"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotRepository = void 0;
const tsyringe_1 = require("tsyringe");
const stylist_model_1 = require("../../../models/stylist.model");
const stylistBranch_model_1 = require("../../../models/stylistBranch.model");
const stylistOffDay_model_1 = require("../../../models/stylistOffDay.model");
const stylistDailyOverride_model_1 = require("../../../models/stylistDailyOverride.model");
const stylistWeeklySchedule_model_1 = require("../../../models/stylistWeeklySchedule.model");
const stylistBreak_model_1 = require("../../../models/stylistBreak.model");
const booking_model_1 = require("../../../models/booking.model");
const branch_model_1 = require("../../../models/branch.model");
const branchService_model_1 = require("../../../models/branchService.model");
const specialSlot_model_1 = require("../../../models/specialSlot.model");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
let SlotRepository = class SlotRepository {
    async findActiveStylistsByBranch(branchId) {
        return await stylistBranch_model_1.StylistBranchModel.find({ branchId, isActive: true }).lean();
    }
    async findStylistsByIds(stylistIds) {
        const objectIds = stylistIds.map((id) => (0, mongoose_util_1.toObjectId)(id));
        return await stylist_model_1.StylistModel.find({ _id: { $in: objectIds } })
            .populate('userId', 'name email')
            .lean();
    }
    async findBranchById(branchId) {
        return await branch_model_1.BranchModel.findById(branchId).lean();
    }
    async findStylistBreaks(branchId, stylistIds, dayOfWeek, date) {
        const sIds = stylistIds.map((id) => (0, mongoose_util_1.toObjectId)(id));
        return await stylistBreak_model_1.StylistBreakModel.find({
            branchId: (0, mongoose_util_1.toObjectId)(branchId),
            stylistId: { $in: sIds },
            $or: [{ dayOfWeek }, { date }],
        }).lean();
    }
    async findBookings(branchId, stylistIds, date) {
        const sIds = stylistIds.map((id) => (0, mongoose_util_1.toObjectId)(id));
        return await booking_model_1.BookingModel.find({
            branchId: (0, mongoose_util_1.toObjectId)(branchId),
            $or: [{ stylistId: { $in: sIds } }, { 'items.stylistId': { $in: sIds } }],
            date,
            status: {
                $in: [
                    booking_model_1.BookingStatus.CONFIRMED,
                    booking_model_1.BookingStatus.PENDING_PAYMENT,
                    booking_model_1.BookingStatus.BLOCKED,
                    booking_model_1.BookingStatus.SPECIAL,
                ],
            },
        })
            .select('startTime endTime status items notes stylistId')
            .lean();
    }
    async findOffDays(stylistIds, date) {
        const sIds = stylistIds.map((id) => (0, mongoose_util_1.toObjectId)(id));
        return await stylistOffDay_model_1.StylistOffDayModel.find({
            stylistId: { $in: sIds },
            status: stylistOffDay_model_1.OffDayStatus.APPROVED,
            startDate: { $lte: new Date(date.getTime() + 86399999) },
            endDate: { $gte: date },
        }).lean();
    }
    async findDailyOverrides(branchId, stylistIds, date) {
        const sIds = stylistIds.map((id) => (0, mongoose_util_1.toObjectId)(id));
        return await stylistDailyOverride_model_1.StylistDailyOverrideModel.find({
            stylistId: { $in: sIds },
            branchId: (0, mongoose_util_1.toObjectId)(branchId),
            date,
        }).lean();
    }
    async findWeeklySchedules(branchId, stylistIds, dayOfWeek) {
        const sIds = stylistIds.map((id) => (0, mongoose_util_1.toObjectId)(id));
        return await stylistWeeklySchedule_model_1.StylistWeeklyScheduleModel.find({
            stylistId: { $in: sIds },
            branchId: (0, mongoose_util_1.toObjectId)(branchId),
            dayOfWeek,
        }).lean();
    }
    async findBranchService(branchId, serviceId) {
        return await branchService_model_1.BranchServiceModel.findOne({ branchId, serviceId, isActive: true }).lean();
    }
    async findSpecialSlots(branchId, stylistIds, date) {
        const sIds = stylistIds.map((id) => (0, mongoose_util_1.toObjectId)(id));
        return await specialSlot_model_1.SpecialSlotModel.find({
            branchId: (0, mongoose_util_1.toObjectId)(branchId),
            stylistId: { $in: sIds },
            date,
            status: { $in: [specialSlot_model_1.SpecialSlotStatus.AVAILABLE, specialSlot_model_1.SpecialSlotStatus.CANCELLED] },
        }).lean();
    }
    async findSpecialSlotById(id) {
        return await specialSlot_model_1.SpecialSlotModel.findById(id).lean();
    }
    async updateSpecialSlot(id, data) {
        return await specialSlot_model_1.SpecialSlotModel.findByIdAndUpdate(id, data, { new: true }).lean();
    }
    async findStylistById(id) {
        return await stylist_model_1.StylistModel.findById(id).populate('userId', 'name email').lean();
    }
    async findStylistByUserId(userId) {
        return await stylist_model_1.StylistModel.findOne({ userId: (0, mongoose_util_1.toObjectId)(userId) })
            .populate('userId', 'name email')
            .lean();
    }
    async createSpecialSlot(data) {
        const slot = await specialSlot_model_1.SpecialSlotModel.create(data);
        return slot.toObject();
    }
    async findSpecialSlotsWithStylist(query) {
        return (await specialSlot_model_1.SpecialSlotModel.find(query)
            .populate('stylistId')
            .sort({ date: 1, startTime: 1 })
            .lean());
    }
    async findActiveStylistIds(branchId) {
        const activeStylists = await stylistBranch_model_1.StylistBranchModel.find({ branchId, isActive: true })
            .select('stylistId')
            .lean();
        return activeStylists.map((s) => s.stylistId.toString());
    }
};
exports.SlotRepository = SlotRepository;
exports.SlotRepository = SlotRepository = __decorate([
    (0, tsyringe_1.injectable)()
], SlotRepository);
