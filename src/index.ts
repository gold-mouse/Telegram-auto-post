import { authenticate } from './auth';
import { IDs } from './chatIDs';
import { CONFIG, SESSIONS_DIR } from './config';

import fs from 'fs'

fs.mkdirSync(SESSIONS_DIR, { recursive: true });

var sentMessages = []; // Array to keep track of sent messages  
var banedGroup = []; // Array to keep track of sent messages

const runBot = async () => {

    const client = await authenticate(CONFIG['api_id'], CONFIG['api_hash']);

    const sleep = (min: number) => new Promise((resolve) => setTimeout(resolve, min * 1000 * 60));

    const deletePreviousMessages = async () => {
        if (sentMessages.length == 0)
            return true

        for (let { chatId, messageId } of sentMessages)
            await client.deleteMessages(chatId, [messageId], { revoke: false });

        sentMessages = [];
        return true
    };

    while (true) {
        try {
            let curHour = new Date().getHours();
            if (curHour > 22 || curHour < 5) {
                await sleep(60 * 60) // Sleep for 1 hour
                continue
            }
            const deleted = await deletePreviousMessages();
            if (!deleted) {
                sentMessages = []
                continue
            }
            for (let i = 0; i < IDs.length; i++) {
                if (banedGroup.includes(IDs[i])) continue

                let before_banned = banedGroup.length
                client.sendMessage(IDs[i], { message: `
**Chrome Automation & Data Extracting!**
**Master of selenium, selenium-wire and undetected_chrome! **

I am ready to share my previous work with you!
                    ` })
                    .then(result => sentMessages.push({ chatId: IDs[i], messageId: result.id }))
                    .catch(_ => banedGroup.push(IDs[i]))
                    .finally(() => console.log(`${before_banned == banedGroup.length ? 'Sent' : 'Failed to send'} message to ${IDs[i]}`));

                await sleep(5); // Sleep for 5 minutes
            }
        } catch (_) {
            console.error('Failed to delete messages');
        }
        sleep(60 * 3) // Sleep for 3 hours
    }

};

runBot()
