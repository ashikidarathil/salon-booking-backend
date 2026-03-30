"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdString = exports.isValidObjectId = exports.toObjectId = exports.ObjectId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.ObjectId = mongoose_1.default.Types.ObjectId;
const toObjectId = (id) => {
    return new mongoose_1.default.Types.ObjectId(id);
};
exports.toObjectId = toObjectId;
const isValidObjectId = (id) => {
    return mongoose_1.default.Types.ObjectId.isValid(id);
};
exports.isValidObjectId = isValidObjectId;
const getIdString = (field) => {
    if (field && typeof field === 'object' && '_id' in field) {
        return field._id.toString();
    }
    return field?.toString() ?? '';
};
exports.getIdString = getIdString;
