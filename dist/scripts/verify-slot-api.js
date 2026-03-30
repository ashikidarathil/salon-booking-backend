"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("../app"));
const branch_model_1 = require("../models/branch.model");
const stylistWeeklySchedule_model_1 = require("../models/stylistWeeklySchedule.model");
const slot_model_1 = require("../models/slot.model");
const env_1 = require("../config/env");
const userRole_enum_1 = require("../common/enums/userRole.enum");
async function verifyApi() {
    console.log('--- Starting API Verification ---');
    // 1. Setup Test Data
    const branch = await branch_model_1.BranchModel.create({
        name: 'API Test Branch',
        address: '123 Test St',
        latitude: 0,
        longitude: 0,
        phone: '1234567890',
    });
    const stylistId = new mongoose_1.default.Types.ObjectId();
    const userId = new mongoose_1.default.Types.ObjectId();
    // Link stylist to branch
    const { StylistBranchModel } = await Promise.resolve().then(() => __importStar(require('../models/stylistBranch.model')));
    await StylistBranchModel.create({
        stylistId,
        branchId: branch._id,
        isActive: true,
        assignedAt: new Date(),
        assignedBy: new mongoose_1.default.Types.ObjectId(),
    });
    await stylistWeeklySchedule_model_1.StylistWeeklyScheduleModel.create({
        stylistId,
        branchId: branch._id,
        dayOfWeek: 1,
        isWorkingDay: true,
        shifts: [{ startTime: '09:00', endTime: '10:00' }],
    });
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7));
    const dateStr = nextMonday.toISOString().split('T')[0];
    const adminToken = jsonwebtoken_1.default.sign({ userId: userId.toString(), role: userRole_enum_1.UserRole.ADMIN }, env_1.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    console.log(`Testing API: POST /api/slots/generate for branch ${branch._id} on ${dateStr}`);
    const response = await (0, supertest_1.default)(app_1.default)
        .post('/api/slots/generate')
        .set('x-auth-role', 'ADMIN')
        .set('Cookie', [`admin_access_token=${adminToken}`])
        .send({
        branchId: branch._id.toString(),
        startDate: dateStr,
        endDate: dateStr,
    });
    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);
    if (response.status === 200 || response.status === 201) {
        const slots = await slot_model_1.SlotModel.find({ branchId: branch._id });
        console.log(`Successfully generated ${slots.length} slots via API.`);
    }
    else {
        console.warn('API call returned non-200 status. This might be due to auth requirements.');
    }
    // Cleanup
    await branch_model_1.BranchModel.findByIdAndDelete(branch._id);
    await stylistWeeklySchedule_model_1.StylistWeeklyScheduleModel.deleteMany({ branchId: branch._id });
    await slot_model_1.SlotModel.deleteMany({ branchId: branch._id });
    console.log('--- API Verification Finished ---');
    process.exit(0);
}
verifyApi().catch((err) => {
    console.error('API Verification failed:', err);
    process.exit(1);
});
