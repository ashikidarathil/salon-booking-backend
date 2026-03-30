"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchModel = void 0;
const mongoose_1 = require("mongoose");
const branchSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
    },
    longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    defaultBreaks: {
        type: [
            {
                startTime: String,
                endTime: String,
                description: String,
            },
        ],
        default: [
            { startTime: '13:00', endTime: '14:00', description: 'Lunch Break' },
            { startTime: '16:00', endTime: '16:30', description: 'Tea Break' },
        ],
    },
}, {
    timestamps: true,
});
branchSchema.index({ latitude: 1, longitude: 1 });
exports.BranchModel = (0, mongoose_1.model)('Branch', branchSchema);
