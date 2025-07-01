import React, { useState } from 'react';
import MentorsGrid from './MentorsGrid';
import Header from './Header';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header setSearchQuery={setSearchQuery} />
      <MentorsGrid searchQuery={searchQuery} />
    </>
  );
};

export default Home;
