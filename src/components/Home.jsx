import React, { useState } from 'react';
import MentorsGrid from './MentorsGrid';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <MentorsGrid searchQuery={searchQuery} />
    </>
  );
};

export default Home;
