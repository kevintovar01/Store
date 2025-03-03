import React, { useState, useEffect } from "react";
import { ProductCard } from "../components/features/ProductCard";
import { Search, Filter, ShoppingCart, Package } from "lucide-react";
import { listProducts } from "../api/products";

export const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listProducts(0, searchTerm);
        // Ensure data is an array, default to empty array if null or undefined
        setProducts(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error("Error fetching products:", error.message);
        setError(error.message || "Failed to fetch products");
        // Set to empty array in case of error
        setProducts([]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [searchTerm]);

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Shop Our Best Deals</h1>
        <button className="relative bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700">
          <ShoppingCart className="w-6 h-6" />
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 mb-4">No products found</p>
          {searchTerm ? (
            <p className="text-gray-500 mb-6">
              No products match your search "{searchTerm}"
            </p>
          ) : (
            <p className="text-gray-500 mb-6">
              There are currently no products available
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <footer className="mt-12 text-center text-gray-600">
      </footer>
    </div>
  );
};