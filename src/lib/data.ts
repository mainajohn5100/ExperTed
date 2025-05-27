import type { Ticket, Project, User } from '@/types';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alice Wonderland', avatar: 'https://placehold.co/100x100.png' },
  { id: 'user-2', name: 'Bob The Builder', avatar: 'https://placehold.co/100x100.png' },
  { id: 'user-3', name: 'Charlie Chaplin', avatar: 'https://placehold.co/100x100.png' },
];

export const mockTickets: Ticket[] = [
  {
    id: 'TICK-001',
    title: 'Login Issue on Mobile App',
    description: 'User reports being unable to login to the mobile application. Getting an "Invalid Credentials" error despite using correct username and password. This started happening after the recent app update. Tried reinstalling, clearing cache, no luck.',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-01T12:30:00Z',
    status: 'pending',
    tags: ['login', 'mobile-app', 'bug'],
    assignedTo: 'Alice Wonderland',
    priority: 'high',
    channel: 'email',
    userId: 'customer-123',
    replies: [
      { id: 'reply-1', userId: 'Alice Wonderland', userName: 'Alice Wonderland', content: 'Thanks for reporting, John. We are looking into this.', createdAt: '2024-05-01T11:00:00Z' }
    ]
  },
  {
    id: 'TICK-002',
    title: 'Feature Request: Dark Mode',
    description: 'It would be great to have a dark mode option in the web application. It helps with eye strain, especially when working at night.',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    createdAt: '2024-05-02T14:15:00Z',
    updatedAt: '2024-05-02T14:15:00Z',
    status: 'new',
    tags: ['feature-request', 'ui', 'dark-mode'],
    priority: 'medium',
    channel: 'web-form',
    userId: 'customer-456',
  },
  {
    id: 'TICK-003',
    title: 'Billing Inquiry - Incorrect Charge',
    description: 'I was charged twice for my monthly subscription. Please investigate and refund the extra charge. My subscription ID is SUB-789123.',
    customerName: 'Peter Pan',
    customerEmail: 'peter.pan@example.com',
    createdAt: '2024-04-28T09:00:00Z',
    updatedAt: '2024-04-29T17:00:00Z',
    status: 'closed',
    tags: ['billing', 'invoice', 'refund'],
    assignedTo: 'Bob The Builder',
    priority: 'high',
    channel: 'social-media',
    userId: 'customer-789',
    replies: [
       { id: 'reply-2a', userId: 'Bob The Builder', userName: 'Bob The Builder', content: 'Hi Peter, we have processed your refund. It should reflect in 3-5 business days.', createdAt: '2024-04-29T16:50:00Z' }
    ]
  },
  {
    id: 'TICK-004',
    title: 'Password Reset Not Working',
    description: 'The password reset link I received via email is expired or invalid. I cannot reset my password.',
    customerName: 'Wendy Darling',
    customerEmail: 'wendy.darling@example.com',
    createdAt: '2024-05-03T11:00:00Z',
    updatedAt: '2024-05-03T11:00:00Z',
    status: 'active',
    tags: ['password-reset', 'account'],
    assignedTo: 'Alice Wonderland',
    priority: 'urgent',
    channel: 'sms',
    userId: 'customer-101',
  },
   {
    id: 'TICK-005',
    title: 'How to integrate with API?',
    description: 'I need documentation or guidance on how to integrate our internal system with your API. Specifically, I am looking for endpoints related to data export.',
    customerName: 'Michael Scott',
    customerEmail: 'michael.scott@example.com',
    createdAt: '2024-05-03T16:00:00Z',
    updatedAt: '2024-05-03T16:00:00Z',
    status: 'on-hold',
    tags: ['api', 'integration', 'documentation'],
    assignedTo: 'Charlie Chaplin',
    priority: 'medium',
    channel: 'email',
    userId: 'customer-112',
  },
  {
    id: 'TICK-006',
    title: 'Account Terminated Unexpectedly',
    description: 'My account seems to have been terminated without any prior notice. I need to understand why and if it can be reactivated. My username is "captainhook".',
    customerName: 'James Hook',
    customerEmail: 'captain.hook@example.com',
    createdAt: '2024-04-20T10:00:00Z',
    updatedAt: '2024-04-22T10:00:00Z',
    status: 'terminated',
    tags: ['account', 'termination', 'policy-violation'],
    priority: 'high',
    channel: 'manual',
    userId: 'customer-303',
  }
];

export const mockProjects: Project[] = [
  {
    id: 'PROJ-001',
    name: 'Website Redesign Q3',
    description: 'Complete redesign of the company website with new branding and improved UX.',
    status: 'active',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z',
    deadline: '2024-09-30T00:00:00Z',
    teamMembers: ['Alice Wonderland', 'Bob The Builder'],
  },
  {
    id: 'PROJ-002',
    name: 'Mobile App v2.0 Launch',
    description: 'Develop and launch version 2.0 of the mobile application with new features.',
    status: 'on-hold',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-04-10T00:00:00Z',
    deadline: '2024-07-31T00:00:00Z',
    teamMembers: ['Charlie Chaplin'],
  },
  {
    id: 'PROJ-003',
    name: 'Knowledge Base Setup',
    description: 'Create and populate a new knowledge base for customer self-service.',
    status: 'completed',
    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2024-02-28T00:00:00Z',
    teamMembers: ['Alice Wonderland'],
  },
  {
    id: 'PROJ-004',
    name: 'New API Endpoint Development',
    description: 'Develop new API endpoints for partner integrations.',
    status: 'new',
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z',
    deadline: '2024-06-30T00:00:00Z',
    teamMembers: ['Bob The Builder', 'Charlie Chaplin'],
  }
];


// Helper functions to fetch mock data
export const getTicketsByStatus = async (status: TicketStatus): Promise<Ticket[]> => {
  if (status === 'all') return mockTickets;
  return mockTickets.filter(ticket => ticket.status === status);
};

export const getTicketById = async (id: string): Promise<Ticket | undefined> => {
  return mockTickets.find(ticket => ticket.id === id);
};

export const getProjectsByStatus = async (status: ProjectStatusKey): Promise<Project[]> => {
  if (status === 'all') return mockProjects;
  return mockProjects.filter(project => project.status === status);
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  return mockProjects.find(project => project.id === id);
};
