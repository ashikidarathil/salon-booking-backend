"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioSmsService = void 0;
const tsyringe_1 = require("tsyringe");
const twilio_1 = __importDefault(require("twilio"));
const env_1 = require("../../../config/env");
let TwilioSmsService = class TwilioSmsService {
    constructor() {
        this.client = (0, twilio_1.default)(env_1.env.TWILIO_ACCOUNT_SID, env_1.env.TWILIO_AUTH_TOKEN);
    }
    async sendSms(params) {
        await this.client.messages.create({
            body: params.message,
            from: env_1.env.TWILIO_PHONE_NUMBER,
            to: params.to,
        });
    }
};
exports.TwilioSmsService = TwilioSmsService;
exports.TwilioSmsService = TwilioSmsService = __decorate([
    (0, tsyringe_1.injectable)()
], TwilioSmsService);
