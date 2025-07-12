
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageSquare, Eye, Check, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor';
import AnswerCard from '@/components/AnswerCard/AnswerCard';
import { useAuth } from '@/contexts/AuthContext';

interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: {
    username: string;
    reputation: number;
  };
  votes: number;
  views: number;
  createdAt: string;
}

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

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockQuestion: Question = {
      id: id || '1',
      title: 'How to use React hooks effectively?',
      description: `I am trying to understand the best practices for using React hooks in functional components. 

Here's what I've tried so far:

\`\`\`javascript
const [count, setCount] = useState(0);

useEffect(() => {
  console.log('Count changed:', count);
}, [count]);
\`\`\`

**My specific questions are:**

1. When should I use useCallback vs useMemo?
2. How do I handle cleanup in useEffect?
3. What are the common pitfalls to avoid?

Any guidance would be appreciated!`,
      tags: ['react', 'hooks', 'javascript'],
      author: { username: 'developer123', reputation: 2450 },
      votes: 15,
      views: 128,
      createdAt: '2024-01-15T10:30:00Z',
    };

    const mockAnswers: Answer[] = [
      {
        id: '1',
        content: `Great question! Let me address each of your points:

**1. useCallback vs useMemo**

- \`useCallback\` is for memoizing functions
- \`useMemo\` is for memoizing computed values

\`\`\`javascript
// useCallback - memoize the function itself
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// useMemo - memoize the result of computation
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
\`\`\`

**2. Cleanup in useEffect**

Always return a cleanup function for subscriptions, timers, etc:

\`\`\`javascript
useEffect(() => {
  const timer = setInterval(() => {
    // do something
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
\`\`\`

**3. Common pitfalls:**
- Forgetting dependencies in useEffect
- Not cleaning up subscriptions
- Using hooks conditionally`,
        author: { username: 'reactexpert', reputation: 5200 },
        votes: 8,
        createdAt: '2024-01-15T11:00:00Z',
        isAccepted: true,
      },
      {
        id: '2',
        content: `I'd also add that you should be careful with the dependency array. Missing dependencies can cause stale closures:

\`\`\`javascript
// Bad - missing dependency
useEffect(() => {
  const handler = () => {
    console.log(count); // might be stale
  };
  window.addEventListener('click', handler);
  return () => window.removeEventListener('click', handler);
}, []); // count is missing!

// Good - include all dependencies
useEffect(() => {
  const handler = () => {
    console.log(count);
  };
  window.addEventListener('click', handler);
  return () => window.removeEventListener('click', handler);
}, [count]);
\`\`\``,
        author: { username: 'hookmaster', reputation: 3100 },
        votes: 3,
        createdAt: '2024-01-15T14:30:00Z',
        isAccepted: false,
      },
    ];

    setTimeout(() => {
      setQuestion(mockQuestion);
      setAnswers(mockAnswers);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const handleVote = (type: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to vote on questions.',
        variant: 'destructive',
      });
      return;
    }

    // Mock voting logic
    setQuestion(prev => prev ? {
      ...prev,
      votes: prev.votes + (type === 'up' ? 1 : -1)
    } : null);

    toast({
      title: 'Vote Recorded',
      description: `You voted ${type} on this question.`,
    });
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to answer questions.',
        variant: 'destructive',
      });
      return;
    }

    if (!newAnswer.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide an answer.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const answer: Answer = {
        id: Date.now().toString(),
        content: newAnswer,
        author: { username: user.username, reputation: user.reputation },
        votes: 0,
        createdAt: new Date().toISOString(),
        isAccepted: false,
      };

      setAnswers(prev => [...prev, answer]);
      setNewAnswer('');
      
      toast({
        title: 'Success',
        description: 'Your answer has been posted!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post your answer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Question Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The question you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/">Back to Questions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Question */}
      <Card className="mb-6">
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
              <span className="text-lg font-bold">{question.votes}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('down')}
                className="p-2"
              >
                <ArrowDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Question content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
              
              <div className="prose prose-sm max-w-none mb-6">
                <div className="whitespace-pre-wrap">{question.description}</div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Question meta */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{question.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{answers.length} answers</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span>asked</span>
                  <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                  <span>by</span>
                  <Link to={`/users/${question.author.username}`} className="text-primary hover:underline font-medium">
                    {question.author.username}
                  </Link>
                  <Badge variant="outline" className="text-xs">
                    {question.author.reputation}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>
        
        <div className="space-y-6">
          {answers.map((answer) => (
            <AnswerCard key={answer.id} answer={answer} />
          ))}
        </div>
      </div>

      {/* Answer form */}
      {user ? (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <RichTextEditor
                value={newAnswer}
                onChange={setNewAnswer}
                placeholder="Provide a detailed answer to help the community..."
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post Answer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Please log in to answer this question.
            </p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionDetail;
