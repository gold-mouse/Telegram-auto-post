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
const auth_1 = require("./auth");
const chatIDs_1 = require("./chatIDs");
const config_1 = require("./config");
const fs_1 = __importDefault(require("fs"));
fs_1.default.mkdirSync(config_1.SESSIONS_DIR, { recursive: true });
var sentMessages = []; // Array to keep track of sent messages  
var banedGroup = []; // Array to keep track of sent messages
const runBot = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield (0, auth_1.authenticate)(config_1.CONFIG['api_id'], config_1.CONFIG['api_hash']);
    const sleep = (min) => new Promise((resolve) => setTimeout(resolve, min * 1000 * 60));
    const deletePreviousMessages = () => __awaiter(void 0, void 0, void 0, function* () {
        if (sentMessages.length == 0)
            return true;
        for (let { chatId, messageId } of sentMessages)
            yield client.deleteMessages(chatId, [messageId], { revoke: false });
        sentMessages = [];
        return true;
    });
    while (true) {
        try {
            const deleted = yield deletePreviousMessages();
            if (!deleted) {
                sentMessages = [];
                continue;
            }
            for (let i = 0; i < chatIDs_1.IDs.length; i++) {
                if (banedGroup.includes(chatIDs_1.IDs[i]))
                    continue;
                let before_banned = banedGroup.length;
                client.sendMessage(chatIDs_1.IDs[i], { message: `
**Chrome Automation & Data Extracting!**
**Master of selenium, selenium-wire and undetected_chrome! **

I am ready to share my previous work with you!
                    ` })
                    .then(result => sentMessages.push({ chatId: chatIDs_1.IDs[i], messageId: result.id }))
                    .catch(_ => banedGroup.push(chatIDs_1.IDs[i]))
                    .finally(() => console.log(`${before_banned == banedGroup.length ? 'Sent' : 'Failed to send'} message to ${chatIDs_1.IDs[i]}`));
                yield sleep(120); // Sleep for 2 hours
            }
        }
        catch (_) {
            console.error('Failed to delete messages');
        }
    }
});
runBot();
