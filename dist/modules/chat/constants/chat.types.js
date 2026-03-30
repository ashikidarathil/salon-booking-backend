"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenderType = exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["VOICE"] = "VOICE";
    MessageType["SYSTEM"] = "SYSTEM";
})(MessageType || (exports.MessageType = MessageType = {}));
var SenderType;
(function (SenderType) {
    SenderType["USER"] = "USER";
    SenderType["STYLIST"] = "STYLIST";
    SenderType["SYSTEM"] = "SYSTEM";
})(SenderType || (exports.SenderType = SenderType = {}));
