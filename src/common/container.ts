import { container } from 'tsyringe';
import { TOKENS } from './di/tokens';
import type { IImageService } from './service/image/IImageService';
import { S3Service } from './service/image/S3Service';

import { QueryBuilderService } from './service/queryBuilder/queryBuilder.service';

container.register<IImageService>(TOKENS.ImageService, {
  useClass: S3Service,
});

container.registerSingleton<QueryBuilderService>(TOKENS.QueryBuilder, QueryBuilderService);

export { container };
