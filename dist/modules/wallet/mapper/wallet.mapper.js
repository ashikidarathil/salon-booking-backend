"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletMapper = void 0;
class WalletMapper {
    static toResponseDto(wallet) {
        return {
            userId: wallet.userId.toString(),
            balance: wallet.balance,
            isActive: wallet.isActive,
        };
    }
    static toTransactionResponseDto(transaction) {
        return {
            id: transaction._id.toString(),
            amount: transaction.amount,
            type: transaction.type,
            status: transaction.status,
            description: transaction.description,
            referenceId: transaction.referenceId?.toString(),
            referenceType: transaction.referenceType,
            createdAt: transaction.createdAt.toISOString(),
        };
    }
    static toTransactionListResponseDto(transactions) {
        return transactions.map((t) => this.toTransactionResponseDto(t));
    }
}
exports.WalletMapper = WalletMapper;
