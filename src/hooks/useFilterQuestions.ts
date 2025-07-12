
import { useState, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

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

export const useFilterQuestions = (questions: Question[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const debouncedSetSearchTerm = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions.filter(question => {
      const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           question.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'answered') return matchesSearch && question.isAnswered;
      if (filter === 'unanswered') return matchesSearch && !question.isAnswered;
      return matchesSearch;
    });

    // Sort questions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-votes':
          return b.votes - a.votes;
        case 'most-answers':
          return b.answers - a.answers;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [questions, searchTerm, filter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setSortBy('newest');
  };

  return {
    searchTerm,
    filter,
    sortBy,
    filteredQuestions: filteredAndSortedQuestions,
    setSearchTerm: debouncedSetSearchTerm,
    setFilter,
    setSortBy,
    clearFilters,
  };
};
