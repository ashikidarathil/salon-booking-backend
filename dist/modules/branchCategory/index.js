"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBranchCategoryController = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const branchCategory_repository_1 = require("./repository/branchCategory.repository");
const branchCategory_service_1 = require("./service/branchCategory.service");
const branchCategory_controller_1 = require("./controller/branchCategory.controller");
tsyringe_1.container.register(tokens_1.TOKENS.BranchCategoryRepository, {
    useClass: branchCategory_repository_1.BranchCategoryRepository,
});
tsyringe_1.container.register(tokens_1.TOKENS.BranchCategoryService, {
    useClass: branchCategory_service_1.BranchCategoryService,
});
tsyringe_1.container.register(branchCategory_controller_1.BranchCategoryController, { useClass: branchCategory_controller_1.BranchCategoryController });
const resolveBranchCategoryController = () => tsyringe_1.container.resolve(branchCategory_controller_1.BranchCategoryController);
exports.resolveBranchCategoryController = resolveBranchCategoryController;
