
'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { suggestTags, SuggestTagsInput } from "@/ai/flows/suggest-tags";
import { notifyAdmin, AdminNotificationInput } from "@/ai/flows/notify-admin-flow";
import { Loader2, Tag, Lightbulb, PlusCircle } from 'lucide-react';
import type { Ticket, TicketPriority, TicketChannel, TicketDocumentStatus } from "@/types";
import { AppHeader } from "@/components/layout/header";
import { PageTitle } from "@/components/common/page-title";
import { createTicketInAppwrite, createNotification } from '@/lib/data';

const priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];
const channels: TicketChannel[] = ["email", "sms", "social-media", "web-form", "manual"];
const ADMIN_USER_ID = "admin_user"; // Placeholder for actual admin user ID

export default function NewTicketPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [channel, setChannel] = useState<TicketChannel>('manual');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  
  const [suggestedTagsAI, setSuggestedTagsAI] = useState<string[]>([]);
  const [isTagSuggestionLoading, setIsTagSuggestionLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuggestTags = async () => {
    if (!description.trim()) {
      toast({ variant: "destructive", title: "Missing Content", description: "Please enter ticket description to suggest tags." });
      return;
    }
    setIsTagSuggestionLoading(true);
    setSuggestedTagsAI([]);
    try {
      const input: SuggestTagsInput = { queryContent: description };
      const result = await suggestTags(input);
      setSuggestedTagsAI(result.suggestedTags.filter(tag => !currentTags.includes(tag))); 
    } catch (error) {
      console.error("Error fetching tag suggestions:", error);
      toast({ variant: "destructive", title: "Tag Suggestion Error", description: "Could not fetch tag suggestions." });
    } finally {
      setIsTagSuggestionLoading(false);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      setCurrentTags(prev => [...prev, trimmedTag]);
      setSuggestedTagsAI(prev => prev.filter(t => t !== trimmedTag)); 
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const triggerAdminNotification = async (ticketId: string, ticketTitle: string, eventDetails: string) => {
    try {
      const notificationInput: AdminNotificationInput = {
        ticketId,
        eventType: 'new_ticket',
        details: eventDetails,
        ticketTitle,
      };
      const notificationResult = await notifyAdmin(notificationInput);
      if (notificationResult.sent && notificationResult.notificationMessage) {
        await createNotification({
          userId: ADMIN_USER_ID, // Target user for the notification
          message: notificationResult.notificationMessage,
          href: `/tickets/view/${ticketId}`,
        });
        console.log("Admin notification created for new ticket:", ticketId);
      }
    } catch (error) {
      console.error("Failed to send/store admin notification:", error);
      // Optionally toast a silent failure or log, as primary action (ticket creation) succeeded
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim() || !description.trim() || !customerName.trim() || !customerEmail.trim()) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      setIsSubmitting(false);
      return;
    }

    const newTicketData: Omit<Ticket, '$id' | '$createdAt' | '$updatedAt'> = {
      title,
      description,
      customerName,
      customerEmail,
      priority,
      channel,
      tags: currentTags,
      status: 'new' as TicketDocumentStatus, 
      userId: 'mock-user-id', // Replace with actual user ID if auth is implemented
      replies: JSON.stringify([]), 
    };
    
    console.log("Attempting to create ticket with data:", JSON.stringify(newTicketData, null, 2));

    try {
      const createdTicket = await createTicketInAppwrite(newTicketData);
      if (createdTicket) {
        toast({ title: "Ticket Created", description: `Ticket "${createdTicket.title}" has been successfully created in Appwrite.` });
        
        // Trigger admin notification (fire-and-forget for now)
        triggerAdminNotification(createdTicket.$id, createdTicket.title, `New ticket created by ${customerName}.`);

        router.refresh(); 
        router.push('/dashboard'); 
      } else {
        toast({ variant: "destructive", title: "Creation Failed", description: "Could not create the ticket in Appwrite. Function returned undefined." });
      }
    } catch (error) {
      console.error("Failed to create ticket in Appwrite:", error);
      toast({ variant: "destructive", title: "Creation Failed", description: (error as Error).message || "Could not create the ticket in Appwrite." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <AppHeader title="Create New Ticket" />
    <div className="flex flex-col gap-6">
    <PageTitle title="Create New Support Ticket" />
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Ticket Information</CardTitle>
            <CardDescription>Fill in the details for the new support ticket.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="john.doe@example.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Ticket Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Login issue on website" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description of the issue..." rows={6} required />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Select value={channel} onValueChange={(v) => setChannel(v as TicketChannel)}>
                  <SelectTrigger id="channel">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="tags">Tags</Label>
                <Button type="button" onClick={handleSuggestTags} variant="outline" size="sm" disabled={isTagSuggestionLoading || !description.trim()}>
                  {isTagSuggestionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                  Suggest Tags
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-sm py-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-muted-foreground hover:text-foreground">
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
              {suggestedTagsAI.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium mb-1 text-primary">AI Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTagsAI.map(tag => (
                      <Button key={tag} size="sm" variant="outline" type="button" onClick={() => addTag(tag)}>
                        <Tag className="mr-2 h-3 w-3" /> {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <Input 
                  id="newTagInput" 
                  value={newTagInput} 
                  onChange={(e) => setNewTagInput(e.target.value)} 
                  placeholder="Add a custom tag"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(newTagInput);}}}
                />
                <Button type="button" variant="outline" onClick={() => addTag(newTagInput)} disabled={!newTagInput.trim()}>Add Tag</Button>
              </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Create Ticket
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
    </>
  );
}
