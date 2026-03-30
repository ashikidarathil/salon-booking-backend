"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESCROW_MESSAGES = exports.EscrowStatus = void 0;
exports.getCurrentDateString = getCurrentDateString;
const escrow_model_1 = require("../../../models/escrow.model");
Object.defineProperty(exports, "EscrowStatus", { enumerable: true, get: function () { return escrow_model_1.EscrowStatus; } });
exports.ESCROW_MESSAGES = {
    HELD_SUCCESS: 'Amount held in escrow successfully',
    RELEASE_SUCCESS: 'Amount released from escrow successfully',
    FETCHED_ALL: 'Escrow records fetched successfully',
    FETCHED_ONE: 'Escrow record fetched successfully',
    HELD_BALANCE: 'Held balance fetched successfully',
    ERROR: {
        NOT_FOUND: 'Escrow record not found',
        INVALID_STATUS: 'Invalid escrow status for this operation',
        ALREADY_RELEASED: 'Escrow amount already released',
        UPDATE_FAILED: 'Failed to update escrow record',
        ALREADY_EXISTS: 'Escrow already exists for this booking',
        UNAUTHORIZED: 'Unauthorized access',
    },
};
function getCurrentDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
