"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveOffDayController = resolveOffDayController;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const offDay_repository_1 = require("./repository/offDay.repository");
const offDay_service_1 = require("./service/offDay.service");
const offDay_controller_1 = require("./controller/offDay.controller");
// Repository
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.OffDayRepository, offDay_repository_1.OffDayRepository);
// Service
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.OffDayService, offDay_service_1.OffDayService);
// Controller
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.OffDayController, offDay_controller_1.OffDayController);
function resolveOffDayController() {
    return tsyringe_1.container.resolve(tokens_1.TOKENS.OffDayController);
}
