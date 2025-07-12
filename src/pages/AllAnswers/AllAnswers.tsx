
import React, { useState, useEffect } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

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
  questionId: string;
  questionTitle: string;
}

const AllAnswers = () => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for answers
    const mockAnswers: Answer[] = [
      {
        id: '1',
        content: 'React hooks provide a powerful way to manage state and side effects in functional components. The key is to understand the rules of hooks and follow best practices like using useEffect properly for cleanup.',
        author: { username: 'reactexpert', reputation: 5200 },
        votes: 25,
        createdAt: '2024-01-15T11:00:00Z',
        isAccepted: true,
        questionId: '1',
        questionTitle: 'How to use React hooks effectively?',
      },
      {
        id: '2',
        content: 'You need to be more specific with your generic constraints. Try using `extends` keyword with proper type conditions to ensure the compiler catches the errors you expect.',
        author: { username: 'tsmaster', reputation: 3800 },
        votes: 12,
        createdAt: '2024-01-15T09:30:00Z',
        isAccepted: false,
        questionId: '2',
        questionTitle: 'TypeScript generic constraints not working as expected',
      },
      {
        id: '3',
        content: 'For Node.js error handling, I recommend using try-catch blocks for async operations, implementing global error handlers, and using libraries like winston for logging errors properly.',
        author: { username: 'backend_guru', reputation: 4500 },
        votes: 18,
        createdAt: '2024-01-14T17:15:00Z',
        isAccepted: true,
        questionId: '3',
        questionTitle: 'Best practices for Node.js error handling',
      },
      {
        id: '4',
        content: 'Redux is better for complex state management with multiple components, while Context API is great for simpler state sharing. Consider the size and complexity of your application.',
        author: { username: 'statemanager', reputation: 3200 },
        votes: 31,
        createdAt: '2024-01-13T15:45:00Z',
        isAccepted: true,
        questionId: '4',
        questionTitle: 'React state management with Redux vs Context API',
      },
      {
        id: '5',
        content: 'Async/await is syntactic sugar over promises, making code more readable. Use async/await for sequential operations and Promise.all() for parallel operations.',
        author: { username: 'asyncpro', reputation: 2900 },
        votes: 22,
        createdAt: '2024-01-12T10:20:00Z',
        isAccepted: true,
        questionId: '5',
        questionTitle: 'Async/await vs Promises in JavaScript',
      },
    ];

    setTimeout(() => {
      setAnswers(mockAnswers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredAnswers = answers.filter(answer =>
    answer.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    answer.questionTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">All Answers</h1>
          <p className="text-muted-foreground">
            {filteredAnswers.length} answers
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Answers List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg p-6">
                  <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-muted-foreground/20 rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAnswers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No answers found</p>
          </div>
        ) : (
          filteredAnswers.map((answer) => (
            <Card key={answer.id} className={answer.isAccepted ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Link 
                    to={`/question/${answer.questionId}`}
                    className="text-primary hover:underline"
                  >
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {answer.questionTitle}
                    </CardTitle>
                  </Link>
                  {answer.isAccepted && (
                    <Badge variant="default" className="bg-green-600 text-white">
                      Accepted
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-foreground">{answer.content}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <span className="font-medium">{answer.votes}</span>
                      <span>votes</span>
                    </span>
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AllAnswers;
