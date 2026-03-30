"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = void 0;
exports.API_ROUTES = {
    ADMIN: {
        BASE: '/',
        BY_ID: (id) => `/${id}`,
    },
    USER: {
        CREATE_ORDER: '/create-order',
        VERIFY: '/verify',
        PAY_WITH_WALLET: '/pay-with-wallet',
        PAY_REMAINING_ORDER: '/create-remaining-order',
        PAY_REMAINING_WALLET: '/pay-remaining-with-wallet',
    },
};
