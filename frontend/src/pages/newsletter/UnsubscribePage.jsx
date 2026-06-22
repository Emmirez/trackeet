import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function UnsubscribePage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .get(`/subscribers/unsubscribe/${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Processing...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">
              Unsubscribed
            </h1>
            <p className="text-gray-500 mb-6">
              You've been successfully unsubscribed. You won't receive any more
              emails from this store.
            </p>
            <Link
              to="/"
              className="text-purple-600 font-semibold hover:underline text-sm"
            >
              Back to Trackeet
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">
              Invalid Link
            </h1>
            <p className="text-gray-500 mb-6">
              This unsubscribe link is invalid or has already been used.
            </p>
            <Link
              to="/"
              className="text-purple-600 font-semibold hover:underline text-sm"
            >
              Back to Trackeet
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
