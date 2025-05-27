
'use client'; // Needs to be a client component for form handling and AI calls

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
import { Loader2, Tag, Lightbulb, PlusCircle } from 'lucide-react';
import type { Ticket, TicketPriority, TicketChannel, TicketStatus } from "@/types";
import { AppHeader } from "@/components/layout/header";
import { PageTitle } from "@/components/common/page-title";

const priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];
const channels: TicketChannel[] = ["email", "sms", "social-media", "web-form", "manual"];

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
  
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isTagSuggestionLoading, setIsTagSuggestionLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuggestTags = async () => {
    if (!description.trim()) {
      toast({ variant: "destructive", title: "Missing Content", description: "Please enter ticket description to suggest tags." });
      return;
    }
    setIsTagSuggestionLoading(true);
    setSuggestedTags([]);
    try {
      const input: SuggestTagsInput = { queryContent: description };
      const result = await suggestTags(input);
      setSuggestedTags(result.suggestedTags.filter(tag => !currentTags.includes(tag))); // Filter out already added tags
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
      setSuggestedTags(prev => prev.filter(t => t !== trimmedTag)); 
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim() || !description.trim() || !customerName.trim() || !customerEmail.trim()) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      setIsSubmitting(false);
      return;
    }

    const completeNewTicket: Ticket = {
      id: `TICK-${Date.now().toString().slice(-5)}`, // Simple unique ID for mock purposes
      title,
      description,
      customerName,
      customerEmail,
      priority,
      channel,
      tags: currentTags,
      status: 'new', 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'mock-user-id', // Placeholder for the user who created/owns the ticket
      // assignedTo: undefined, // Optional, can be set later
      // replies: [], // Optional, will be empty initially
    };

    // In a real app, this would be an API call to save the ticket
    console.log("New Ticket Data (mock, not persisted):", completeNewTicket);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({ title: "Ticket Created", description: `Ticket "${completeNewTicket.title}" has been (mock) created.` });
    setIsSubmitting(false);
    
    // Redirect to dashboard
    router.push('/dashboard'); 
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
              {suggestedTags.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium mb-1 text-primary">AI Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map(tag => (
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
