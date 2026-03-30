"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSlotController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const slot_service_1 = require("./service/slot.service");
const SlotValidator_1 = require("./service/SlotValidator");
const AvailabilityService_1 = require("./service/AvailabilityService");
const SpecialSlotService_1 = require("./service/SpecialSlotService");
const slot_controller_1 = require("./controller/slot.controller");
const slot_repository_1 = require("./repository/slot.repository");
tsyringe_1.container.register(tokens_1.TOKENS.SlotRepository, {
    useClass: slot_repository_1.SlotRepository,
});
tsyringe_1.container.register(tokens_1.TOKENS.SlotValidator, {
    useClass: SlotValidator_1.SlotValidator,
});
tsyringe_1.container.register(tokens_1.TOKENS.AvailabilityService, {
    useClass: AvailabilityService_1.AvailabilityService,
});
tsyringe_1.container.register(tokens_1.TOKENS.SpecialSlotService, {
    useClass: SpecialSlotService_1.SpecialSlotService,
});
tsyringe_1.container.register(tokens_1.TOKENS.SlotService, {
    useClass: slot_service_1.SlotService,
});
tsyringe_1.container.register(slot_controller_1.SlotController, {
    useClass: slot_controller_1.SlotController,
});
const resolveSlotController = () => tsyringe_1.container.resolve(slot_controller_1.SlotController);
exports.resolveSlotController = resolveSlotController;
