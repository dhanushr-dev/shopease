import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../services/api.js';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [accountType, setAccountType] = useState('USER');

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const response = await authAPI.register({ ...data, accountType });
      if (response.data.success) {
        toast.success('Account created! Please login.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-30" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold font-display">SE</span>
            </div>
            <span className="text-2xl font-bold font-display text-surface-900">Shop<span className="text-gradient">Ease</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Create your account</h1>
          <p className="text-surface-500 mt-1">Join ShopEase and start shopping</p>
        </div>
        <div className="card-glass p-8 rounded-2xl shadow-2xl">
          <div className="flex gap-2 p-1 mb-6 bg-surface-100 rounded-xl">
            <button
              type="button"
              onClick={() => setAccountType('USER')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                accountType === 'USER' ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Shop Products (User)
            </button>
            <button
              type="button"
              onClick={() => setAccountType('ADMIN')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                accountType === 'ADMIN' ? 'bg-white text-accent-600 shadow-sm' : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Sell Products (Admin)
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="name" className="input-label">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
                <input id="name" type="text" placeholder="John Doe" className={`input-field pl-11 ${errors.name ? 'border-red-400' : ''}`}
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })} />
              </div>
              {errors.name && <p className="input-error">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="input-label">Email Address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
                <input id="email" type="email" placeholder="you@example.com" className={`input-field pl-11 ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' } })} />
              </div>
              {errors.email && <p className="input-error">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters"
                  className={`input-field pl-11 pr-11 ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="input-error">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5" id="register-submit">
              {submitting ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</span> : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">Already have an account?{' '}<Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
