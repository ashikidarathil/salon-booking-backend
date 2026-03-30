"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistWalletMapper = void 0;
class StylistWalletMapper {
    static toWalletDto(wallet) {
        return {
            _id: wallet._id.toString(),
            stylistId: wallet.stylistId.toString(),
            withdrawableBalance: wallet.withdrawableBalance,
            pendingWithdrawal: wallet.pendingWithdrawal,
            totalEarnings: wallet.totalEarnings,
            isActive: wallet.isActive,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
        };
    }
}
exports.StylistWalletMapper = StylistWalletMapper;
