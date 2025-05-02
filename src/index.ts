import { authenticate } from './auth';
import { IDs } from './chatIDs';
import { CONFIG, SESSIONS_DIR } from './config';

import fs from 'fs'

try {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
} catch (err) {
    console.error('Failed to create sessions directory:', err);
}

var sentMessages = []; // Array to keep track of sent messages  
var banedGroup: string[] = []; // Array to keep track of sent messages

const runBot = async () => {
    console.log('------------------- Bot Started -------------------');

    const client = await authenticate(CONFIG['api_id'], CONFIG['api_hash']);

    var expireTime = 0

    // Function to format the date to YYYY-MM-DD HH:mm:ss  
    const formatDateToString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based  
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const formatDurationFromMilliseconds = (milliseconds: number) => {
        // Constants for time conversions  
        const secondsInHour = 3600; // 60 minutes * 60 seconds  
        const secondsInMinute = 60;

        // Calculate total seconds from milliseconds  
        const totalSeconds = Math.floor(milliseconds / 1000);

        // Calculate hours, minutes, and seconds  
        const hours = Math.floor(totalSeconds / secondsInHour);
        const minutes = Math.floor((totalSeconds % secondsInHour) / secondsInMinute);
        const seconds = totalSeconds % secondsInMinute;

        // Construct the formatted string  
        return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min ${seconds} s`;
    }

    // The functin to generate timeouts between 1 and 1 hour 30 minutes
    const generateRandomDuration = () => {
        // 1 hour in milliseconds  
        const oneHour = 60 * 60 * 1000; // 3,600,000 milliseconds  
        // 1 hour 30 minutes in milliseconds  
        const oneHourThirtyMinutes = (1 * 60 + 30) * 60 * 1000; // 5,400,000 milliseconds  

        // Generate a random number between oneHour and oneHourThirtyMinutes  
        const randomDuration = Math.floor(Math.random() * (oneHourThirtyMinutes - oneHour + 1)) + oneHour;

        return Number(randomDuration); // Returns the duration in milliseconds  
    }

    // The function to set the expiration time
    const setExpirationTime = async () => {
        let duration = await generateRandomDuration();
        expireTime = new Date().getTime() + duration;
        console.log('Next posting will start after ', formatDurationFromMilliseconds(duration));
        console.log('Next Posting Time: ', formatDateToString(new Date(new Date().getTime() + duration)) + '\n');
        return duration
    }

    const postingStart = async () => {
        if (expireTime < new Date().getTime()) {
            console.log('******************** Posting started ********************')
            await setExpirationTime()
            await postToChannel()
        }
    }

    // Function to delete sent messages  
    const deletePreviousMessages = async () => {
        if (sentMessages.length == 0) {
            console.log('~~~~~~~~~~~~~~~~~~~~ There is no message to delete ~~~~~~~~~~~~~~~~~~~~')
            return true
        }
        // Delete the messages in the sentMessages array one by one

        try {
            for (const { chatId, messageId } of sentMessages) {
                await client.deleteMessages(chatId, [messageId], { revoke: false });
                console.log('Message deleted successfully:', messageId);
            }
            // Clear the sentMessages array after deletion  
            sentMessages.length = 0;
            return true
        } catch (error) {
            console.error('Error deleting messages:', error);
        }
    };

    // The function to post on some channel
    const postToChannel = async () => {

        // Delete previous messages before sending new ones  
        const deleted = await deletePreviousMessages();
        if (!deleted) return;
        console.log('<<<<<<---------------------------->>>>>')

        for (let i = 0; i < IDs.length; i++) {
            if (banedGroup.includes(IDs[i])) continue
            setTimeout(async () => {
                try {
                    const result = await client.sendMessage(IDs[i], {
                        message: "YOUR MESSAGE HERE."
                    });
                    sentMessages.push({ chatId: IDs[i], messageId: result.id });
                    console.log('^_^ . ^_^ . ^_^ . ^_^ Posted Successfully! ^_^ . ^_^ . ^_^ . ^_^');
                } catch (error) {
                    banedGroup.push(IDs[i])
                    console.info(IDs[i])
                    console.error('Error sending message:', error);
                }
            }, 1000 * 60); // post every 60 seconds
        }
    }

    const serverStart = async () => {
        console.log('******************* Server is running now ****************')
        await postToChannel()
        console.log('===========      First Message Is Sent Successfully      =========')
        await setExpirationTime()
        setInterval(() => {
            postingStart()
        }, 60 * 1000 * 5) // check if it's time to post every 10 minutes
    }

    serverStart()

};

(async () => {
    await runBot().catch(console.error);
})()
