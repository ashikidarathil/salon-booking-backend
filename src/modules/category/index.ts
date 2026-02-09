import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import type { ICategoryRepository } from './repository/ICategoryRepository';
import { CategoryRepository } from './repository/category.repository';

import type { ICategoryService } from './service/ICategoryService';
import { CategoryService } from './service/category.service';

import { CategoryController } from './controller/category.controller';

container.register<ICategoryRepository>(TOKENS.CategoryRepository, {
  useClass: CategoryRepository,
});

container.register<ICategoryService>(TOKENS.CategoryService, {
  useClass: CategoryService,
});

container.register(CategoryController, { useClass: CategoryController });

export const resolveCategoryController = () => container.resolve(CategoryController);
