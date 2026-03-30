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
exports.OffDayController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const offDay_constants_1 = require("../constants/offDay.constants");
let OffDayController = class OffDayController {
    constructor(offDayService) {
        this.offDayService = offDayService;
        this.requestOffDay = async (req, res) => {
            const authReq = req;
            const userId = authReq.auth?.userId;
            if (!userId) {
                return apiResponse_1.ApiResponse.error(res, offDay_constants_1.OFF_DAY_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            }
            const dto = { ...req.body, stylistId: userId };
            const offDay = await this.offDayService.requestOffDay(dto);
            return apiResponse_1.ApiResponse.success(res, offDay, offDay_constants_1.OFF_DAY_MESSAGES.CREATED, httpStatus_enum_1.HttpStatus.CREATED);
        };
        this.getMyOffDays = async (req, res) => {
            const authReq = req;
            const userId = authReq.auth?.userId;
            if (!userId) {
                return apiResponse_1.ApiResponse.error(res, offDay_constants_1.OFF_DAY_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            }
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const offDays = await this.offDayService.getOffDays(userId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            return apiResponse_1.ApiResponse.success(res, offDays, offDay_constants_1.OFF_DAY_MESSAGES.FETCHED);
        };
        this.getStylistOffDays = async (req, res) => {
            const { stylistId } = req.params;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const offDays = await this.offDayService.getOffDays(stylistId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            return apiResponse_1.ApiResponse.success(res, offDays, offDay_constants_1.OFF_DAY_MESSAGES.FETCHED);
        };
        this.getAllOffDays = async (req, res) => {
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const offDays = await this.offDayService.getAllOffDays(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            return apiResponse_1.ApiResponse.success(res, offDays, offDay_constants_1.OFF_DAY_MESSAGES.FETCHED);
        };
        this.updateStatus = async (req, res) => {
            const { id } = req.params;
            const authReq = req;
            const adminId = authReq.auth?.userId;
            if (!adminId) {
                return apiResponse_1.ApiResponse.error(res, offDay_constants_1.OFF_DAY_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            }
            const dto = req.body;
            const offDay = await this.offDayService.updateOffDayStatus(id, adminId, dto);
            return apiResponse_1.ApiResponse.success(res, offDay, offDay_constants_1.OFF_DAY_MESSAGES.UPDATED);
        };
        this.deleteOffDay = async (req, res) => {
            const { id } = req.params;
            await this.offDayService.deleteOffDay(id);
            return apiResponse_1.ApiResponse.success(res, undefined, offDay_constants_1.OFF_DAY_MESSAGES.DELETED);
        };
    }
};
exports.OffDayController = OffDayController;
exports.OffDayController = OffDayController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.OffDayService)),
    __metadata("design:paramtypes", [Object])
], OffDayController);
