export default function Index() {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-6 font-poppins">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Hash<span className="text-blue-600">Cart</span> Seller
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Seller Portal is running with Tailwind CSS v4! 🚀
        </p>
        <div className="mt-6">
          <button
            type="button"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Go to Seller Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
