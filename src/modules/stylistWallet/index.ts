import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { StylistWalletRepository } from './repository/stylistWallet.repository';
import { StylistWalletService } from './service/stylistWallet.service';
import { StylistWalletController } from './controller/stylistWallet.controller';

// Repositories
container.registerSingleton(TOKENS.StylistWalletRepository, StylistWalletRepository);

// Services
container.registerSingleton(TOKENS.StylistWalletService, StylistWalletService);

// Controllers
container.registerSingleton(TOKENS.StylistWalletController, StylistWalletController);

export const resolveStylistWalletController = () =>
  container.resolve<StylistWalletController>(TOKENS.StylistWalletController);
