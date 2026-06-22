import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { authAPI } from "../../services/api.js";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }
    if (called.current) return;
    called.current = true;

    authAPI
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader
              size={48}
              className="text-primary mx-auto mb-4 animate-spin"
            />
            <h2 className="text-xl font-bold text-dark dark:text-white">
              Verifying your email...
            </h2>
            <p className="text-dark-400 mt-2">Please wait a moment</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle size={48} className="text-success mx-auto mb-4" />
            <h2 className="text-xl font-bold text-dark dark:text-white">
              Email Verified! 🎉
            </h2>
            <p className="text-dark-400 mt-2">
              Your account is now active. You can log in.
            </p>
            <Link to="/login" className="btn btn-primary w-full mt-6">
              Go to Login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={48} className="text-danger mx-auto mb-4" />
            <h2 className="text-xl font-bold text-dark dark:text-white">
              Verification Failed
            </h2>
            <p className="text-dark-400 mt-2">{message}</p>
            <ResendForm />
          </>
        )}
      </div>
    </div>
  );
}

function ResendForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authAPI.resendVerification(email);
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  if (sent)
    return (
      <div className="mt-4 p-3 bg-success-light rounded-xl">
        <p className="text-sm text-success font-semibold">
          ✅ New verification email sent!
        </p>
        <p className="text-xs text-dark-400 mt-1">
          Check your inbox and spam folder.
        </p>
      </div>
    );

  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm text-dark-400">Request a new verification link:</p>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Enter your email"
        className="input"
      />
      <button
        onClick={handleResend}
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? "Sending..." : "Resend Verification Email"}
      </button>
    </div>
  );
}
