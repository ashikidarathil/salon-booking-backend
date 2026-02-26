import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { WishlistRepository } from './repository/WishlistRepository';
import { WishlistService } from './service/WishlistService';
import { WishlistController } from './controller/WishlistController';

// Repository
container.registerSingleton(TOKENS.WishlistRepository, WishlistRepository);

// Service
container.registerSingleton(TOKENS.WishlistService, WishlistService);

// Controller
container.registerSingleton(TOKENS.WishlistController, WishlistController);

export function resolveWishlistController(): WishlistController {
  return container.resolve<WishlistController>(TOKENS.WishlistController);
}
