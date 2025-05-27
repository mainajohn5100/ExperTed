'use client';

import type { Ticket, TicketStatus } from '@/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Bot, Tag, Send, RefreshCw, Loader2, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { getSmartReplies, SmartRepliesInput } from '@/ai/flows/smart-replies';
import { suggestTags, SuggestTagsInput } from '@/ai/flows/suggest-tags';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TicketViewClientProps {
  ticket: Ticket;
}

const ticketStatuses: TicketStatus[] = ["new", "pending", "on-hold", "closed", "active", "terminated"];

export function TicketViewClient({ ticket: initialTicket }: TicketViewClientProps) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [replyContent, setReplyContent] = useState('');
  const [suggestedReply, setSuggestedReply] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSmartReplyLoading, setIsSmartReplyLoading] = useState(false);
  const [isTagSuggestionLoading, setIsTagSuggestionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTicket(initialTicket); // Re-sync if initialTicket changes (e.g. route change to different ticket)
  }, [initialTicket]);


  const handleStatusChange = (newStatus: TicketStatus) => {
    // In a real app, this would be an API call
    setTicket(prev => ({ ...prev!, status: newStatus, updatedAt: new Date().toISOString() }));
    toast({ title: "Status Updated", description: `Ticket status changed to ${newStatus}.` });
  };

  const handleSmartReply = async () => {
    if (!ticket) return;
    setIsSmartReplyLoading(true);
    setSuggestedReply('');
    try {
      const input: SmartRepliesInput = {
        ticketContent: ticket.description + (ticket.replies?.map(r => r.content).join('\n') || ''),
        userId: ticket.userId, 
      };
      const result = await getSmartReplies(input);
      setSuggestedReply(result.suggestedResponse || `Summary: ${result.ticketSummary}`);
    } catch (error) {
      console.error("Error fetching smart reply:", error);
      toast({ variant: "destructive", title: "Smart Reply Error", description: "Could not fetch smart reply." });
    } finally {
      setIsSmartReplyLoading(false);
    }
  };

  const handleSuggestTags = async () => {
    if (!ticket) return;
    setIsTagSuggestionLoading(true);
    setSuggestedTags([]);
    try {
      const input: SuggestTagsInput = { queryContent: ticket.description };
      const result = await suggestTags(input);
      setSuggestedTags(result.suggestedTags);
    } catch (error) {
      console.error("Error fetching tag suggestions:", error);
      toast({ variant: "destructive", title: "Tag Suggestion Error", description: "Could not fetch tag suggestions." });
    } finally {
      setIsTagSuggestionLoading(false);
    }
  };
  
  const addTag = (tag: string) => {
    if (!ticket.tags.includes(tag)) {
      setTicket(prev => ({ ...prev!, tags: [...prev!.tags, tag] }));
      setSuggestedTags(prev => prev.filter(t => t !== tag)); // Remove from suggestions
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTicket(prev => ({ ...prev!, tags: prev!.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSendReply = () => {
    if (!replyContent.trim() || !ticket) return;
    // In a real app, this would be an API call
    const newReply = {
      id: `reply-${Date.now()}`,
      userId: 'current-agent-id', // Placeholder for current agent
      userName: 'Support Agent',
      content: replyContent,
      createdAt: new Date().toISOString(),
    };
    setTicket(prev => ({
      ...prev!,
      replies: [...(prev!.replies || []), newReply],
      updatedAt: new Date().toISOString(),
    }));
    setReplyContent('');
    setSuggestedReply(''); // Clear suggestion after sending
    toast({ title: "Reply Sent", description: "Your reply has been added to the ticket." });
  };

  if (!ticket) {
    return <div className="p-6 text-center">Ticket not found.</div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Main Ticket Content */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                <CardDescription>
                  Opened by {ticket.customerName} ({ticket.customerEmail}) via {ticket.channel}
                </CardDescription>
              </div>
              <Link href={`/tickets/${ticket.status}`}>
                <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back to List</Button>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Created: {new Date(ticket.createdAt).toLocaleString()} | Last Updated: {new Date(ticket.updatedAt).toLocaleString()}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </CardContent>
        </Card>

        {/* Replies Section */}
        <Card>
          <CardHeader>
            <CardTitle>Conversation History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(ticket.replies || []).map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${reply.userName.substring(0,1)}`} data-ai-hint="avatar user"/>
                  <AvatarFallback>{reply.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-lg border p-3 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">{reply.userName}</span>
                    <span className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            ))}
            {(!ticket.replies || ticket.replies.length === 0) && (
              <p className="text-sm text-muted-foreground">No replies yet.</p>
            )}
          </CardContent>
        </Card>

        {/* New Reply Section */}
        <Card>
          <CardHeader>
            <CardTitle>Add Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedReply && (
              <div className="rounded-md border border-primary/50 bg-primary/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-primary">AI Suggested Reply:</h4>
                </div>
                <p className="text-sm whitespace-pre-wrap">{suggestedReply}</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => {setReplyContent(suggestedReply); setSuggestedReply('');}}>
                  Use this suggestion
                </Button>
              </div>
            )}
            <div>
              <Label htmlFor="replyContent">Your Reply</Label>
              <Textarea
                id="replyContent"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your response..."
                rows={5}
                className="mt-1"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleSmartReply} variant="outline" disabled={isSmartReplyLoading}>
              {isSmartReplyLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              Smart Reply
            </Button>
            <Button onClick={handleSendReply} disabled={!replyContent.trim()}>
              <Send className="mr-2 h-4 w-4" /> Send Reply
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Sidebar for Ticket Details & Actions */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>ID:</span> <span className="font-mono">{ticket.id}</span></div>
            <Separator />
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <Select value={ticket.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Set status" />
                </SelectTrigger>
                <SelectContent>
                  {ticketStatuses.map(s => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex justify-between"><span>Priority:</span> <Badge variant={ticket.priority === 'urgent' || ticket.priority === 'high' ? 'destructive' : 'secondary'}>{ticket.priority.toUpperCase()}</Badge></div>
            <Separator />
            <div className="flex justify-between"><span>Assigned To:</span> <span>{ticket.assignedTo || 'Unassigned'}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tags</CardTitle>
              <Button onClick={handleSuggestTags} variant="ghost" size="sm" disabled={isTagSuggestionLoading}>
                {isTagSuggestionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Suggest
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ticket.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-sm py-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-2 text-muted-foreground hover:text-foreground">
                    &times;
                  </button>
                </Badge>
              ))}
              {ticket.tags.length === 0 && <p className="text-sm text-muted-foreground">No tags yet.</p>}
            </div>
            {suggestedTags.length > 0 && (
              <>
                <Separator className="my-4" />
                <p className="text-sm font-medium mb-2">Suggested Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map(tag => (
                    <Button key={tag} size="sm" variant="outline" onClick={() => addTag(tag)}>
                      <Tag className="mr-2 h-3 w-3" /> {tag}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
