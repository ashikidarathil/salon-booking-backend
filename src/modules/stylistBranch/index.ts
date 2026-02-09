import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import { StylistBranchRepository } from './repository/stylistBranch.repository';
import type { IStylistBranchRepository } from './repository/IStylistBranchRepository';

import { StylistBranchService } from './service/stylistBranch.service';
import type { IStylistBranchService } from './service/IStylistBranchService';

import { StylistBranchController } from './controller/stylistBranch.controller';

container.register<IStylistBranchRepository>(TOKENS.StylistBranchRepository, {
  useClass: StylistBranchRepository,
});

container.register<IStylistBranchService>(TOKENS.StylistBranchService, {
  useClass: StylistBranchService,
});

container.register(StylistBranchController, {
  useClass: StylistBranchController,
});

export const resolveStylistBranchController = () => container.resolve(StylistBranchController);
