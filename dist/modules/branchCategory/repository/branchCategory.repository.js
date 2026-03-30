"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchCategoryRepository = void 0;
const branchCategory_model_1 = require("../../../models/branchCategory.model");
const category_model_1 = require("../../../models/category.model");
class BranchCategoryRepository {
    findByBranchId(branchId) {
        return branchCategory_model_1.BranchCategoryModel.find({ branchId }).sort({ createdAt: -1 });
    }
    upsert(branchId, categoryId, isActive, updatedBy) {
        return branchCategory_model_1.BranchCategoryModel.findOneAndUpdate({ branchId, categoryId }, { branchId, categoryId, isActive, updatedBy }, { new: true, upsert: true });
    }
    findAllCategories() {
        return category_model_1.CategoryModel.find().select('name isDeleted').lean();
    }
    async findCategoryNameById(categoryId) {
        const category = await category_model_1.CategoryModel.findById(categoryId).select('name').lean();
        return category?.name ?? null;
    }
}
exports.BranchCategoryRepository = BranchCategoryRepository;
