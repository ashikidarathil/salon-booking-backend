import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';

import { UserController } from './controller/UserController';
import type { IUserAdminService } from './service/IUserAdminService';
import { UserAdminService } from './service/UserAdminService';

container.registerSingleton<IUserAdminService>(TOKENS.UserAdminService, UserAdminService);

container.register(UserController, { useClass: UserController });

export const resolveUserController = () => container.resolve(UserController);
