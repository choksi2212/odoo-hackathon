
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Calendar, Trophy, MessageSquare, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const userStats = {
    questionsAsked: 12,
    answersGiven: 28,
    reputation: user.reputation,
    joinDate: '2024-01-01',
  };

  const recentQuestions = [
    {
      id: '1',
      title: 'How to use React hooks effectively?',
      votes: 15,
      answers: 3,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'Best practices for TypeScript interfaces',
      votes: 8,
      answers: 2,
      createdAt: '2024-01-14T16:45:00Z',
    },
  ];

  const recentAnswers = [
    {
      id: '1',
      questionTitle: 'Understanding JavaScript closures',
      votes: 12,
      isAccepted: true,
      createdAt: '2024-01-13T09:15:00Z',
    },
    {
      id: '2',
      questionTitle: 'CSS Grid vs Flexbox comparison',
      votes: 6,
      isAccepted: false,
      createdAt: '2024-01-12T14:20:00Z',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">{user.username}</CardTitle>
              <p className="text-muted-foreground">{user.email}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{userStats.reputation}</div>
                  <div className="text-sm text-muted-foreground">Reputation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{userStats.questionsAsked}</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Member since</span>
                </div>
                <span className="text-sm font-medium">Jan 2024</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Role</span>
                </div>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="answers">Answers</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue={user.username} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user.email} />
                    </div>
                  </div>
                  <Button>Update Profile</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">{userStats.questionsAsked}</div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center">
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Questions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">{userStats.answersGiven}</div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Answers
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">{userStats.reputation}</div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center">
                        <Trophy className="h-4 w-4 mr-1" />
                        Reputation
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">85%</div>
                      <div className="text-sm text-muted-foreground">Accept Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              {recentQuestions.map((question) => (
                <Card key={question.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{question.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{question.votes} votes</span>
                          <span>{question.answers} answers</span>
                          <span>Asked 2 days ago</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="answers" className="space-y-4">
              {recentAnswers.map((answer) => (
                <Card key={answer.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{answer.questionTitle}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{answer.votes} votes</span>
                          {answer.isAccepted && (
                            <Badge variant="secondary" className="text-xs">
                              Accepted
                            </Badge>
                          )}
                          <span>Answered 3 days ago</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
