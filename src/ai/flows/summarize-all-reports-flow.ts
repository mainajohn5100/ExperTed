
'use server';
/**
 * @fileOverview A Genkit flow to summarize ticket and project data.
 *
 * - summarizeAllReports - Generates a summary of all tickets and projects.
 * - SummarizeAllReportsInput - The input type for the summarizeAllReports function.
 * - SummarizeAllReportsOutput - The return type for the summarizeAllReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TicketSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(), // Assuming status is a string; adjust if it's a more specific enum from types
  priority: z.string(), // Assuming priority is a string
  createdAt: z.string().datetime(),
  channel: z.string(), // Assuming channel is a string
});

const ProjectSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(), // Assuming status is a string
  createdAt: z.string().datetime(),
  deadline: z.string().datetime().nullable().optional(),
});

export const SummarizeAllReportsInputSchema = z.object({
  tickets: z.array(TicketSummarySchema).describe('An array of ticket objects to summarize.'),
  projects: z.array(ProjectSummarySchema).describe('An array of project objects to summarize.'),
});
export type SummarizeAllReportsInput = z.infer<typeof SummarizeAllReportsInputSchema>;

export const SummarizeAllReportsOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the provided tickets and projects, highlighting key statistics, trends, and overall status.'),
});
export type SummarizeAllReportsOutput = z.infer<typeof SummarizeAllReportsOutputSchema>;

export async function summarizeAllReports(input: SummarizeAllReportsInput): Promise<SummarizeAllReportsOutput> {
  return summarizeAllReportsFlow(input);
}

const summaryPrompt = ai.definePrompt({
  name: 'summarizeAllReportsPrompt',
  input: {schema: SummarizeAllReportsInputSchema},
  output: {schema: SummarizeAllReportsOutputSchema},
  prompt: `You are an AI assistant tasked with generating a comprehensive summary based on lists of tickets and projects.

Analyze the following data:

Tickets:
{{#if tickets.length}}
{{#each tickets}}
- ID: {{id}}, Title: "{{title}}", Status: {{status}}, Priority: {{priority}}, Created: {{createdAt}}, Channel: {{channel}}
{{/each}}
{{else}}
No ticket data provided.
{{/if}}

Projects:
{{#if projects.length}}
{{#each projects}}
- ID: {{id}}, Name: "{{name}}", Status: {{status}}, Created: {{createdAt}}{{#if deadline}}, Deadline: {{deadline}}{{/if}}
{{/each}}
{{else}}
No project data provided.
{{/if}}

Based on this data, provide a concise yet informative "summary".
Your summary should include:
- Total number of tickets and breakdown by status (e.g., New, Pending, Active, Closed).
- Total number of projects and breakdown by status (e.g., New, Active, Completed).
- Any notable trends, urgent items, or key insights from the data.
- Overall health or status of operations based on the provided tickets and projects.

Return the output as a JSON object matching the defined schema.
`,
});

const summarizeAllReportsFlow = ai.defineFlow(
  {
    name: 'summarizeAllReportsFlow',
    inputSchema: SummarizeAllReportsInputSchema,
    outputSchema: SummarizeAllReportsOutputSchema,
  },
  async (input) => {
    const {output} = await summaryPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate the report summary.');
    }
    return output;
  }
);
