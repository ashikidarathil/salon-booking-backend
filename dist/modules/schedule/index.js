"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveScheduleController = resolveScheduleController;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const weeklySchedule_repository_1 = require("./repository/weeklySchedule.repository");
const dailyOverride_repository_1 = require("./repository/dailyOverride.repository");
const stylistBreak_repository_1 = require("./repository/stylistBreak.repository");
const schedule_service_1 = require("./service/schedule.service");
const schedule_controller_1 = require("./controller/schedule.controller");
// Repositories
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.WeeklyScheduleRepository, weeklySchedule_repository_1.WeeklyScheduleRepository);
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.DailyOverrideRepository, dailyOverride_repository_1.DailyOverrideRepository);
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.StylistBreakRepository, stylistBreak_repository_1.StylistBreakRepository);
// Service
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.ScheduleService, schedule_service_1.ScheduleService);
// Controller
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.ScheduleController, schedule_controller_1.ScheduleController);
function resolveScheduleController() {
    return tsyringe_1.container.resolve(tokens_1.TOKENS.ScheduleController);
}
