import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-gradient font-display mb-4">404</p>
        <h1 className="text-2xl font-bold text-surface-900 font-display mb-2">Page Not Found</h1>
        <p className="text-surface-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">Go Back Home</Link>
      </div>
    </div>
  );
}
