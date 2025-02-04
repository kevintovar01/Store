import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Edit, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '../components/common/Button';
import { createProduct, listProducts, uploadProductImage, updateProduct, deleteProduct } from '../api/products';
import type { Product } from '../types';
import { useNavigate } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      navigate('/login'); 
      return;
    }
    fetchProducts();
  }, [navigate]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    // Conservamos todos los datos existentes del producto
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      // Mantenemos una copia de los datos originales para comparar cambios
      originalData: { ...product }
    });
    setIsModalOpen(true);
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('No authentication token found');
      }
      const data = await listProducts(0);
      // Ensure data is an array, default to empty array if null or undefined
      setProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate('/login');
      }
      setError('Failed to fetch products');
      console.error('Error fetching products:', error);
      // Set to empty array in case of error
      setProducts([]);
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
  
      if (editingProduct) {
        // Actualización de producto existente
        const updatedFields: Partial<Product> = {};
        
        // Solo incluimos los campos que han sido modificados
        if (formData.name !== editingProduct.name) {
          updatedFields.name = formData.name;
        }
        if (formData.description !== editingProduct.description) {
          updatedFields.description = formData.description;
        }
        if (parseFloat(formData.price) !== editingProduct.price) {
          updatedFields.price = parseFloat(formData.price);
        }

        // Si hay campos modificados, actualizamos el producto
        if (Object.keys(updatedFields).length > 0) {
          await updateProduct(editingProduct.id, updatedFields, token);
        }

        // Manejamos la actualización de imagen por separado
        if (selectedImage) {
          try {
            await uploadProductImage(editingProduct.id, selectedImage, token);
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            setError('Product updated, but image upload failed');
          }
        }
      } else {
        // Creación de nuevo producto
        const productData = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price) || 0
        };

        const newProduct = await createProduct(productData, token);

        if (selectedImage && newProduct.id) {
          try {
            await uploadProductImage(newProduct.id, selectedImage, token);
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            setError('Product created, but image upload failed');
          }
        }
      }
  
      // Actualizamos la lista de productos
      await fetchProducts();
  
      // Reseteamos el formulario y cerramos el modal
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        price: ''
      });
      setSelectedImage(null);
      setEditingProduct(null);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(error.message || 'Failed to save product');
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await deleteProduct(productToDelete, token);
      await fetchProducts();
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-5 h-5" />}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          Add New Product
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const baseUrl = "http://localhost:5050";
          const imageUrl = product.url ? `${baseUrl}${product.url}` : '';
          
          return(
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-48">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Action Buttons Overlay */}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button 
                    onClick={() => handleEditProduct(product)}
                    className="bg-white/80 p-1.5 rounded-full shadow hover:bg-white transition"
                    title="Edit Product"
                  >
                    <Edit className="w-5 h-5 text-blue-600" />
                  </button>
                  <button 
                    onClick={() => confirmDeleteProduct(product.id)}
                    className="bg-white/80 p-1.5 rounded-full shadow hover:bg-white transition"
                    title="Delete Product"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xl font-semibold text-blue-600">
                    ${Number(product.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
            <div className="mb-4">
              <Trash2 className="mx-auto w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Confirm Delete
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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