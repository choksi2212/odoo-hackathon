
import React, { useState } from 'react';
import { Search, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const sampleTags = [
  { name: 'react', count: 1250, description: 'A JavaScript library for building user interfaces' },
  { name: 'javascript', count: 2100, description: 'High-level programming language for web development' },
  { name: 'typescript', count: 890, description: 'Typed superset of JavaScript' },
  { name: 'nodejs', count: 1100, description: 'JavaScript runtime for server-side development' },
  { name: 'python', count: 1500, description: 'High-level programming language' },
  { name: 'jwt', count: 340, description: 'JSON Web Tokens for authentication' },
  { name: 'api', count: 780, description: 'Application Programming Interface' },
  { name: 'database', count: 650, description: 'Data storage and management systems' },
  { name: 'css', count: 920, description: 'Cascading Style Sheets for styling' },
  { name: 'html', count: 830, description: 'HyperText Markup Language' },
  { name: 'redux', count: 420, description: 'State management for JavaScript apps' },
  { name: 'express', count: 560, description: 'Web framework for Node.js' },
  { name: 'mongodb', count: 480, description: 'NoSQL document database' },
  { name: 'sql', count: 720, description: 'Structured Query Language' },
  { name: 'authentication', count: 290, description: 'User identity verification' },
  { name: 'hooks', count: 380, description: 'React Hooks for state management' },
];

const Tags = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTags = sampleTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Tags</h1>
        <p className="text-muted-foreground">
          Browse questions by tags. Tags help organize content by topic.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTags.map((tag) => (
          <div
            key={tag.name}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-sm">
                <Hash className="h-3 w-3 mr-1" />
                {tag.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {tag.count} questions
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{tag.description}</p>
          </div>
        ))}
      </div>

      {filteredTags.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tags found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Tags;
