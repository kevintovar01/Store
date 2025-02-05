import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Building2, User as UserIcon } from 'lucide-react';
import { signup, signupBusiness } from '../api/signup'; // Asegúrate de importar las funciones de signup
import { format } from 'date-fns';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  companyName?: string;
  companyID?: string;
}

export function RegisterPage() {
  const [userType, setUserType] = useState<'regular' | 'business'>('regular');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyID: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);

  const { state, signUp } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (userType === 'business') {
      if (!formData.companyName) newErrors.companyName = 'Company Name is required';
      if (!formData.companyID) newErrors.companyID = 'Company ID is required';
    }
    console.log(userType);
    console.log(formData);
    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let response;
      if (userType === 'regular') {
        response = await signup(formData.email, formData.password); // Usamos la función signup para registro regular
      } else {
        response = await signupBusiness(formData.email, formData.password, formData.companyName, formData.companyID); // Usamos signupBusiness para el registro de negocios
      }

      // Al recibir la respuesta exitosa, almacenamos el token y navegamos
      if (response.token) {
        localStorage.setItem('authToken', response.token); // Guardamos el token en localStorage
        setNotification({ type: 'success', message: 'Registration successful!' });
        userType === 'business' ? navigate('/business-setup') : navigate('/');
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Registration failed. Please try again.' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {notification && (
          <div className={`p-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{notification.message}</div>
        )}

        <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <div className="flex justify-center space-x-4 mb-8">
          <button onClick={() => setUserType('regular')} className={`flex items-center px-4 py-2 rounded-lg ${userType === 'regular' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>
            <UserIcon className="w-5 h-5 mr-2" /> Regular User
          </button>
          <button onClick={() => setUserType('business')} className={`flex items-center px-4 py-2 rounded-lg ${userType === 'business' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>
            <Building2 className="w-5 h-5 mr-2" /> Business
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email address" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
          {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}

          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
          {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}

          <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
          {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword}</p>}

          {userType === 'business' && (
            <>
              <input name="companyName" type="text" placeholder="Company Name" value={formData.companyName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
              {errors.companyName && <p className="text-red-600 text-sm">{errors.companyName}</p>}

              <input name="companyID" type="text" placeholder="Company ID" value={formData.companyID} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
              {errors.companyID && <p className="text-red-600 text-sm">{errors.companyID}</p>}
            </>
          )}

          <button type="submit" className="w-full py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            {userType === 'business' ? 'Apply for Business Registration' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
