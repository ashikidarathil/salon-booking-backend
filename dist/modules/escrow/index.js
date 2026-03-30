"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const escrow_repository_1 = require("./repository/escrow.repository");
const escrow_service_1 = require("./service/escrow.service");
const escrow_controller_1 = require("./controller/escrow.controller");
// Register Repositories
tsyringe_1.container.register(tokens_1.TOKENS.EscrowRepository, { useClass: escrow_repository_1.EscrowRepository });
// Register Services
tsyringe_1.container.register(tokens_1.TOKENS.EscrowService, { useClass: escrow_service_1.EscrowService });
// Register Controllers
tsyringe_1.container.register(tokens_1.TOKENS.EscrowController, { useClass: escrow_controller_1.EscrowController });
