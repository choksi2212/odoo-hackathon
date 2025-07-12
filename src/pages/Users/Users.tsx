
import React, { useState } from 'react';
import { Search, User, Award, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const sampleUsers = [
  {
    id: 1,
    username: 'developer123',
    reputation: 2450,
    questionsAsked: 45,
    answersGiven: 123,
    joinedDate: '2023-01-15',
    avatar: '',
    badges: ['Gold', 'Active Contributor']
  },
  {
    id: 2,
    username: 'typemaster',
    reputation: 3200,
    questionsAsked: 32,
    answersGiven: 187,
    joinedDate: '2022-11-08',
    avatar: '',
    badges: ['Platinum', 'Expert']
  },
  {
    id: 3,
    username: 'nodedev',
    reputation: 1800,
    questionsAsked: 28,
    answersGiven: 95,
    joinedDate: '2023-03-22',
    avatar: '',
    badges: ['Silver', 'Helper']
  },
  {
    id: 4,
    username: 'reactpro',
    reputation: 4100,
    questionsAsked: 67,
    answersGiven: 234,
    joinedDate: '2022-06-14',
    avatar: '',
    badges: ['Platinum', 'Top Contributor']
  },
  {
    id: 5,
    username: 'jsexpert',
    reputation: 2890,
    questionsAsked: 41,
    answersGiven: 156,
    joinedDate: '2022-12-03',
    avatar: '',
    badges: ['Gold', 'JavaScript Guru']
  },
  {
    id: 6,
    username: 'webwizard',
    reputation: 1620,
    questionsAsked: 35,
    answersGiven: 78,
    joinedDate: '2023-04-18',
    avatar: '',
    badges: ['Silver']
  }
];

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = sampleUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case 'Platinum': return 'default';
      case 'Gold': return 'secondary';
      case 'Silver': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Community Members</h1>
        <p className="text-muted-foreground">
          Meet our active community members and contributors.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{user.username}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Award className="h-3 w-3 mr-1" />
                    {user.reputation} reputation
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {user.questionsAsked} questions
                </div>
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {user.answersGiven} answers
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {user.badges.map((badge) => (
                  <Badge key={badge} variant={getBadgeVariant(badge)} className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>

              <div className="text-xs text-muted-foreground mt-3">
                Joined {new Date(user.joinedDate).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Users;
