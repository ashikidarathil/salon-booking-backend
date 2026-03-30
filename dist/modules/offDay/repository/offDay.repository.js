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
exports.OffDayRepository = void 0;
const stylistOffDay_model_1 = require("../../../models/stylistOffDay.model");
const tsyringe_1 = require("tsyringe");
const baseRepository_1 = require("../../../common/repository/baseRepository");
let OffDayRepository = class OffDayRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(stylistOffDay_model_1.StylistOffDayModel);
    }
    toEntity(doc) {
        return doc;
    }
};
exports.OffDayRepository = OffDayRepository;
exports.OffDayRepository = OffDayRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], OffDayRepository);
