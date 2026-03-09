import { PayOS } from '@payos/node';
import dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.PAYOS_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

if (!clientId || !apiKey || !checksumKey) {
  throw new Error(
    'Thiếu các biến môi trường trong file .env. Vui lòng kiểm tra lại.'
  );
}

export const payOS = new PayOS({
  clientId,
  apiKey,
  checksumKey
});
