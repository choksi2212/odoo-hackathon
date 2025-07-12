
import React from 'react';
import { Trophy, Award, Medal, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const leaderboardData = [
  {
    rank: 1,
    username: 'reactpro',
    reputation: 4100,
    questionsAnswered: 234,
    questionsAsked: 67,
    avatar: '',
    badge: 'Champion'
  },
  {
    rank: 2,
    username: 'typemaster',
    reputation: 3200,
    questionsAnswered: 187,
    questionsAsked: 32,
    avatar: '',
    badge: 'Expert'
  },
  {
    rank: 3,
    username: 'jsexpert',
    reputation: 2890,
    questionsAnswered: 156,
    questionsAsked: 41,
    avatar: '',
    badge: 'Guru'
  },
  {
    rank: 4,
    username: 'developer123',
    reputation: 2450,
    questionsAnswered: 123,
    questionsAsked: 45,
    avatar: '',
    badge: 'Contributor'
  },
  {
    rank: 5,
    username: 'nodedev',
    reputation: 1800,
    questionsAnswered: 95,
    questionsAsked: 28,
    avatar: '',
    badge: 'Helper'
  },
  {
    rank: 6,
    username: 'webwizard',
    reputation: 1620,
    questionsAnswered: 78,
    questionsAsked: 35,
    avatar: '',
    badge: 'Active'
  },
  {
    rank: 7,
    username: 'codemaster',
    reputation: 1450,
    questionsAnswered: 67,
    questionsAsked: 22,
    avatar: '',
    badge: 'Rising Star'
  },
  {
    rank: 8,
    username: 'pythondev',
    reputation: 1320,
    questionsAnswered: 59,
    questionsAsked: 18,
    avatar: '',
    badge: 'Specialist'
  }
];

const Leaderboard = () => {
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getBadgeVariant = (rank: number) => {
    if (rank <= 3) return 'default';
    if (rank <= 5) return 'secondary';
    return 'outline';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
          <Trophy className="h-8 w-8 mr-3 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Top contributors ranked by reputation and community engagement.
        </p>
      </div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {leaderboardData.slice(0, 3).map((user) => (
          <Card key={user.rank} className={`${user.rank === 1 ? 'ring-2 ring-yellow-500' : ''}`}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                {getRankIcon(user.rank)}
              </div>
              <Avatar className="h-16 w-16 mx-auto mb-2">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{user.username}</CardTitle>
              <Badge variant={getBadgeVariant(user.rank)}>{user.badge}</Badge>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {user.reputation.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{user.questionsAnswered} answers</div>
                <div>{user.questionsAsked} questions</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Reputation</TableHead>
                <TableHead className="text-right">Answers</TableHead>
                <TableHead className="text-right">Questions</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((user) => (
                <TableRow key={user.rank} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center">
                      {getRankIcon(user.rank)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {user.reputation.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.questionsAnswered}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.questionsAsked}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(user.rank)} className="text-xs">
                      {user.badge}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
