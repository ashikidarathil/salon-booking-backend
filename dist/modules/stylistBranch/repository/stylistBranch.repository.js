"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistBranchRepository = void 0;
const stylistBranch_model_1 = require("../../../models/stylistBranch.model");
class StylistBranchRepository {
    findActiveByStylistId(stylistId) {
        return stylistBranch_model_1.StylistBranchModel.findOne({ stylistId, isActive: true });
    }
    findActiveByBranchId(branchId) {
        return stylistBranch_model_1.StylistBranchModel.find({ branchId, isActive: true }).sort({ createdAt: -1 });
    }
    createAssignment(stylistId, branchId, assignedBy) {
        return stylistBranch_model_1.StylistBranchModel.create({
            stylistId,
            branchId,
            assignedBy,
            isActive: true,
            assignedAt: new Date(),
            unassignedAt: null,
        });
    }
    deactivateAssignment(stylistId, branchId) {
        return stylistBranch_model_1.StylistBranchModel.findOneAndUpdate({ stylistId, branchId, isActive: true }, { isActive: false, unassignedAt: new Date() }, { new: true });
    }
    deactivateAnyActiveAssignment(stylistId) {
        return stylistBranch_model_1.StylistBranchModel.findOneAndUpdate({ stylistId, isActive: true }, { isActive: false, unassignedAt: new Date() }, { new: true });
    }
}
exports.StylistBranchRepository = StylistBranchRepository;
