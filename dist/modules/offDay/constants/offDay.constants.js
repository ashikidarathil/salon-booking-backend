"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OFF_DAY_ROUTES = exports.OFF_DAY_MESSAGES = void 0;
exports.OFF_DAY_MESSAGES = {
    FETCHED: 'Off-days fetched successfully',
    CREATED: 'Off-day request created successfully',
    UPDATED: 'Off-day request updated successfully',
    DELETED: 'Off-day request deleted successfully',
    APPROVED: 'Off-day request approved successfully',
    REJECTED: 'Off-day request rejected successfully',
    NOT_FOUND: 'Off-day request not found',
    FAILED_STATUS: 'Failed to process off-day status',
    UNAUTHORIZED: 'Unauthorized',
    INVALID_DATE: 'Leave requests must be made at least 3 days in advance.',
};
exports.OFF_DAY_ROUTES = {
    BASE: '/off-days',
    BY_ID: '/:id',
    BY_STYLIST: '/stylist/:stylistId',
    APPROVE: '/:id/approve',
    REJECT: '/:id/reject',
    MY: '/my',
    STATUS: '/status',
};
