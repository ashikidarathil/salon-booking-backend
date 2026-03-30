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
exports.StylistBranchController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const stylistBranch_messages_1 = require("../constants/stylistBranch.messages");
let StylistBranchController = class StylistBranchController {
    constructor(_service) {
        this._service = _service;
        this.list = async (req, res) => {
            const { branchId } = req.params;
            const data = await this._service.listBranchStylists(branchId);
            return res.json(new apiResponse_1.ApiResponse(true, stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.LISTED, data));
        };
        this.options = async (req, res) => {
            const { branchId } = req.params;
            const data = await this._service.listUnassignedOptions(branchId);
            return res.json(new apiResponse_1.ApiResponse(true, stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.OPTIONS_LISTED, data));
        };
        this.assign = async (req, res) => {
            const { branchId } = req.params;
            const adminId = req.auth?.userId;
            const data = await this._service.assign(branchId, { stylistId: String(req.body.stylistId || '') }, adminId);
            return res
                .status(httpStatus_enum_1.HttpStatus.CREATED)
                .json(new apiResponse_1.ApiResponse(true, stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.ASSIGNED, data));
        };
        this.unassign = async (req, res) => {
            const { branchId } = req.params;
            const data = await this._service.unassign(branchId, {
                stylistId: String(req.body.stylistId || ''),
            });
            return res.json(new apiResponse_1.ApiResponse(true, stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.UNASSIGNED, data));
        };
        this.changeBranch = async (req, res) => {
            const { branchId } = req.params;
            const adminId = req.auth?.userId;
            const data = await this._service.changeBranch(branchId, { stylistId: String(req.body.stylistId || '') }, adminId);
            return res.json(new apiResponse_1.ApiResponse(true, stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.CHANGED, data));
        };
        this.listPaginated = async (req, res) => {
            const { branchId } = req.params;
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
                search: typeof req.query.search === 'string' ? req.query.search : undefined,
                sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
                sortOrder: req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                    ? req.query.sortOrder
                    : 'desc',
            };
            const data = await this._service.listBranchStylistsPaginated(branchId, query);
            return res.json(new apiResponse_1.ApiResponse(true, stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.LISTED, data));
        };
        this.optionsPaginated = async (req, res) => {
            const { branchId } = req.params;
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
                search: typeof req.query.search === 'string' ? req.query.search : undefined,
                sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
                sortOrder: req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                    ? req.query.sortOrder
                    : 'desc',
            };
            const data = await this._service.listUnassignedOptionsPaginated(branchId, query);
            return res.json(new apiResponse_1.ApiResponse(true, stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.OPTIONS_LISTED, data));
        };
        this.getStylistBranches = async (req, res) => {
            const { stylistId } = req.params;
            const data = await this._service.getStylistBranches(stylistId);
            return res.json(new apiResponse_1.ApiResponse(true, stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.LISTED, data));
        };
    }
};
exports.StylistBranchController = StylistBranchController;
exports.StylistBranchController = StylistBranchController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistBranchService)),
    __metadata("design:paramtypes", [Object])
], StylistBranchController);
