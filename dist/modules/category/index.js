"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCategoryController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const category_repository_1 = require("./repository/category.repository");
const category_service_1 = require("./service/category.service");
const category_controller_1 = require("./controller/category.controller");
tsyringe_1.container.register(tokens_1.TOKENS.CategoryRepository, {
    useClass: category_repository_1.CategoryRepository,
});
tsyringe_1.container.register(tokens_1.TOKENS.CategoryService, {
    useClass: category_service_1.CategoryService,
});
tsyringe_1.container.register(category_controller_1.CategoryController, { useClass: category_controller_1.CategoryController });
const resolveCategoryController = () => tsyringe_1.container.resolve(category_controller_1.CategoryController);
exports.resolveCategoryController = resolveCategoryController;
