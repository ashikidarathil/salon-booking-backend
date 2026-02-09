import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import { BranchCategoryRepository } from './repository/branchCategory.repository';
import type { IBranchCategoryRepository } from './repository/IBranchCategoryRepository';

import { BranchCategoryService } from './service/branchCategory.service';
import type { IBranchCategoryService } from './service/IBranchCategoryService';

import { BranchCategoryController } from './controller/branchCategory.controller';

container.register<IBranchCategoryRepository>(TOKENS.BranchCategoryRepository, {
  useClass: BranchCategoryRepository,
});

container.register<IBranchCategoryService>(TOKENS.BranchCategoryService, {
  useClass: BranchCategoryService,
});

container.register(BranchCategoryController, { useClass: BranchCategoryController });

export const resolveBranchCategoryController = () => container.resolve(BranchCategoryController);
