
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, MessageSquare, Eye, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

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

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Vote and Answer Stats */}
          <div className="flex flex-col items-center space-y-4 text-sm text-muted-foreground min-w-[80px]">
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-1">
                <ArrowUp className="h-4 w-4" />
                <span className="font-medium">{question.votes}</span>
              </div>
              <span className="text-xs">votes</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-1">
                {question.isAnswered && <Check className="h-4 w-4 text-green-600" />}
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">{question.answers}</span>
              </div>
              <span className="text-xs">answers</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{question.views}</span>
              </div>
              <span className="text-xs">views</span>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <Link 
              to={`/question/${question.id}`}
              className="block hover:text-primary transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {question.title}
              </h3>
            </Link>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {question.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Author and Time */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span>asked by</span>
                <Link 
                  to={`/users/${question.author.username}`}
                  className="text-primary hover:underline font-medium"
                >
                  {question.author.username}
                </Link>
                <Badge variant="outline" className="text-xs">
                  {question.author.reputation}
                </Badge>
              </div>
              <span>
                {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
