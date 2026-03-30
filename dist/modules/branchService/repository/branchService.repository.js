"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchServiceRepository = void 0;
const branchService_model_1 = require("../../../models/branchService.model");
class BranchServiceRepository {
    findByBranchId(branchId) {
        return branchService_model_1.BranchServiceModel.find({ branchId }).sort({ createdAt: -1 });
    }
    upsert(branchId, serviceId, payload, updatedBy) {
        return branchService_model_1.BranchServiceModel.findOneAndUpdate({ branchId, serviceId }, { branchId, serviceId, ...payload, updatedBy }, { new: true, upsert: true });
    }
    toggleStatus(branchId, serviceId, isActive, updatedBy) {
        return branchService_model_1.BranchServiceModel.findOneAndUpdate({ branchId, serviceId }, { isActive, updatedBy }, { new: true, upsert: true });
    }
    findOne(branchId, serviceId) {
        return branchService_model_1.BranchServiceModel.findOne({ branchId, serviceId });
    }
}
exports.BranchServiceRepository = BranchServiceRepository;
