'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-xs text-gray-500 mb-4">An unexpected error has occurred.</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
