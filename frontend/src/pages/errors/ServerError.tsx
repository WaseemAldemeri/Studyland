import { useLocation } from 'react-router';

export function ServerError() {
  const { state } = useLocation();

  const errorMessage = state.error?.message ?? "An unexpected error occurred.";
  const errorDetails = state.error?.details ?? "";

  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-bold">Oops!</h1>
      <p className="mt-4">Sorry, something went wrong.</p>
      <p className="mt-2 text-muted-foreground">{errorMessage}</p>
      <p className="mt-2 text-muted-foreground">{errorDetails}</p>
    </div>
  );
}