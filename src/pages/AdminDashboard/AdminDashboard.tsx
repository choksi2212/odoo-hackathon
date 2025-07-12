
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  HelpCircle, 
  AlertTriangle, 
  Download,
  Ban,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [broadcastMessage, setBroadcastMessage] = useState('');

  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const stats = {
    totalUsers: 1234,
    totalQuestions: 5678,
    totalAnswers: 12345,
    pendingReports: 8,
  };

  const pendingQuestions = [
    {
      id: '1',
      title: 'How to implement OAuth in React?',
      author: 'newuser123',
      status: 'pending',
      reports: 0,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'Best database for small projects?',
      author: 'developer456',
      status: 'pending',
      reports: 1,
      createdAt: '2024-01-15T09:15:00Z',
    },
  ];

  const reportedContent = [
    {
      id: '1',
      type: 'question',
      title: 'Inappropriate question title',
      author: 'spammer1',
      reason: 'Spam content',
      reportedBy: 'moderator123',
      createdAt: '2024-01-15T08:00:00Z',
    },
    {
      id: '2',
      type: 'answer',
      title: 'Off-topic answer about cryptocurrency',
      author: 'cryptobot',
      reason: 'Off-topic',
      reportedBy: 'user456',
      createdAt: '2024-01-14T16:30:00Z',
    },
  ];

  const handleApproveQuestion = (id: string) => {
    toast({
      title: 'Question Approved',
      description: 'The question has been approved and is now visible to users.',
    });
  };

  const handleRejectQuestion = (id: string) => {
    toast({
      title: 'Question Rejected',
      description: 'The question has been rejected and removed.',
    });
  };

  const handleBanUser = (username: string) => {
    toast({
      title: 'User Banned',
      description: `User ${username} has been banned from the platform.`,
      variant: 'destructive',
    });
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message to broadcast.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Broadcast Sent',
      description: 'Your message has been sent to all users.',
    });
    setBroadcastMessage('');
  };

  const handleDownloadReport = () => {
    toast({
      title: 'Report Downloaded',
      description: 'Platform report has been downloaded successfully.',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, content, and platform settings.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Answers</p>
                <p className="text-2xl font-bold">{stats.totalAnswers}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                <p className="text-2xl font-bold text-destructive">{stats.pendingReports}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="moderation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingQuestions.map((question) => (
                  <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{question.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>by {question.author}</span>
                        <Badge variant={question.reports > 0 ? 'destructive' : 'secondary'}>
                          {question.reports} reports
                        </Badge>
                        <span>2 hours ago</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproveQuestion(question.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectQuestion(question.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reported Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportedContent.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">{report.type}</Badge>
                        <span className="font-medium">{report.title}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>by {report.author}</span>
                        <span>reported by {report.reportedBy}</span>
                        <span>Reason: {report.reason}</span>
                        <span>1 day ago</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBanUser(report.author)}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Ban User
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Broadcast Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Input
                  placeholder="Enter your broadcast message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                />
              </div>
              <Button onClick={handleSendBroadcast} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Broadcast
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">89%</div>
                    <div className="text-sm text-muted-foreground">Question Resolution Rate</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">4.2</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">12.3k</div>
                    <div className="text-sm text-muted-foreground">Monthly Active Users</div>
                  </div>
                </div>
                <Button onClick={handleDownloadReport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
