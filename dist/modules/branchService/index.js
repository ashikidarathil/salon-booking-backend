"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBranchServiceController = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const branchService_repository_1 = require("./repository/branchService.repository");
const branchService_service_1 = require("./service/branchService.service");
const branchService_controller_1 = require("./controller/branchService.controller");
tsyringe_1.container.register(tokens_1.TOKENS.BranchServiceRepository, {
    useClass: branchService_repository_1.BranchServiceRepository,
});
tsyringe_1.container.register(tokens_1.TOKENS.BranchServiceService, {
    useClass: branchService_service_1.BranchServiceService,
});
tsyringe_1.container.register(branchService_controller_1.BranchServiceController, { useClass: branchService_controller_1.BranchServiceController });
const resolveBranchServiceController = () => tsyringe_1.container.resolve(branchService_controller_1.BranchServiceController);
exports.resolveBranchServiceController = resolveBranchServiceController;
