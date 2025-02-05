import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User as UserIcon } from 'lucide-react';
import { API_URL } from '../api/signup';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  companyName?: string;
  companyID?: string;
}

async function signUp(userType: string, email: string, password: string, companyName?: string, companyID?: string) {
  const url = userType === 'business' ? 'http://localhost:5050/signupBusiness' : 'http://localhost:5050/signup';
  const body = userType === 'business' 
    ? { email, password, companyName, companyID } 
    : { email, password };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to register');
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw new Error('Failed to register');
  }
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const result = await signUp(
        formData.email,
        formData.password,
        userType,
        formData.companyName,
        formData.companyID
      );
      if (result.success) {
        navigate('/login');
        return;
      }
      else if (result.error) {
        setNotification({ type: 'error', message: result.error });
        return;
      }
      setNotification({ type: 'success', message: 'Registration successful!' });
      userType === 'business' ? navigate('/business-setup') : navigate('/login');
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
