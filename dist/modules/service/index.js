"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveServiceController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const service_repository_1 = require("./repository/service.repository");
const service_service_1 = require("./service/service.service");
const service_controller_1 = require("./controller/service.controller");
tsyringe_1.container.register(tokens_1.TOKENS.ServiceRepository, {
    useClass: service_repository_1.ServiceRepository,
});
tsyringe_1.container.register(tokens_1.TOKENS.ServiceService, {
    useClass: service_service_1.ServiceService,
});
tsyringe_1.container.register(service_controller_1.ServiceController, {
    useClass: service_controller_1.ServiceController,
});
const resolveServiceController = () => tsyringe_1.container.resolve(service_controller_1.ServiceController);
exports.resolveServiceController = resolveServiceController;
