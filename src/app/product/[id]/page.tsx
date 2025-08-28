import { notFound } from 'next/navigation';
import { products } from '@/data/products';
import Link from 'next/link';
import { ArrowLeft, Eye, ShoppingCart, Star } from 'lucide-react';
import ModelPreview from '@/components/ModelPreview';
import EnhancedARButton from '@/components/EnhancedARButton';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = products.find(p => p.id === resolvedParams.id);

  if (!product) {
    notFound();
  }



  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-800 hover:text-black">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <Link href="/" className="text-xl font-medium text-black">
              Party Bazaar
            </Link>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Product Details */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="lg:col-span-1">
            {product.arModel ? (
              <div className="space-y-4">
                <div className="aspect-square bg-gray-50 rounded-md border border-gray-100 overflow-hidden">
                  <ModelPreview 
                    modelPath={product.arModel}
                    productName={product.name}
                    height="100%"
                    fullSize={true}
                    autoRotate={true}
                    showControls={true}
                  />
                </div>
                <div>
                  <EnhancedARButton 
                    arModel={product.arModel}
                    productName={product.name}
                  />
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">3D model not available</p>
                </div>
              </div>
            )}
            
            {/* 3D Model Info */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
                  </svg>
                  Interactive 3D Model
                </span>
                • Rotate to explore • Click "View in AR" to place in your space
              </p>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 tracking-wide">(4.8) · 127 reviews</span>
              </div>
              
              <h1 className="text-3xl font-medium text-black mb-4">
                {product.name}
              </h1>
              
              <p className="text-base text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <div className="flex items-baseline space-x-3 mb-6">
                <span className="text-2xl font-medium text-black">
                  ${product.price}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${(product.price * 1.2).toFixed(2)}
                </span>
                <span className="bg-black text-white text-xs font-medium px-2 py-1 rounded-sm">
                  20% OFF
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-700 rounded-full"></div>
                  <span className="text-sm font-medium">In Stock</span>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1.5">
                  <p className="flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Free shipping on orders over $50</p>
                  <p className="flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>30-day return policy</p>
                  <p className="flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Perfect for parties and celebrations</p>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button className="flex-1 bg-black text-white px-6 py-3 rounded-md font-medium text-sm hover:bg-gray-900 transition-colors flex items-center justify-center space-x-2 tracking-wide">
                  <ShoppingCart className="w-4 h-4" />
                  <span>ADD TO CART</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}