import React, { useState } from 'react';
import { ProductCard } from '../components/features/ProductCard';
import ChatInterface from '../components/virtual_try_on/ChatInterface';
import { sampleProducts } from '../data/products';
import { Button } from '../components/common/Button';
import { FaShippingFast, FaLock, FaStar, FaHeadset, FaGift, FaClock } from 'react-icons/fa';

export const HomePage: React.FC = () => {
  function handleVideoCall(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center h-[600px] flex flex-col items-center justify-center text-center text-white bg-[url('/hero-image.jpg')]">
        <h1 className="text-6xl font-extrabold drop-shadow-lg">Unbeatable Deals, Unmatched Style</h1>
        <p className="text-lg mt-4 max-w-2xl">Grab your favorites before they're gone. Limited-time offers!</p>
        <div className="mt-6 flex space-x-4">
          <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-lg">Shop Now</Button>
          <Button className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white text-lg rounded-lg">Explore More</Button>
        </div>
        <div className="absolute bottom-6 bg-black bg-opacity-50 text-white py-2 px-4 rounded-lg">
          <FaClock className="inline-block mr-2" /> Limited-Time Offer: Ends in <span className="font-bold">2h 45m 30s</span>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 px-6 flex justify-around text-gray-700 bg-white shadow-md">
        {[
          { icon: <FaShippingFast className="text-blue-600 text-3xl" />, text: 'Fast & Free Shipping' },
          { icon: <FaLock className="text-blue-600 text-3xl" />, text: 'Secure Payment' },
          { icon: <FaStar className="text-blue-600 text-3xl" />, text: 'Top Rated Products' },
          { icon: <FaHeadset className="text-blue-600 text-3xl" />, text: '24/7 Customer Support' },
        ].map((feature, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            {feature.icon}
            <p>{feature.text}</p>
          </div>
        ))}
      </section>

      {/* Featured Products */}
      <section className="py-12 px-6">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">Trending Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sampleProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-6 bg-gray-200">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Health'].map((category, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center cursor-pointer hover:bg-gray-100 transition">
              {category}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-6 bg-white">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">What Our Customers Say</h2>
        <div className="flex space-x-6 overflow-x-auto">
          {['"Great service and fast shipping!" - Jane D.', '"Amazing products! Highly recommended." - Mark R.'].map((testimonial, idx) => (
            <div key={idx} className="bg-gray-100 p-6 rounded-lg shadow-md min-w-[300px]">
              {testimonial}
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-12 px-6 bg-gray-800 text-white text-center">
        <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
        <p className="mb-6">Subscribe for exclusive deals and early access to new products.</p>
        <div className="flex justify-center">
          <input type="email" placeholder="Enter your email" className="p-3 rounded-l-lg text-black" />
          <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg">Subscribe</Button>
        </div>
      </section>

      {/* Live Chat */}
      <div className="fixed bottom-4 right-4 w-96 h-[600px] z-40">
        <ChatInterface onVideoCall={handleVideoCall} />
      </div>
    </div>
  );
};
