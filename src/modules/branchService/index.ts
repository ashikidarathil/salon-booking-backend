import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import { BranchServiceRepository } from './repository/branchService.repository';
import type { IBranchServiceRepository } from './repository/IBranchServiceRepository';

import { BranchServiceService } from './service/branchService.service';
import type { IBranchServiceService } from './service/IBranchServiceService';

import { BranchServiceController } from './controller/branchService.controller';

container.register<IBranchServiceRepository>(TOKENS.BranchServiceRepository, {
  useClass: BranchServiceRepository,
});

container.register<IBranchServiceService>(TOKENS.BranchServiceService, {
  useClass: BranchServiceService,
});

container.register(BranchServiceController, { useClass: BranchServiceController });

export const resolveBranchServiceController = () => container.resolve(BranchServiceController);
