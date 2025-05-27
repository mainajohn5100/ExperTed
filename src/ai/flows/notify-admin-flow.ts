
'use server';
/**
 * @fileOverview A Genkit flow to generate notification messages for an admin based on ticket events.
 *
 * - notifyAdmin - Generates an admin notification message.
 * - AdminNotificationInput - The input type for the notifyAdmin function.
 * - AdminNotificationOutput - The return type for the notifyAdmin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AdminNotificationInputSchema = z.object({
  ticketId: z.string().describe('The ID of the ticket related to the event.'),
  eventType: z.enum(['new_ticket', 'status_change', 'new_reply', 'ticket_assigned']).describe('The type of event that occurred.'),
  details: z.string().describe('A summary of the event (e.g., "Ticket created by John Doe", "Status changed to Active by Alice", "User Bob replied", "Ticket assigned to Jane").'),
  ticketTitle: z.string().optional().describe('The title of the ticket, if relevant.'),
});
export type AdminNotificationInput = z.infer<typeof AdminNotificationInputSchema>;

export const AdminNotificationOutputSchema = z.object({
  notificationMessage: z.string().describe('The formatted notification message for the admin.'),
  sent: z.boolean().describe('Indicates if the notification was (conceptually) sent.'),
});
export type AdminNotificationOutput = z.infer<typeof AdminNotificationOutputSchema>;

export async function notifyAdmin(input: AdminNotificationInput): Promise<AdminNotificationOutput> {
  return notifyAdminFlow(input);
}

const notificationPrompt = ai.definePrompt({
  name: 'notifyAdminPrompt',
  input: {schema: AdminNotificationInputSchema},
  output: {schema: AdminNotificationOutputSchema},
  prompt: `You are an AI assistant for an admin notification system.
Craft a concise and informative notification message for an administrator based on the following ticket event:

Event Type: {{{eventType}}}
Ticket ID: {{{ticketId}}}
{{#if ticketTitle}}Ticket Title: {{{ticketTitle}}}{{/if}}
Details: {{{details}}}

Examples:
- New Ticket: "🔔 New Ticket #{{{ticketId}}}: '{{{ticketTitle}}}' created. Details: {{{details}}}."
- Status Change: "🔄 Ticket #{{{ticketId}}} status changed. Details: {{{details}}}."
- New Reply: "💬 New reply on ticket #{{{ticketId}}}. Details: {{{details}}}."
- Ticket Assigned: "👤 Ticket #{{{ticketId}}} assigned. Details: {{{details}}}."

Generate the notificationMessage field. Set "sent" to true.
`,
});

const notifyAdminFlow = ai.defineFlow(
  {
    name: 'notifyAdminFlow',
    inputSchema: AdminNotificationInputSchema,
    outputSchema: AdminNotificationOutputSchema,
  },
  async (input) => {
    const {output} = await notificationPrompt(input);
    if (!output) {
        throw new Error('AI failed to generate notification message.')
    }
    // In a real app, this is where you'd integrate with an email/SMS/push notification service.
    // For now, we simulate sending.
    return {
      notificationMessage: output.notificationMessage,
      sent: true,
    };
  }
);
