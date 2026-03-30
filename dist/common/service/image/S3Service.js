"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
const tsyringe_1 = require("tsyringe");
const env_1 = require("../../../config/env");
let S3Service = class S3Service {
    constructor() {
        this.s3 = new aws_sdk_1.default.S3({
            accessKeyId: env_1.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env_1.env.AWS_SECRET_ACCESS_KEY,
            region: env_1.env.AWS_REGION,
        });
        this.bucketName = env_1.env.AWS_S3_BUCKET_NAME;
    }
    async uploadProfilePicture(params) {
        const { file, userId, role } = params;
        const optimizedBuffer = await (0, sharp_1.default)(file.buffer)
            .resize(400, 400, { fit: 'cover', position: 'center' })
            .jpeg({ quality: 80 })
            .toBuffer();
        const key = `profiles/${role}/${userId}/${(0, uuid_1.v4)()}.jpg`;
        const result = await this.s3
            .upload({
            Bucket: this.bucketName,
            Key: key,
            Body: optimizedBuffer,
            ContentType: 'image/jpeg',
            Metadata: {
                userId,
                role,
                uploadDate: new Date().toISOString(),
            },
        })
            .promise();
        return result.Location;
    }
    async deleteProfilePicture(pictureUrl) {
        const key = new URL(pictureUrl).pathname.substring(1);
        await this.s3
            .deleteObject({
            Bucket: this.bucketName,
            Key: key,
        })
            .promise();
    }
    async uploadServiceImage(params) {
        const { file, serviceId } = params;
        const optimizedBuffer = await (0, sharp_1.default)(file.buffer)
            .resize(800, 600, { fit: 'cover', position: 'center' })
            .jpeg({ quality: 85 })
            .toBuffer();
        const key = `services/${serviceId}/${(0, uuid_1.v4)()}.jpg`;
        const result = await this.s3
            .upload({
            Bucket: this.bucketName,
            Key: key,
            Body: optimizedBuffer,
            ContentType: 'image/jpeg',
            Metadata: {
                serviceId,
                uploadDate: new Date().toISOString(),
            },
        })
            .promise();
        return result.Location;
    }
    async deleteServiceImage(imageUrl) {
        const key = new URL(imageUrl).pathname.substring(1);
        await this.s3
            .deleteObject({
            Bucket: this.bucketName,
            Key: key,
        })
            .promise();
    }
    async uploadAudio(params) {
        const { file, roomId, senderId } = params;
        // Use original extension or default to mp3/m4a
        const ext = file.originalname.split('.').pop() || 'webm';
        const key = `chat/audio/${roomId}/${senderId}/${(0, uuid_1.v4)()}.${ext}`;
        const result = await this.s3
            .upload({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype || 'audio/webm',
            Metadata: {
                roomId,
                senderId,
                uploadDate: new Date().toISOString(),
            },
        })
            .promise();
        return result.Location;
    }
    async uploadChatImage(params) {
        const { file, roomId, senderId } = params;
        const ext = file.originalname.split('.').pop() || 'jpg';
        const key = `chat/images/${roomId}/${senderId}/${(0, uuid_1.v4)()}.${ext}`;
        const result = await this.s3
            .upload({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype || 'image/jpeg',
            Metadata: {
                roomId,
                senderId,
                uploadDate: new Date().toISOString(),
            },
        })
            .promise();
        return result.Location;
    }
    async deleteAudio(audioUrl) {
        const key = new URL(audioUrl).pathname.substring(1);
        await this.s3
            .deleteObject({
            Bucket: this.bucketName,
            Key: key,
        })
            .promise();
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);
