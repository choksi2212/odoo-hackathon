
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Check, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Answer {
  id: string;
  content: string;
  author: {
    username: string;
    reputation: number;
  };
  votes: number;
  createdAt: string;
  isAccepted: boolean;
}

interface AnswerCardProps {
  answer: Answer;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ answer }) => {
  const { user } = useAuth();

  const handleVote = (type: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to vote on answers.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Vote Recorded',
      description: `You voted ${type} on this answer.`,
    });
  };

  const handleAccept = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to accept answers.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Answer Accepted',
      description: 'This answer has been marked as accepted.',
    });
  };

  return (
    <Card className={answer.isAccepted ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' : ''}>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Vote buttons */}
          <div className="flex flex-col items-center space-y-2 min-w-[60px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('up')}
              className="p-2"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <span className="text-lg font-bold">{answer.votes}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('down')}
              className="p-2"
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
            
            {answer.isAccepted && (
              <div className="mt-2">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            )}
            
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAccept}
                className="p-2 mt-2"
                title="Accept this answer"
              >
                <Check className={`h-5 w-5 ${answer.isAccepted ? 'text-green-600' : 'text-muted-foreground'}`} />
              </Button>
            )}
          </div>

          {/* Answer content */}
          <div className="flex-1">
            <div className="prose prose-sm max-w-none mb-4">
              <div className="whitespace-pre-wrap">{answer.content}</div>
            </div>

            {/* Answer meta */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                {user && user.username === answer.author.username && (
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span>answered</span>
                <span>{formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
                <span>by</span>
                <Link 
                  to={`/users/${answer.author.username}`} 
                  className="text-primary hover:underline font-medium"
                >
                  {answer.author.username}
                </Link>
                <Badge variant="outline" className="text-xs">
                  {answer.author.reputation}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnswerCard;
