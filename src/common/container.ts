import { container } from 'tsyringe';
import { TOKENS } from './di/tokens';
import type { IImageService } from './service/image/IImageService';
import { CloudinaryService } from './service/image/CloudinaryService';

import { QueryBuilderService } from './service/queryBuilder/queryBuilder.service';

container.register<IImageService>(TOKENS.ImageService, {
  useClass: CloudinaryService,
});

container.registerSingleton<QueryBuilderService>(TOKENS.QueryBuilder, QueryBuilderService);

export { container };
