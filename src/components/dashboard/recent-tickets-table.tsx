
import Link from 'next/link';
import { getTicketsByStatus } from '@/lib/data'; 
import type { Ticket } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 1) return `${days} days ago`;
  if (days === 1) return `1 day ago`;
  if (hours > 1) return `${hours} hours ago`;
  if (hours === 1) return `1 hour ago`;
  if (minutes > 1) return `${minutes} minutes ago`;
  if (minutes === 1) return `1 minute ago`;
  return `just now`;
}

export async function RecentTicketsTable() {
  const allTickets = await getTicketsByStatus('all'); 
  const recentTickets = [...allTickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Use createdAt
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>An overview of your most recent support tickets.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden sm:table-cell">Priority</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTickets.map((ticket) => (
              <TableRow key={ticket.id}> {/* Use id */}
                <TableCell>
                  <div className="font-medium">{ticket.customerName}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {ticket.customerEmail}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={ticket.status === 'closed' || ticket.status === 'terminated' ? 'outline' : 'default'} 
                         className={cn(
                            ticket.status === 'new' && 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30',
                            ticket.status === 'pending' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30',
                            ticket.status === 'on-hold' && 'bg-orange-500/20 text-orange-700 border-orange-500/30 hover:bg-orange-500/30',
                            ticket.status === 'active' && 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30',
                            ticket.status === 'closed' && 'bg-gray-500/20 text-gray-700 border-gray-500/30 hover:bg-gray-500/30',
                            ticket.status === 'terminated' && 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30',
                         )}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                   <Badge variant="outline"
                     className={cn(
                        ticket.priority === 'urgent' && 'text-destructive border-destructive',
                        ticket.priority === 'high' && 'text-orange-600 border-orange-600',
                        ticket.priority === 'medium' && 'text-yellow-600 border-yellow-600',
                     )}
                   >
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                   </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatRelativeDate(ticket.createdAt)}</TableCell> {/* Use createdAt */}
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/tickets/view/${ticket.id}`}> {/* Use id */}
                      View <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
