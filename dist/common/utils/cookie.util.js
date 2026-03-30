"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = void 0;
exports.createAuthTokens = createAuthTokens;
const env_1 = require("../../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function createAuthTokens(userId, role, tabId) {
    const payload = { userId, role, tabId };
    const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.ACCESS_TOKEN_SECRET, {
        expiresIn: env_1.env.ACCESS_TOKEN_EXPIRES || '15m',
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.env.REFRESH_TOKEN_SECRET, {
        expiresIn: env_1.env.REFRESH_TOKEN_EXPIRES || '7d',
    });
    return { accessToken, refreshToken };
}
const isProd = env_1.env.NODE_ENV === 'production';
const cookieDomain = isProd ? '.salonbook.online' : undefined;
const setAuthCookies = (res, role, tokens) => {
    const rolePrefix = role.toLowerCase();
    const baseOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        ...(cookieDomain && { domain: cookieDomain }),
    };
    res.cookie(`${rolePrefix}_access_token`, tokens.accessToken, {
        ...baseOptions,
        maxAge: 15 * 60 * 1000,
    });
    res.cookie(`${rolePrefix}_refresh_token`, tokens.refreshToken, {
        ...baseOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};
exports.setAuthCookies = setAuthCookies;
const clearAuthCookies = (res, role) => {
    const clearOptions = {
        path: '/',
        ...(cookieDomain && { domain: cookieDomain })
    };
    if (role) {
        const rolePrefix = role.toLowerCase();
        res.clearCookie(`${rolePrefix}_access_token`, clearOptions);
        res.clearCookie(`${rolePrefix}_refresh_token`, clearOptions);
    }
    else {
        ['user', 'admin', 'stylist'].forEach(r => {
            res.clearCookie(`${r}_access_token`, clearOptions);
            res.clearCookie(`${r}_refresh_token`, clearOptions);
        });
    }
};
exports.clearAuthCookies = clearAuthCookies;
// const isProd = env.NODE_ENV === 'production';
// export const setAuthCookies = (
//   res: Response,
//   role: UserRole,
//   tokens: { accessToken: string; refreshToken: string },
// ) => {
//   const rolePrefix = role.toLowerCase();
//   const baseOptions = {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: 'lax' as const,
//       path: '/',
//       ...(isProd && { domain: '.salonbook.online' }),
// };
//   // Access Token: Short-lived (15m)
//   res.cookie(`${rolePrefix}_access_token`, tokens.accessToken, {
//     ...baseOptions,
//     maxAge: 15 * 60 * 1000,
//   });
//   // Refresh Token: Long-lived (7d)
//   res.cookie(`${rolePrefix}_refresh_token`, tokens.refreshToken, {
//     ...baseOptions,
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });
// };
// export const clearAuthCookies = (res: Response, role?: UserRole) => {
//   if (role) {
//     const rolePrefix = role.toLowerCase();
//     res.clearCookie(`${rolePrefix}_access_token`, { path: '/' });
//     res.clearCookie(`${rolePrefix}_refresh_token`, { path: '/' });
//   } else {
//     res.clearCookie('user_access_token', { path: '/' });
//     res.clearCookie('user_refresh_token', { path: '/' });
//     res.clearCookie('admin_access_token', { path: '/' });
//     res.clearCookie('admin_refresh_token', { path: '/' });
//     res.clearCookie('stylist_access_token', { path: '/' });
//     res.clearCookie('stylist_refresh_token', { path: '/' });
//   }
// };
