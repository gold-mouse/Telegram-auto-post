"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = exports.SESSIONS_DIR = exports.ROOT_DIR = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.ROOT_DIR = path_1.default.resolve(__dirname, "../");
exports.SESSIONS_DIR = path_1.default.resolve(`${exports.ROOT_DIR}/sessions`);
exports.CONFIG = {
    api_id: parseInt(process.env.API_ID),
    api_hash: process.env.API_HASH,
};
