import React from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <>
      <Navbar />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold text-emerald-600 mb-4">🌿 About Cloud Kitchen</h1>
        <p className="text-center text-gray-500 mb-6">Building a seamless food delivery experience with quality, care, and community.</p>
        <div className="bg-white/80 backdrop-blur p-8 rounded-3xl shadow-2xl border border-gray-200 space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Cloud Kitchen is your neighborhood's digital kitchen delivering freshly prepared meals crafted with high-quality ingredients and the warmth of home-cooked flavors. We believe in making your mealtime delightful and convenient.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Whether you crave comforting curries, fresh vegetarian dishes, or a warm biryani, we ensure every dish upholds our commitment to taste, hygiene, and prompt service.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Connect with our founder on <a href="https://www.linkedin.com/in/cloudkitchenbgp/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline hover:text-emerald-700">LinkedIn</a> to follow our journey, behind-the-scenes updates, and the story of how we are shaping local food experiences.
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default About;
