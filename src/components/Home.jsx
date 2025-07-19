import React, { useState } from 'react';
import MentorsGrid from './MentorsGrid';
import Header from './Header';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header setSearchQuery={setSearchQuery} />
      <div className="pt-16"> 
        <MentorsGrid searchQuery={searchQuery} />
      </div>
    </>
  );
};

export default Home;
