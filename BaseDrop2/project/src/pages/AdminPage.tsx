import React, { useState, useEffect } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Button } from '../components/common/Button';
import { createProduct, listProducts, uploadProductImage } from '../api/products';
import type { Product } from '../types';
import { useNavigate } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''  // Changed to string to handle input properly
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      navigate('/login'); // Redirect to login if no token
      return;
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('No authentication token found');
      }
      const data = await listProducts(0); // Start with page 0
      setProducts(data);
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate('/login');
      }
      setError('Failed to fetch products');
      console.error('Error fetching products:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid numbers only
    if (value === '' || (!isNaN(parseFloat(value)) && value.match(/^\d*\.?\d*$/))) {
      setFormData(prev => ({ ...prev, price: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Convert price to number for API call
      //cambio
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0
      };

      // Create product
      const newProduct = await createProduct(productData, token);

      // Upload image if selected
      if (selectedImage && newProduct.id) {
        await uploadProductImage(newProduct.id, selectedImage, token);
      }

      // Refresh products list
      await fetchProducts();

      // Reset form and close modal
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        price: ''
      });
      setSelectedImage(null);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(error.message || 'Failed to create product');
      console.error('Error creating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Product
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm p-4">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <span>${Number(product.price).toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-500">{product.description}</p>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Add New Product</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={handlePriceChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  icon={<Save className="w-5 h-5" />}
                  className="w-full"
                >
                  Save Product
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};