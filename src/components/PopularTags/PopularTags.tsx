
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface TagCount {
  tag: string;
  count: number;
}

const PopularTags = () => {
  const [popularTags, setPopularTags] = useState<TagCount[]>([]);

  useEffect(() => {
    // Mock data - in a real app, this would fetch from your data store
    const mockQuestions = [
      { tags: ['react', 'hooks', 'javascript'] },
      { tags: ['typescript', 'generics', 'types'] },
      { tags: ['nodejs', 'error-handling', 'backend'] },
      { tags: ['react', 'typescript', 'frontend'] },
      { tags: ['javascript', 'async', 'promises'] },
      { tags: ['react', 'state-management', 'redux'] },
      { tags: ['nodejs', 'express', 'api'] },
      { tags: ['typescript', 'interfaces', 'types'] },
    ];

    // Count tag frequency
    const tagCount: { [key: string]: number } = {};
    mockQuestions.forEach(question => {
      question.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    const sortedTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Show top 8 tags

    setPopularTags(sortedTags);
  }, []);

  return (
    <div className="mt-3 space-y-1">
      {popularTags.map(({ tag, count }) => (
        <Link
          key={tag}
          to={`/tags/${tag}`}
          className="flex items-center justify-between px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <span>#{tag}</span>
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {count}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default PopularTags;
