"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const StylistInviteMapper_1 = require("../mapper/StylistInviteMapper");
const WishlistService_1 = require("../../wishlist/service/WishlistService");
const notification_model_1 = require("../../../models/notification.model");
let StylistService = class StylistService {
    constructor(_stylistRepo, _inviteRepo, _wishlistService, _notificationService) {
        this._stylistRepo = _stylistRepo;
        this._inviteRepo = _inviteRepo;
        this._wishlistService = _wishlistService;
        this._notificationService = _notificationService;
    }
    async listAllWithInviteStatus() {
        const list = await this._stylistRepo.listAll();
        const inviteMap = await this._inviteRepo.findLatestByUserIds(list.map((x) => x.userId));
        const merged = list.map((stylist) => {
            if (stylist.status === 'ACTIVE') {
                return { ...stylist, inviteStatus: 'ACCEPTED' };
            }
            return { ...stylist, inviteStatus: inviteMap[stylist.userId]?.status };
        });
        return StylistInviteMapper_1.StylistMapper.toListResponseArray(merged);
    }
    async getPaginatedStylists(query) {
        return this._stylistRepo.getPaginatedStylists(query);
    }
    async toggleBlockStylist(stylistId, isBlocked) {
        const stylist = await this._stylistRepo.setBlockedById(stylistId, isBlocked);
        if (stylist) {
            this._notificationService
                .createNotification({
                recipientId: stylist.userId,
                type: notification_model_1.NotificationType.SYSTEM,
                title: isBlocked ? 'Account Blocked' : 'Account Unblocked',
                message: `Your account has been ${isBlocked ? 'blocked' : 'unblocked'} by the administrator.`,
            })
                .catch(() => { }); // Silent failure for notifications
        }
        return stylist;
    }
    async updateStylistPosition(stylistId, position) {
        const stylist = await this._stylistRepo.updatePosition(stylistId, position);
        if (stylist) {
            this._notificationService
                .createNotification({
                recipientId: stylist.userId,
                type: notification_model_1.NotificationType.SYSTEM,
                title: 'Position Updated',
                message: `Your professional position has been updated to ${position}.`,
            })
                .catch(() => { }); // Silent failure for notifications
        }
        return stylist;
    }
    async getPublicStylists(query, userId) {
        const publicQuery = {
            ...query,
            status: 'ACTIVE',
            isBlocked: false,
            isActive: true,
        };
        const result = await this._stylistRepo.getPaginatedStylists(publicQuery);
        if (userId && result.data.length > 0) {
            const favorites = await this._wishlistService.getFavoritesForStylists(userId, result.data.map((s) => s.id));
            result.data = result.data.map((s) => ({
                ...s,
                isFavorite: favorites.has(s.id),
            }));
        }
        return result;
    }
    async getPublicStylistById(stylistId, userId) {
        const stylist = await this._stylistRepo.getById(stylistId);
        if (!stylist || stylist.status !== 'ACTIVE' || stylist.isBlocked) {
            return null;
        }
        if (userId) {
            stylist.isFavorite = await this._wishlistService.isFavorite(userId, stylistId);
        }
        return stylist;
    }
};
exports.StylistService = StylistService;
exports.StylistService = StylistService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistInviteRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.WishlistService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [Object, Object, WishlistService_1.WishlistService, Object])
], StylistService);
