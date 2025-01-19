import React from 'react';
import { ProductCard } from '../components/features/ProductCard';
import ChatInterface from '../components/virtual_try_on/ChatInterface';
import { sampleProducts } from '../data/products';

export const HomePage: React.FC = () => {
  function handleVideoCall(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to ShopDrop</h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover amazing products at unbeatable prices
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProducts.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="fixed bottom-4 right-4 w-96 height-600px z-40">
            <ChatInterface onVideoCall={handleVideoCall} />
        </div>
      </section>
    </div>
  );
};