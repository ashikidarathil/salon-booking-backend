"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WALLET_MESSAGES = void 0;
exports.WALLET_MESSAGES = {
    INVALID_AMOUNT: 'Amount must be greater than zero',
    INSUFFICIENT_BALANCE: 'Insufficient wallet balance',
    UPDATE_FAILED: 'Failed to update wallet balance',
    WALLET_NOT_FOUND: 'Wallet not found',
    FETCH_SUCCESS: 'Wallet details fetched successfully',
    TRANSACTIONS_FETCH_SUCCESS: 'Wallet transactions fetched successfully',
    CREDIT_SUCCESS: 'Wallet credited successfully',
    DEBIT_SUCCESS: 'Wallet debited successfully',
    TOPUP_ORDER_SUCCESS: 'Order created successfully',
    MIN_TOPUP_ERROR: 'Minimum top-up amount is ₹100',
    INVALID_SIGNATURE: 'Invalid payment signature',
    PAYMENT_NOT_FOUND: 'Payment record not found',
};
