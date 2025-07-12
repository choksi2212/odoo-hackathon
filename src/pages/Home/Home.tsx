
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QuestionCard from '@/components/QuestionCard/QuestionCard';
import { useAuth } from '@/contexts/AuthContext';
import { useFilterQuestions } from '@/hooks/useFilterQuestions';

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
  answers: number;
  views: number;
  createdAt: string;
  isAnswered: boolean;
}

const Home = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  const {
    filter,
    sortBy,
    filteredQuestions,
    setSearchTerm,
    setFilter,
    setSortBy,
    clearFilters,
  } = useFilterQuestions(questions);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockQuestions: Question[] = [
      {
        id: '1',
        title: 'How to use React hooks effectively?',
        description: 'I am trying to understand the best practices for using React hooks in functional components. Can someone explain the common patterns and pitfalls to avoid?',
        tags: ['react', 'hooks', 'javascript'],
        author: { username: 'developer123', reputation: 2450 },
        votes: 15,
        answers: 3,
        views: 128,
        createdAt: '2024-01-15T10:30:00Z',
        isAnswered: true,
      },
      {
        id: '2',
        title: 'TypeScript generic constraints not working as expected',
        description: 'I am having trouble with TypeScript generic constraints. The compiler is not catching the type errors I expect it to catch.',
        tags: ['typescript', 'generics', 'types'],
        author: { username: 'typemaster', reputation: 3200 },
        votes: 8,
        answers: 1,
        views: 64,
        createdAt: '2024-01-15T08:15:00Z',
        isAnswered: false,
      },
      {
        id: '3',
        title: 'Best practices for Node.js error handling',
        description: 'What are the recommended approaches for handling errors in Node.js applications? I want to make sure I am following best practices.',
        tags: ['nodejs', 'error-handling', 'backend'],
        author: { username: 'nodedev', reputation: 1800 },
        votes: 12,
        answers: 5,
        views: 256,
        createdAt: '2024-01-14T16:45:00Z',
        isAnswered: true,
      },
    ];

    setTimeout(() => {
      setQuestions(mockQuestions);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setSearchTerm(value);
  };

  const hasActiveFilters = filter !== 'all' || sortBy !== 'newest' || searchInput !== '';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">All Questions</h1>
          <p className="text-muted-foreground">
            {filteredQuestions.length} questions
          </p>
        </div>
        {user && (
          <Button asChild className="mt-4 sm:mt-0">
            <Link to="/ask">
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Link>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search questions..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Questions</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="unanswered">Unanswered</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most-votes">Most Votes</SelectItem>
            <SelectItem value="most-answers">Most Answers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-3 w-3" />
            Clear Filters
          </Button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
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
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              {hasActiveFilters ? 'No questions found matching your criteria' : 'No questions found'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            {user && !hasActiveFilters && (
              <Button asChild>
                <Link to="/ask">Ask the first question</Link>
              </Button>
            )}
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
