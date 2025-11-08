import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-bold">404 - Not Found</h1>
      <p className="mt-4">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6 inline-block text-primary hover:underline">
        Go back home
      </Link>
    </div>
  );
}
