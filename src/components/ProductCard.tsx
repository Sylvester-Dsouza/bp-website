import Link from 'next/link';
import { Product } from '@/data/products';
import { Eye, View } from 'lucide-react';
import ModelPreview from './ModelPreview';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="bg-white border border-gray-100 rounded-md overflow-hidden hover:shadow-sm transition-all duration-200 relative">
        {/* AR Badge */}
        {product.arModel && (
          <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded-sm text-xs font-medium flex items-center z-10">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            AR
          </div>
        )}
        
        {/* Product Image */}
        <div className="w-full aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
          {product.arModel ? (
            <ModelPreview 
              modelPath={product.arModel} 
              productName={product.name} 
              height="100%"
              fullSize={true}
              autoRotate={true}
              showControls={false}
            />
          ) : (
            <div className="text-center">
              <div className="text-3xl mb-2">🎈</div>
              <p className="text-xs text-gray-500">{product.name}</p>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-base mb-1 text-black">
            {product.name}
          </h3>
          
          <p className="text-gray-500 text-xs mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-black">
              ${product.price}
            </div>
            
            {product.arModel && (
              <div className="text-black flex items-center text-xs">
                <Eye className="w-3 h-3 mr-1" />
                <span>Details</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}