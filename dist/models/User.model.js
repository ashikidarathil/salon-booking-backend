"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userRole_enum_1 = require("../common/enums/userRole.enum");
const authProvider_enum_1 = require("../common/enums/authProvider.enum");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
    },
    emailVerified: { type: Boolean, default: false },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    phoneVerified: { type: Boolean, default: false },
    password: {
        type: String,
        required: function () {
            return this.authProvider === authProvider_enum_1.AuthProvider.LOCAL && this.status !== 'APPLIED';
        },
        select: false,
    },
    authProvider: {
        type: String,
        enum: Object.values(authProvider_enum_1.AuthProvider),
        default: authProvider_enum_1.AuthProvider.LOCAL,
    },
    googleId: { type: String },
    role: {
        type: String,
        enum: Object.values(userRole_enum_1.UserRole),
        default: userRole_enum_1.UserRole.USER,
    },
    isActive: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['APPLIED', 'PENDING', 'ACCEPTED', 'ACTIVE', 'REJECTED', 'EXPIRED'],
        default: 'ACTIVE',
    },
    profilePicture: { type: String, default: null },
}, { timestamps: true });
exports.UserModel = (0, mongoose_1.model)('User', UserSchema);
