"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const telegram_1 = require("telegram");
const sessions_1 = require("telegram/sessions");
const input_1 = __importDefault(require("input"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("./config");
const authenticate = (apiId, apiHash) => __awaiter(void 0, void 0, void 0, function* () {
    const phoneNumber = yield input_1.default.text('📞 Enter your phone number (with country code): ');
    const sessionFilePath = path_1.default.join(config_1.SESSIONS_DIR, `${phoneNumber}.session`);
    let sessionString = '';
    if (fs_1.default.existsSync(sessionFilePath)) {
        sessionString = fs_1.default.readFileSync(sessionFilePath, 'utf-8');
        console.log('🔑 Session loaded from file.');
    }
    const stringSession = new sessions_1.StringSession(sessionString);
    const client = new telegram_1.TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
    if (!sessionString) {
        yield client.start({
            phoneNumber: () => __awaiter(void 0, void 0, void 0, function* () { return phoneNumber; }),
            password: () => __awaiter(void 0, void 0, void 0, function* () { return yield input_1.default.text('🔑 Enter your 2FA password (if set): '); }),
            phoneCode: () => __awaiter(void 0, void 0, void 0, function* () { return yield input_1.default.text('🔓 Enter the code you received: '); }),
            onError: (err) => console.log(err),
        });
        const newSession = client.session.save();
        fs_1.default.writeFileSync(sessionFilePath, newSession, 'utf-8');
        console.log('💾 Session saved.');
    }
    else {
        yield client.connect();
    }
    console.log('✅ Logged in successfully!');
    console.log(client.session.save());
    yield client.sendMessage("me", { message: "Started bot" });
    return client;
});
exports.authenticate = authenticate;
