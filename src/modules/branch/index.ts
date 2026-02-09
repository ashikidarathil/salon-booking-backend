import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import type { IBranchRepository } from './repository/IBranchRepository';
import { BranchRepository } from './repository/branch.repository';

import type { IBranchService } from './service/IBranchService';
import { BranchService } from './service/branch.service';

import { BranchController } from './controller/branch.controller';

container.register<IBranchRepository>(TOKENS.BranchRepository, {
  useClass: BranchRepository,
});

container.register<IBranchService>(TOKENS.BranchService, {
  useClass: BranchService,
});

container.register(BranchController, {
  useClass: BranchController,
});

export const resolveBranchController = () => container.resolve(BranchController);
