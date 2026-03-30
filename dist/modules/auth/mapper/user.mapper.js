"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
class UserMapper {
    static toSafeUser(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profilePicture: user.profilePicture ?? null,
            isActive: user.isActive,
            isBlocked: user.isBlocked,
            authProvider: user.authProvider,
            branchId: user.branchId,
        };
    }
}
exports.UserMapper = UserMapper;
