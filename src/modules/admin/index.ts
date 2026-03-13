import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import { UserRepository } from '../auth/repository/UserRepository';
import type { IUserRepository } from '../auth/repository/IUserRepository';

import { UserController } from './controller/UserController';
import type { IUserAdminService } from './service/IUserAdminService';
import { UserAdminService } from './service/UserAdminService';
import { QueryBuilderService } from '../../common/service/queryBuilder/queryBuilder.service';
import { IAdminDashboardService } from './service/IAdminDashboardService';
import { AdminDashboardService } from './service/AdminDashboardService';
import { AdminDashboardController } from './controller/admin.stats.controller';

container.registerSingleton<QueryBuilderService>(TOKENS.QueryBuilder, QueryBuilderService);
container.registerSingleton<IUserAdminService>(TOKENS.UserAdminService, UserAdminService);
container.registerSingleton<IUserRepository>(TOKENS.UserRepository, UserRepository);
container.registerSingleton<IAdminDashboardService>(TOKENS.AdminDashboardService, AdminDashboardService);

container.register(UserController, { useClass: UserController });
container.register(AdminDashboardController, { useClass: AdminDashboardController });

export const resolveUserController = () => container.resolve(UserController);
export const resolveAdminDashboardController = () => container.resolve(AdminDashboardController);
