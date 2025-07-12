
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Tag, Users, Trophy, MessageCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatsButton from '@/components/StatsButton/StatsButton';
import PopularTags from '@/components/PopularTags/PopularTags';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Tags', href: '/tags', icon: Tag },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 px-3">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Stats
          </h3>
          <div className="space-y-2">
            <Link to="/all-questions">
              <StatsButton
                icon={MessageCircle}
                label="Questions"
                value="1,234"
              />
            </Link>
            <Link to="/all-answers">
              <StatsButton
                icon={MessageSquare}
                label="Answers"
                value="5,678"
              />
            </Link>
          </div>
        </div>

        <div className="mt-8 px-3">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Popular Tags
          </h3>
          <PopularTags />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
