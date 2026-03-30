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
const mongoose_1 = __importDefault(require("mongoose"));
const container_1 = require("../common/container");
const tokens_1 = require("../common/di/tokens");
const db_1 = require("../config/db");
// Force register modules
require("../modules/registry");
const slot_model_1 = require("../models/slot.model");
const branch_model_1 = require("../models/branch.model");
const stylistWeeklySchedule_model_1 = require("../models/stylistWeeklySchedule.model");
const slot_model_2 = require("../models/slot.model");
const booking_model_1 = require("../models/booking.model");
async function verify() {
    console.log('--- Starting Verification Script ---');
    await (0, db_1.connectDB)();
    const slotService = container_1.container.resolve(tokens_1.TOKENS.SlotService);
    const bookingService = container_1.container.resolve(tokens_1.TOKENS.BookingService);
    // 1. Setup Test Data
    console.log('Setting up test data...');
    // Cleanup existing test data if any
    await branch_model_1.BranchModel.deleteMany({ name: 'Test Branch' });
    const branch = await branch_model_1.BranchModel.create({
        name: 'Test Branch',
        address: '123 Test St',
        latitude: 0,
        longitude: 0,
        phone: '1234567890',
    });
    const stylistId = new mongoose_1.default.Types.ObjectId();
    // Link stylist to branch
    const { StylistBranchModel } = await Promise.resolve().then(() => __importStar(require('../models/stylistBranch.model')));
    await StylistBranchModel.create({
        stylistId,
        branchId: branch._id,
        isActive: true,
        assignedAt: new Date(),
        assignedBy: new mongoose_1.default.Types.ObjectId(),
    });
    // Create schedule for Monday (day 1)
    await stylistWeeklySchedule_model_1.StylistWeeklyScheduleModel.create({
        stylistId,
        branchId: branch._id,
        dayOfWeek: 1,
        isWorkingDay: true,
        shifts: [{ startTime: '09:00', endTime: '10:00' }],
    });
    // 2. Test Slot Generation
    console.log('Testing Slot Generation...');
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7));
    nextMonday.setUTCHours(0, 0, 0, 0);
    await slotService.generateSlots(branch._id.toString(), nextMonday, nextMonday);
    const slots = await slot_model_2.SlotModel.find({ branchId: branch._id, date: nextMonday });
    console.log(`Generated ${slots.length} slots. (Expected: 2 slots of 30 mins each)`);
    if (slots.length !== 2) {
        throw new Error(`Slot generation failed. Expected 2, got ${slots.length}`);
    }
    // 3. Test Slot Locking
    console.log('Testing Slot Locking...');
    const slotId = slots[0]._id.toString();
    const userId = new mongoose_1.default.Types.ObjectId().toString();
    await slotService.lockSlot(slotId, userId);
    const lockedSlot = await slot_model_2.SlotModel.findById(slotId);
    console.log(`Slot status: ${lockedSlot?.status} (Expected: LOCKED)`);
    if (lockedSlot?.status !== slot_model_1.SlotStatus.LOCKED) {
        throw new Error('Slot locking failed');
    }
    // 4. Test Booking Creation
    console.log('Testing Booking Creation...');
    const serviceId = new mongoose_1.default.Types.ObjectId().toString(); // Dummy service
    const { BranchServiceModel } = await Promise.resolve().then(() => __importStar(require('../models/branchService.model')));
    await BranchServiceModel.create({
        branchId: branch._id,
        serviceId: new mongoose_1.default.Types.ObjectId(serviceId),
        price: 100,
        duration: 30,
        isActive: true,
        updatedBy: new mongoose_1.default.Types.ObjectId(),
    });
    try {
        const booking = await bookingService.createBooking(userId, slotId, serviceId, 'Test notes');
        console.log(`Booking created: ${booking.id}`);
        const bookedSlot = await slot_model_2.SlotModel.findById(slotId);
        console.log(`Slot status: ${bookedSlot?.status} (Expected: BOOKED)`);
        if (bookedSlot?.status !== slot_model_1.SlotStatus.BOOKED) {
            throw new Error('Booking failed to update slot status');
        }
    }
    catch (error) {
        const err = error;
        if (err.codeName === 'IllegalOperation' || err.message.includes('replica set')) {
            console.warn('⚠️ SKIP: Booking Creation test skipped because local MongoDB is not a Replica Set (Transactions not supported).');
            console.warn('To test this, please run your MongoDB as a replica set.');
        }
        else {
            throw error;
        }
    }
    // 4b. Test Cron Cleanup Logic
    console.log('Testing Cron Cleanup (Manual trigger)...');
    const tempSlot = await slot_model_2.SlotModel.create({
        branchId: branch._id,
        stylistId,
        date: nextMonday,
        startTime: '11:00',
        endTime: '11:30',
        startTimeUTC: new Date(),
        status: slot_model_1.SlotStatus.LOCKED,
        lockedUntil: new Date(Date.now() - 1000), // Expired 1 sec ago
    });
    await slotService.cleanupExpiredLocks();
    const cleanedSlot = await slot_model_2.SlotModel.findById(tempSlot._id);
    console.log(`Expired slot status: ${cleanedSlot?.status} (Expected: AVAILABLE)`);
    if (cleanedSlot?.status !== slot_model_1.SlotStatus.AVAILABLE) {
        throw new Error('Cron cleanup logic failed');
    }
    await slot_model_2.SlotModel.findByIdAndDelete(tempSlot._id);
    // 5. Cleanup
    console.log('Cleaning up...');
    await branch_model_1.BranchModel.findByIdAndDelete(branch._id);
    await stylistWeeklySchedule_model_1.StylistWeeklyScheduleModel.deleteMany({ branchId: branch._id });
    await slot_model_2.SlotModel.deleteMany({ branchId: branch._id });
    await booking_model_1.BookingModel.deleteMany({ branchId: branch._id });
    await BranchServiceModel.deleteMany({ branchId: branch._id });
    await StylistBranchModel.deleteMany({ branchId: branch._id });
    console.log('--- Verification Successful! ---');
    process.exit(0);
}
verify().catch((err) => {
    console.error('Verification failed:', err);
    process.exit(1);
});
