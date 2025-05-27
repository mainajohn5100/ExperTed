
import { config } from 'dotenv';
config();

import '@/ai/flows/smart-replies.ts';
import '@/ai/flows/suggest-tags.ts';
import '@/ai/flows/create-ticket-from-email-flow.ts';
import '@/ai/flows/notify-admin-flow.ts';
