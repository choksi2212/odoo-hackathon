
import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({ 
  tags, 
  onChange, 
  placeholder = "Add tags...",
  maxTags = 5 
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tagToAdd: string) => {
    const trimmedTag = tagToAdd.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const popularTags = ['react', 'javascript', 'typescript', 'nodejs', 'python', 'css', 'html', 'java', 'php', 'sql'];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px] bg-background">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        {tags.length < maxTags && (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[100px] border-0 p-0 h-6 focus-visible:ring-0"
          />
        )}
      </div>
      
      {tags.length < maxTags && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Popular tags:</p>
          <div className="flex flex-wrap gap-2">
            {popularTags
              .filter(tag => !tags.includes(tag))
              .slice(0, 8)
              .map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(tag)}
                  className="h-7 text-xs"
                >
                  {tag}
                </Button>
              ))}
          </div>
        </div>
      )}
      
      <p className="text-sm text-muted-foreground">
        {tags.length}/{maxTags} tags used. Press Enter or comma to add a tag.
      </p>
    </div>
  );
};

export default TagInput;
