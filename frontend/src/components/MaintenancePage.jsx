export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">🔧</div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">
          We'll be back soon!
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Trackeet is currently undergoing scheduled maintenance. We'll be back
          shortly. Thank you for your patience.
        </p>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">
            Need urgent help? Contact us at{" "}
            <a
              href="mailto:support@trackeet.ng"
              className="text-purple-600 font-semibold hover:underline"
            >
              support@trackeet.ng
            </a>
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-8">
          Powered by <span className="font-bold text-purple-600">Trackeet</span>
        </p>
      </div>
    </div>
  );
}
