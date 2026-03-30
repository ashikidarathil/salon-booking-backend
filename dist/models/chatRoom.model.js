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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoomModel = exports.ChatRoomStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ChatRoomStatus;
(function (ChatRoomStatus) {
    ChatRoomStatus["OPEN"] = "OPEN";
    ChatRoomStatus["CLOSED"] = "CLOSED";
})(ChatRoomStatus || (exports.ChatRoomStatus = ChatRoomStatus = {}));
const ChatRoomSchema = new mongoose_1.Schema({
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: false,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    stylistId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Stylist',
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: Object.values(ChatRoomStatus),
        default: ChatRoomStatus.OPEN,
        index: true,
    },
    lastMessage: {
        type: String,
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Unique room per User-Stylist pair
ChatRoomSchema.index({ userId: 1, stylistId: 1 }, { unique: true });
exports.ChatRoomModel = mongoose_1.default.model('ChatRoom', ChatRoomSchema);
