import React, { useState } from 'react';
import MentorsGrid from './MentorsGrid';
import Header from './Header';  // 🟢 Tumne Header ko yaha import karna bhool gaye ho!

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header setSearchQuery={setSearchQuery} />
      <div className="pt-16">  {/* Header ke fixed hone ki wajah se thoda padding diya */}
        <MentorsGrid searchQuery={searchQuery} />
      </div>
    </>
  );
};

export default Home;
