import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { WalletRepository } from './repository/wallet.repository';
import { WalletTransactionRepository } from './repository/walletTransaction.repository';
import { WalletService } from './service/wallet.service';
import { WalletController } from './controller/wallet.controller';

// Register Repositories
container.register(TOKENS.WalletRepository, { useClass: WalletRepository });
container.register(TOKENS.WalletTransactionRepository, { useClass: WalletTransactionRepository });

// Register Services
container.register(TOKENS.WalletService, { useClass: WalletService });

// Register Controllers
container.register(TOKENS.WalletController, { useClass: WalletController });

export const resolveWalletController = () =>
  container.resolve<WalletController>(TOKENS.WalletController);
