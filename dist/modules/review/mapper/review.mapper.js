"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewMapper = void 0;
const tsyringe_1 = require("tsyringe");
let ReviewMapper = class ReviewMapper {
    toDto(review) {
        const user = review.userId;
        const userId = user && typeof user === 'object' && '_id' in user ? user._id.toString() : String(user);
        const userName = user && typeof user === 'object' && 'name' in user && user.name
            ? user.name
            : 'Anonymous User';
        const profilePicture = user && typeof user === 'object' && 'profilePicture' in user
            ? user.profilePicture
            : undefined;
        return {
            id: review._id.toString(),
            userId: {
                _id: userId,
                name: userName,
                profilePicture,
            },
            bookingId: review.bookingId.toString(),
            stylistId: review.stylistId.toString(),
            serviceId: review.serviceId.toString(),
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            isDeleted: review.isDeleted,
        };
    }
    toDtoList(reviews) {
        return reviews.map((review) => this.toDto(review));
    }
};
exports.ReviewMapper = ReviewMapper;
exports.ReviewMapper = ReviewMapper = __decorate([
    (0, tsyringe_1.injectable)()
], ReviewMapper);
