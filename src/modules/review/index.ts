import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { ReviewRepository } from './repository/review.repository';
import { ReviewService } from './service/review.service';
import { ReviewController } from './controller/review.controller';
import { ReviewMapper } from './mapper/review.mapper';

container.registerSingleton(TOKENS.ReviewRepository, ReviewRepository);
container.registerSingleton(TOKENS.ReviewService, ReviewService);
container.registerSingleton(TOKENS.ReviewController, ReviewController);
container.registerSingleton(TOKENS.ReviewMapper, ReviewMapper);

export { ReviewController };
