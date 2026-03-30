"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const appError_1 = require("./appError");
const httpStatus_enum_1 = require("../enums/httpStatus.enum");
class ValidationError extends appError_1.AppError {
    constructor(errors) {
        const message = errors.map((e) => `${e.field}: ${e.message}`).join(', ');
        super(message, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
