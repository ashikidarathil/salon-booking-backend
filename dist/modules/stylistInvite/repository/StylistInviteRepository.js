"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistInviteRepository = void 0;
const tsyringe_1 = require("tsyringe");
const stylistInvite_model_1 = require("../../../models/stylistInvite.model");
let StylistInviteRepository = class StylistInviteRepository {
    async createInvite(data) {
        const doc = await stylistInvite_model_1.StylistInviteModel.create({
            email: data.email,
            userId: data.userId,
            tokenHash: data.tokenHash,
            rawToken: data.rawToken,
            inviteLink: data.inviteLink,
            expiresAt: data.expiresAt,
            status: 'PENDING',
            specialization: data.specialization,
            experience: data.experience,
            createdBy: data.createdBy,
        });
        return this.toEntity(doc);
    }
    async findPendingByTokenHash(tokenHash) {
        const doc = await stylistInvite_model_1.StylistInviteModel.findOne({ tokenHash, status: 'PENDING' }).lean();
        return doc ? this.toEntity(doc) : null;
    }
    async markAccepted(inviteId) {
        await stylistInvite_model_1.StylistInviteModel.findByIdAndUpdate(inviteId, {
            status: 'ACCEPTED',
            usedAt: new Date(),
        });
    }
    async markExpired(inviteId) {
        await stylistInvite_model_1.StylistInviteModel.findByIdAndUpdate(inviteId, { status: 'EXPIRED' });
    }
    async cancelByUserId(userId) {
        await stylistInvite_model_1.StylistInviteModel.updateMany({ userId, status: 'PENDING' }, { status: 'CANCELLED' });
    }
    async findLatestByUserIds(userIds) {
        const docs = await stylistInvite_model_1.StylistInviteModel.find({ userId: { $in: userIds } })
            .sort({ createdAt: -1 })
            .lean();
        const map = {};
        docs.forEach((d) => {
            const uid = d.userId.toString();
            if (!map[uid])
                map[uid] = this.toEntity(d);
        });
        return map;
    }
    toEntity(doc) {
        return {
            id: doc._id.toString(),
            email: doc.email,
            userId: doc.userId.toString(),
            tokenHash: doc.tokenHash,
            rawToken: doc.rawToken,
            inviteLink: doc.inviteLink,
            expiresAt: doc.expiresAt,
            status: doc.status,
            usedAt: doc.usedAt,
            specialization: doc.specialization,
            experience: doc.experience,
            createdBy: doc.createdBy.toString(),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
};
exports.StylistInviteRepository = StylistInviteRepository;
exports.StylistInviteRepository = StylistInviteRepository = __decorate([
    (0, tsyringe_1.injectable)()
], StylistInviteRepository);
