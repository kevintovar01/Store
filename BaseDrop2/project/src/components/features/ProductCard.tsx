import React, { useState } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '../../types';
import { Button } from '../common/Button';
import { useCart } from '../../store/CartContext';
import { ProductDetails } from './ProductDetails';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  console.log(product);
  const { dispatch } = useCart();
  const [showDetails, setShowDetails] = useState(false);

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    dispatch({ type: 'ADD_ITEM', payload: product});  
  };

  const baseUrl = "http://localhost:5050";
  const imageUrl = `${baseUrl}${product.url}`;
  product.server_image_url = imageUrl;
  



  return (
    <>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] duration-300 cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <div className="relative pb-[56.25%]">
          <img
            src={imageUrl}
            alt={product.name}
            className="absolute top-0 left-0 w-full h-full object-cover"
            loading="lazy"
          />
          <button
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
          >
            <Eye className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </span>
            <Button
              onClick={addToCart}
              icon={<ShoppingCart className="w-5 h-5" />}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>

      {showDetails && (
        <ProductDetails
          product={product}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};