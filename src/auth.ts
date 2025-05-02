import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import input from 'input';

import path from 'path';
import fs from 'fs';
import { SESSIONS_DIR } from './config';

export const authenticate = async (apiId: number, apiHash: string) => {

    const phoneNumber = await input.text('📞 Enter your phone number (with country code): ');
    const sessionFilePath = path.join(SESSIONS_DIR, `${phoneNumber}.session`);

    let sessionString = '';

    if (fs.existsSync(sessionFilePath)) {
        sessionString = fs.readFileSync(sessionFilePath, 'utf-8');
        console.log('🔑 Session loaded from file.');
    }

    const stringSession = new StringSession(sessionString);
    const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

    if (!sessionString) {
        await client.start({
            phoneNumber: async () => phoneNumber,
            password: async () => await input.text('🔑 Enter your 2FA password (if set): '),
            phoneCode: async () => await input.text('🔓 Enter the code you received: '),
            onError: (err) => console.log(err),
        });

        const newSession: any = client.session.save();
        fs.writeFileSync(sessionFilePath, newSession, 'utf-8');
        console.log('💾 Session saved.');
    } else {
        await client.connect();
    }

    console.log('✅ Logged in successfully!');
    console.log(client.session.save());
    await client.sendMessage("me", { message: "Started bot" });
    return client;
};
