import React from 'react';

// This component is no longer needed since all routing is handled in App.tsx
// But keeping it as a simple component that renders Home in case it's still referenced
import Home from '@/pages/Home/Home';

const Index = () => {
  return <Home />;
};

export default Index;
