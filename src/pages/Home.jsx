import React from 'react'
import HeroSection from '../component/HeroSection'
import About from './About'
import Service from './Service';
import OurTeam from './OurTeam';
import Contact from './Contact';

const Home = () => {
  return (
    <div className="space-y-10">
      <HeroSection />
      <About  />
      <Service />
      <OurTeam />
      <Contact />
    </div>
  );
}

export default Home



