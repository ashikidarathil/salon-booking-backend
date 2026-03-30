"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const tsyringe_1 = require("tsyringe");
Object.defineProperty(exports, "container", { enumerable: true, get: function () { return tsyringe_1.container; } });
const tokens_1 = require("./di/tokens");
const S3Service_1 = require("./service/image/S3Service");
const queryBuilder_service_1 = require("./service/queryBuilder/queryBuilder.service");
tsyringe_1.container.register(tokens_1.TOKENS.ImageService, {
    useClass: S3Service_1.S3Service,
});
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.QueryBuilder, queryBuilder_service_1.QueryBuilderService);
