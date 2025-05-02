import dotenv from "dotenv";
import path from "path";
dotenv.config();

export const ROOT_DIR = path.resolve(__dirname, "../");
export const SESSIONS_DIR = path.resolve(`${ROOT_DIR}/sessions`);

export const CONFIG: {
    api_id: number;
    api_hash: string;
} = {
    api_id: parseInt(process.env.API_ID),
    api_hash: process.env.API_HASH,
};
