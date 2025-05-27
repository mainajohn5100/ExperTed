
'use client';

import type { Ticket, TicketStatus, TicketReply } from '@/types';
import Link from 'next/link';
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
import { ArrowUpRight, Filter, ListOrdered, Ticket as TicketIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import React from 'react';

interface TicketListClientProps {
  tickets: Ticket[];
  statusTitle: string;
}

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

export function TicketListClient({ tickets, statusTitle }: TicketListClientProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState('createdAt_desc'); // Default sort by createdAt

  const filteredAndSortedTickets = React.useMemo(() => {
    let filtered = tickets.filter(ticket => 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) // Use id for search
    );

    const [key, order] = sortBy.split('_');
    
    filtered.sort((a, b) => {
      let valA = a[key as keyof Ticket];
      let valB = b[key as keyof Ticket];

      if (key === 'createdAt' || key === 'updatedAt') { // Use generic timestamps
        valA = new Date(valA as string).getTime();
        valB = new Date(valB as string).getTime();
      } else if (key === 'priority') {
        const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 };
        valA = priorityOrder[a.priority];
        valB = priorityOrder[b.priority];
      }
      
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tickets, searchTerm, sortBy]);


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>{statusTitle} Tickets</CardTitle>
            <CardDescription>
              Manage and view tickets with the status: {statusTitle.toLowerCase()}.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Input 
              placeholder="Search tickets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <ListOrdered className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt_desc">Newest First</SelectItem>
                <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                <SelectItem value="priority_desc">Priority (High-Low)</SelectItem>
                <SelectItem value="priority_asc">Priority (Low-High)</SelectItem>
                <SelectItem value="updatedAt_desc">Last Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAndSortedTickets.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <TicketIcon className="mx-auto h-12 w-12 mb-4" />
            <p>No tickets found for "{statusTitle}" with current filters.</p>
            <p className="text-xs">(Data backend operations need to be re-implemented for PostgreSQL)</p>
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Customer</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden sm:table-cell">Priority</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTickets.map((ticket) => (
              <TableRow key={ticket.id}> {/* Use id */}
                <TableCell className="font-mono whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] block md:table-cell">{ticket.id}</TableCell> {/* Use id */}
                <TableCell>
                  <Link href={`/tickets/view/${ticket.id}`} className="font-medium hover:underline"> {/* Use id */}
                    {ticket.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">{ticket.customerName}</TableCell>
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
        )}
      </CardContent>
    </Card>
  );
}
