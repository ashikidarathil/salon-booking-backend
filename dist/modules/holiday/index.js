"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveHolidayController = resolveHolidayController;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const holiday_repository_1 = require("./repository/holiday.repository");
const holiday_service_1 = require("./service/holiday.service");
const holiday_controller_1 = require("./controller/holiday.controller");
// Repository
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.HolidayRepository, holiday_repository_1.HolidayRepository);
// Service
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.HolidayService, holiday_service_1.HolidayService);
// Controller
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.HolidayController, holiday_controller_1.HolidayController);
function resolveHolidayController() {
    return tsyringe_1.container.resolve(tokens_1.TOKENS.HolidayController);
}
