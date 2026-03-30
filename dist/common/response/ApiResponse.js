"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    constructor(success, message, data, errors) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
        this.timestamp = new Date().toISOString();
    }
    static success(res, data, message = 'Operation successful', status = 200) {
        return res.status(status).json(new ApiResponse(true, message, data));
    }
    static error(res, message = 'Operation failed', status = 400, errors) {
        return res.status(status).json(new ApiResponse(false, message, undefined, errors));
    }
}
exports.ApiResponse = ApiResponse;
