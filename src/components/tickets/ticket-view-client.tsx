
'use client';

import type { Ticket, TicketDocumentStatus, TicketReply } from '@/types';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { updateTicketInAppwrite } from '@/lib/data'; // Use Appwrite update function

interface TicketViewClientProps {
  ticket: Ticket;
}

const ticketDocumentStatuses: TicketDocumentStatus[] = ["new", "pending", "on-hold", "closed", "active", "terminated"];

export function TicketViewClient({ ticket: initialTicket }: TicketViewClientProps) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [replyContent, setReplyContent] = useState('');
  const [suggestedReply, setSuggestedReply] = useState('');
  const [aiSuggestedTags, setAiSuggestedTags] = useState<string[]>([]);
  const [isSmartReplyLoading, setIsSmartReplyLoading] = useState(false);
  const [isTagSuggestionLoading, setIsTagSuggestionLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setTicket(initialTicket); 
  }, [initialTicket]);

  const parsedReplies = useMemo(() => {
    try {
      return ticket.replies ? JSON.parse(ticket.replies) as TicketReply[] : [];
    } catch (e) {
      console.error("Failed to parse replies JSON:", e);
      return [];
    }
  }, [ticket.replies]);


  const handleTicketUpdate = async (updatedFields: Partial<Omit<Ticket, '$id' | '$createdAt'>>) => { 
    setIsUpdating(true);
    try {
      const dataToSave = {
        ...updatedFields,
        replies: typeof updatedFields.replies === 'string' ? updatedFields.replies : JSON.stringify(updatedFields.replies || []),
      };
      
      const updatedDoc = await updateTicketInAppwrite(ticket.$id, dataToSave); 
      if (updatedDoc) {
        setTicket(updatedDoc); 
        toast({ title: "Ticket Updated", description: "Changes saved to Appwrite." });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Update Failed", description: "Could not find ticket to update or Appwrite error." });
      }
    } catch (error) {
      console.error("Error updating ticket in Appwrite:", error);
      toast({ variant: "destructive", title: "Update Failed", description: (error as Error).message || "Could not save changes to Appwrite." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = (newStatus: TicketDocumentStatus) => {
    handleTicketUpdate({ status: newStatus }); 
  };

  const handleSmartReply = async () => {
    if (!ticket) return;
    setIsSmartReplyLoading(true);
    setSuggestedReply('');
    try {
      const currentRepliesContent = parsedReplies.map(r => r.content).join('\\n');
      const input: SmartRepliesInput = {
        ticketContent: ticket.description + (currentRepliesContent ? `\\n${currentRepliesContent}`: ''),
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
    setAiSuggestedTags([]);
    try {
      const input: SuggestTagsInput = { queryContent: ticket.description };
      const result = await suggestTags(input);
      setAiSuggestedTags(result.suggestedTags.filter(tag => !ticket.tags.includes(tag)));
    } catch (error) {
      console.error("Error fetching tag suggestions:", error);
      toast({ variant: "destructive", title: "Tag Suggestion Error", description: "Could not fetch tag suggestions." });
    } finally {
      setIsTagSuggestionLoading(false);
    }
  };
  
  const addTag = (tag: string) => {
    if (!ticket.tags.includes(tag)) {
      const newTags = [...ticket.tags, tag];
      handleTicketUpdate({ tags: newTags }); 
      setAiSuggestedTags(prev => prev.filter(t => t !== tag));
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = ticket.tags.filter(tag => tag !== tagToRemove);
    handleTicketUpdate({ tags: newTags }); 
  };

  const handleSendReply = () => {
    if (!replyContent.trim() || !ticket) return;
    
    const newReply: TicketReply = {
      id: `reply-${Date.now()}`, 
      userId: 'current-agent-id', 
      userName: 'Support Agent', 
      content: replyContent,
      createdAt: new Date().toISOString(),
    };

    const updatedReplies = [...parsedReplies, newReply];
    handleTicketUpdate({ replies: JSON.stringify(updatedReplies) }); 
    
    setReplyContent('');
    setSuggestedReply(''); 
  };

  if (!ticket) {
    return <div className="p-6 text-center">Ticket not found.</div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
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
              <Link href={`/tickets/${ticket.status}`}> {/* status is now TicketDocumentStatus, valid for URL */}
                <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back to List</Button>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Created: {new Date(ticket.$createdAt).toLocaleString()} | Last Updated: {new Date(ticket.$updatedAt).toLocaleString()}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversation History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedReplies.map((reply) => (
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
            {parsedReplies.length === 0 && (
              <p className="text-sm text-muted-foreground">No replies yet.</p>
            )}
          </CardContent>
        </Card>

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
            <Button onClick={handleSmartReply} variant="outline" disabled={isSmartReplyLoading || isUpdating}>
              {isSmartReplyLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              Smart Reply
            </Button>
            <Button onClick={handleSendReply} disabled={!replyContent.trim() || isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Send Reply
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>ID:</span> <span className="font-mono">{ticket.$id}</span></div>
            <Separator />
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <Select value={ticket.status} onValueChange={(val) => handleStatusChange(val as TicketDocumentStatus)} disabled={isUpdating}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Set status" />
                </SelectTrigger>
                <SelectContent>
                  {ticketDocumentStatuses.map(s => (
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
              <Button onClick={handleSuggestTags} variant="ghost" size="sm" disabled={isTagSuggestionLoading || isUpdating}>
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
                  <button onClick={() => removeTag(tag)} disabled={isUpdating} className="ml-2 text-muted-foreground hover:text-foreground disabled:opacity-50">
                    &times;
                  </button>
                </Badge>
              ))}
              {ticket.tags.length === 0 && <p className="text-sm text-muted-foreground">No tags yet.</p>}
            </div>
            {aiSuggestedTags.length > 0 && (
              <>
                <Separator className="my-4" />
                <p className="text-sm font-medium mb-2">Suggested Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestedTags.map(tag => (
                    <Button key={tag} size="sm" variant="outline" onClick={() => addTag(tag)} disabled={isUpdating}>
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
