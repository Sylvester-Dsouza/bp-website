'use client';

import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import Link from 'next/link';

export default function Home() {
  // Filter products with AR models
  const arProducts = products.filter(product => product.arModel);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-xl font-medium text-black">Party Bazaar</h1>
          <p className="text-gray-500 text-xs mt-1">AR Party Supplies</p>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <h2 className="text-3xl font-medium text-black mb-3">Experience Products in AR</h2>
          <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto">
            See how our balloons and decorations look in your space before you buy.
          </p>
        </div>
      </div>

      {/* Products Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-black">Our Products</h2>
          <div className="text-black flex items-center text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            <span>View in your space</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-xs">© 2023 Party Bazaar - AR Party Supplies</p>
        </div>
      </footer>
    </div>
  );
}
