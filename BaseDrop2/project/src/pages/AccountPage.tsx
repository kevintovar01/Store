import React, { useState, useEffect } from 'react';
import { Button } from '../components/common/Button';
import { User, Package, LogOut, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../api/login'; // Importar la función

const sampleOrders = [
  {
    id: '1',
    date: '2024-03-15',
    total: 374.97,
    status: 'delivered',
    items: [
      { name: 'Premium Wireless Headphones', quantity: 1 },
      { name: 'Smart Fitness Watch', quantity: 1 },
    ],
  },
  {
    id: '2',
    date: '2024-03-10',
    total: 24.99,
    status: 'processing',
    items: [
      { name: 'Eco-Friendly Water Bottle', quantity: 1 },
    ],
  },
];

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      // Obtener el token del localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        // Si no hay token, redirigir al login
        navigate('/login');
        return;
      }

      try {
        // Obtener la información del usuario con la promesa
        const data = await getUserInfo(token);
        // Llenar formData con la información obtenida del backend
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '', // O el campo que corresponda
        });
      } catch (err) {
        console.error('Error al obtener la información del usuario:', err);
        navigate('/login'); // Redirigir al login si hay un error
      }
    };

    fetchUserInfo(); // Llamar a la función async
  }, [navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <Button
          variant="outline"
          icon={<LogOut className="w-5 h-5" />}
          onClick={() => navigate('/login')}
        >
          Logout
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            <p className="text-gray-600">{formData.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          isLoading={isSaving}
          icon={<Save className="w-5 h-5" />}
        >
          Save Changes
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
        </div>

        <div className="space-y-6">
          {sampleOrders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm text-gray-600">Order #{order.id}</div>
                  <div className="font-semibold">${order.total.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{order.date}</div>
                  <div className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {order.status}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {order.items.map((item, index) => (
                  <div key={index}>
                    {item.quantity}x {item.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
