"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBranchController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const branch_repository_1 = require("./repository/branch.repository");
const branch_service_1 = require("./service/branch.service");
const branch_controller_1 = require("./controller/branch.controller");
tsyringe_1.container.register(tokens_1.TOKENS.BranchRepository, {
    useClass: branch_repository_1.BranchRepository,
});
tsyringe_1.container.register(tokens_1.TOKENS.BranchService, {
    useClass: branch_service_1.BranchService,
});
tsyringe_1.container.register(branch_controller_1.BranchController, {
    useClass: branch_controller_1.BranchController,
});
const resolveBranchController = () => tsyringe_1.container.resolve(branch_controller_1.BranchController);
exports.resolveBranchController = resolveBranchController;
