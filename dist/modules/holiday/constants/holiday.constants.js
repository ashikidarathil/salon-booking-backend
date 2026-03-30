"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOLIDAY_ROUTES = exports.HOLIDAY_MESSAGES = void 0;
exports.HOLIDAY_MESSAGES = {
    FETCHED: 'Holidays fetched successfully',
    CREATED: 'Holiday created successfully',
    DELETED: 'Holiday deleted successfully',
    NOT_FOUND: 'Holiday not found',
};
exports.HOLIDAY_ROUTES = {
    BASE: '/holidays',
    BY_ID: '/:id',
    BY_BRANCH: '/branch/:branchId',
};
