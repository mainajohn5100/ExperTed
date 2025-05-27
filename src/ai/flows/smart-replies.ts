// 'use server'
'use server';

/**
 * @fileOverview Provides smart reply suggestions for tickets based on canned responses or ticket history.
 *
 * - getSmartReplies - A function that suggests canned responses or summarizes previous tickets.
 * - SmartRepliesInput - The input type for the getSmartReplies function.
 * - SmartRepliesOutput - The return type for the getSmartReplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartRepliesInputSchema = z.object({
  ticketContent: z.string().describe('The content of the current ticket.'),
  userId: z.string().describe('The ID of the user who submitted the ticket.'),
});
export type SmartRepliesInput = z.infer<typeof SmartRepliesInputSchema>;

const SmartRepliesOutputSchema = z.object({
  suggestedResponse: z.string().describe('A suggested canned response for the ticket.'),
  ticketSummary: z.string().describe('A summary of previous tickets from the same user.'),
});
export type SmartRepliesOutput = z.infer<typeof SmartRepliesOutputSchema>;

export async function getSmartReplies(input: SmartRepliesInput): Promise<SmartRepliesOutput> {
  return smartRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartRepliesPrompt',
  input: {schema: SmartRepliesInputSchema},
  output: {schema: SmartRepliesOutputSchema},
  prompt: `You are an AI assistant helping to provide smart replies for customer support tickets.

  Given the content of the current ticket and the user ID, suggest a canned response and summarize previous tickets from the same user.

  Current Ticket Content: {{{ticketContent}}}
  User ID: {{{userId}}}

  Suggested Canned Response: {{suggestedResponse}}
  Summary of Previous Tickets: {{ticketSummary}}`,
});

const smartRepliesFlow = ai.defineFlow(
  {
    name: 'smartRepliesFlow',
    inputSchema: SmartRepliesInputSchema,
    outputSchema: SmartRepliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
