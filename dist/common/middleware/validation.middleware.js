"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validationError_1 = require("../errors/validationError");
const validate = (schema) => {
    return async (req, _res, next) => {
        try {
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            if (schema.query) {
                const parsed = await schema.query.parseAsync(req.query);
                Object.assign(req.query, parsed);
            }
            if (schema.params) {
                const parsed = await schema.params.parseAsync(req.params);
                Object.assign(req.params, parsed);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const validationFields = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                next(new validationError_1.ValidationError(validationFields));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
