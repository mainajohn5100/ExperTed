'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting tags for new tickets
 * based on the content of the query.
 *
 * @exports suggestTags - The main function to suggest tags for a ticket.
 * @exports SuggestTagsInput - The input type for the suggestTags function.
 * @exports SuggestTagsOutput - The output type for the suggestTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  queryContent: z
    .string()
    .describe('The content of the query for which tags are to be suggested.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  suggestedTags: z
    .array(z.string())
    .describe('An array of suggested tags for the query.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const suggestTagsPrompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsInputSchema},
  output: {schema: SuggestTagsOutputSchema},
  prompt: `You are an expert tag suggestion AI.

  Given the following query, suggest relevant tags to categorize it.  Return no more than 5 tags.

  Query: {{{queryContent}}}

  Tags:`,
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async input => {
    const {output} = await suggestTagsPrompt(input);
    return output!;
  }
);
