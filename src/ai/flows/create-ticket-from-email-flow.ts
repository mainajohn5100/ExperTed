
'use server';
/**
 * @fileOverview A Genkit flow to process an incoming email and structure it as a support ticket.
 *
 * - createTicketFromEmail - Parses email content and suggests structured ticket data.
 * - CreateTicketFromEmailInput - The input type for the createTicketFromEmail function.
 * - CreateTicketFromEmailOutput - The return type for the createTicketFromEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const CreateTicketFromEmailInputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The HTML or plain text body of the email.'),
  fromEmail: z.string().email().describe('The email address of the sender.'),
  fromName: z.string().optional().describe('The name of the sender, if available.'),
  receivedAt: z.string().datetime().describe('The ISO 8601 timestamp when the email was received.'),
});
export type CreateTicketFromEmailInput = z.infer<typeof CreateTicketFromEmailInputSchema>;

export const CreateTicketFromEmailOutputSchema = z.object({
  title: z.string().describe('A concise title for the ticket, derived from the email subject or body.'),
  description: z.string().describe('A detailed description of the issue, extracted from the email body.'),
  customerName: z.string().describe('The name of the customer who sent the email.'),
  customerEmail: z.string().email().describe('The email address of the customer.'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).describe('The suggested priority for the ticket.'),
  channel: z.enum(['email', 'web-form', 'sms', 'social-media', 'manual']).default('email').describe('The channel through which the ticket originated.'),
  status: z.enum(['new', 'pending', 'active', 'on-hold', 'closed', 'terminated']).default('new').describe('The initial status of the new ticket.'),
  suggestedTags: z.array(z.string()).optional().describe('An array of suggested tags based on the email content.'),
});
export type CreateTicketFromEmailOutput = z.infer<typeof CreateTicketFromEmailOutputSchema>;

export async function createTicketFromEmail(input: CreateTicketFromEmailInput): Promise<CreateTicketFromEmailOutput> {
  return createTicketFromEmailFlow(input);
}

const createTicketPrompt = ai.definePrompt({
  name: 'createTicketFromEmailPrompt',
  input: {schema: CreateTicketFromEmailInputSchema},
  output: {schema: CreateTicketFromEmailOutputSchema},
  prompt: `You are an AI assistant that processes incoming emails and converts them into structured support tickets.
Given the following email details, extract the necessary information.

Email Subject: {{{subject}}}
Email Body:
{{{body}}}
Sender Email: {{{fromEmail}}}
Sender Name: {{{fromName}}}
Received At: {{{receivedAt}}}

Based on this, determine:
- A clear and concise "title" for the ticket.
- A comprehensive "description" of the problem.
- The "customerName".
- The "customerEmail".
- A "priority" (low, medium, high, urgent).
- Suggest a few relevant "suggestedTags" (e.g., "billing", "login issue", "feature request").
Set "channel" to "email" and "status" to "new".

Return the output as a JSON object matching the defined schema.
`,
});

const createTicketFromEmailFlow = ai.defineFlow(
  {
    name: 'createTicketFromEmailFlow',
    inputSchema: CreateTicketFromEmailInputSchema,
    outputSchema: CreateTicketFromEmailOutputSchema,
  },
  async (input) => {
    // In a real application, you might first try to find an existing user by input.fromEmail
    // For now, we'll use the provided fromName or derive it.
    const customerName = input.fromName || input.fromEmail.split('@')[0];

    const {output} = await createTicketPrompt({
        ...input,
        fromName: customerName, // Ensure fromName is passed to the prompt
    });
    
    if (!output) {
      throw new Error('AI failed to process the email into a ticket structure.');
    }
    
    // Ensure defaults are applied if AI doesn't provide them
    return {
      ...output,
      customerName: output.customerName || customerName,
      customerEmail: output.customerEmail || input.fromEmail,
      priority: output.priority || 'medium',
      channel: output.channel || 'email',
      status: output.status || 'new',
    };
  }
);
