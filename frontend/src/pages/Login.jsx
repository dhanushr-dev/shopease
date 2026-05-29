import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import { authAPI } from '../services/api.js';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accountType, setAccountType] = useState('USER');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const response = await authAPI.login({ ...data, accountType });
      if (response.data.success) {
        const userData = response.data.data;
        
        login(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        
        if (userData.role === 'ROLE_ADMIN') {
           navigate('/admin', { replace: true });
        } else {
           navigate(from, { replace: true });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent-100 rounded-full blur-3xl opacity-30" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold font-display">SE</span>
            </div>
            <span className="text-2xl font-bold font-display text-surface-900">Shop<span className="text-gradient">Ease</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Welcome back</h1>
          <p className="text-surface-500 mt-1">Sign in to your account to continue</p>
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
              Login as User
            </button>
            <button
              type="button"
              onClick={() => setAccountType('ADMIN')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                accountType === 'ADMIN' ? 'bg-white text-accent-600 shadow-sm' : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Login as Admin/Seller
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="input-label">Email Address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
                <input id="email" type="email" placeholder="you@example.com"
                  className={`input-field pl-11 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                  {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please enter a valid email' } })} />
              </div>
              {errors.email && <p className="input-error">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                  className={`input-field pl-11 pr-11 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="input-error">{errors.password.message}</p>}
            </div>
            <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
              <p className="text-xs font-semibold text-primary-700 mb-1">Demo Credentials:</p>
              <p className="text-xs text-primary-600">Admin: admin@shopease.com / admin123</p>
              <p className="text-xs text-primary-600">User: john@example.com / user123</p>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5" id="login-submit">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
