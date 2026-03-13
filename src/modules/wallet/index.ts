import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { WalletRepository } from './repository/wallet.repository';
import { WalletTransactionRepository } from './repository/walletTransaction.repository';
import { WalletService } from './service/wallet.service';
import { WalletController } from './controller/wallet.controller';
import { PaymentRepository } from '../payment/repository/payment.repository';
import { RazorpayService } from '../payment/service/razorpay.service';

// Register Repositories
container.register(TOKENS.WalletRepository, { useClass: WalletRepository });
container.register(TOKENS.WalletTransactionRepository, { useClass: WalletTransactionRepository });

// Ensure RazorpayService + PaymentRepository are registered (needed by WalletService for topup)
if (!container.isRegistered(TOKENS.PaymentRepository)) {
  container.registerSingleton(TOKENS.PaymentRepository, PaymentRepository);
}
if (!container.isRegistered(TOKENS.RazorpayService)) {
  container.registerSingleton(TOKENS.RazorpayService, RazorpayService);
}

// Register Services
container.register(TOKENS.WalletService, { useClass: WalletService });

// Register Controllers
container.register(TOKENS.WalletController, { useClass: WalletController });

export const resolveWalletController = () =>
  container.resolve<WalletController>(TOKENS.WalletController);
