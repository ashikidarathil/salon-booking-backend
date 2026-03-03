import { IWallet } from '../../../models/wallet.model';
import { IWalletTransaction } from '../../../models/walletTransaction.model';
import { WalletResponseDto, WalletTransactionResponseDto } from '../dto/wallet.dto';

export class WalletMapper {
  static toResponseDto(wallet: IWallet): WalletResponseDto {
    return {
      userId: wallet.userId.toString(),
      balance: wallet.balance,
      isActive: wallet.isActive,
    };
  }

  static toTransactionResponseDto(transaction: IWalletTransaction): WalletTransactionResponseDto {
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

  static toTransactionListResponseDto(
    transactions: IWalletTransaction[],
  ): WalletTransactionResponseDto[] {
    return transactions.map((t) => this.toTransactionResponseDto(t));
  }
}
