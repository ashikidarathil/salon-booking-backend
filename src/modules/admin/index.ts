import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import { UserRepository } from '../auth/repository/UserRepository';
import type { IUserRepository } from '../auth/repository/IUserRepository';

import { UserController } from './controller/UserController';
import type { IUserAdminService } from './service/IUserAdminService';
import { UserAdminService } from './service/UserAdminService';
import { QueryBuilderService } from '../../common/service/queryBuilder/queryBuilder.service';

container.registerSingleton<QueryBuilderService>(TOKENS.QueryBuilder, QueryBuilderService);
container.registerSingleton<IUserAdminService>(TOKENS.UserAdminService, UserAdminService);
container.registerSingleton<IUserRepository>(TOKENS.UserRepository, UserRepository); // Add this line

container.register(UserController, { useClass: UserController });

export const resolveUserController = () => container.resolve(UserController);
