"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistBreakRepository = void 0;
const stylistBreak_model_1 = require("../../../models/stylistBreak.model");
const tsyringe_1 = require("tsyringe");
const baseRepository_1 = require("../../../common/repository/baseRepository");
let StylistBreakRepository = class StylistBreakRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(stylistBreak_model_1.StylistBreakModel);
    }
    toEntity(doc) {
        return doc;
    }
    async find(filter, populate, sort = { startTime: 1 }) {
        return super.find(filter, populate, sort);
    }
};
exports.StylistBreakRepository = StylistBreakRepository;
exports.StylistBreakRepository = StylistBreakRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], StylistBreakRepository);
