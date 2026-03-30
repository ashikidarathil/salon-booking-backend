"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveStylistBranchController = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const stylistBranch_repository_1 = require("./repository/stylistBranch.repository");
const stylistBranch_service_1 = require("./service/stylistBranch.service");
const stylistBranch_controller_1 = require("./controller/stylistBranch.controller");
tsyringe_1.container.register(tokens_1.TOKENS.StylistBranchRepository, {
    useClass: stylistBranch_repository_1.StylistBranchRepository,
});
tsyringe_1.container.register(tokens_1.TOKENS.StylistBranchService, {
    useClass: stylistBranch_service_1.StylistBranchService,
});
tsyringe_1.container.register(stylistBranch_controller_1.StylistBranchController, {
    useClass: stylistBranch_controller_1.StylistBranchController,
});
const resolveStylistBranchController = () => tsyringe_1.container.resolve(stylistBranch_controller_1.StylistBranchController);
exports.resolveStylistBranchController = resolveStylistBranchController;
