import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { authAPI } from "../../services/api.js";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength =
    password.length >= 12
      ? 4
      : password.length >= 8
        ? 3
        : password.length >= 6
          ? 2
          : password.length > 0
            ? 1
            : 0;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [
    "",
    "bg-danger",
    "bg-warning",
    "bg-primary",
    "bg-success",
  ][strength];

  const handleReset = async () => {
    if (!password) return toast.error("Enter a new password");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password });
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark dark:via-surface dark:to-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-glow">
             <img
              src="/Trackeet-logo.png"
              alt="Trackeet"
              className="w-14 h-14 mx-auto mb-4"
            />
            </div>
            <span className="text-2xl font-black text-dark dark:text-white">
              Trackeet
            </span>
          </Link>
          {!success && (
            <>
              <h1 className="text-2xl font-bold text-dark dark:text-white">
                Create new password
              </h1>
              <p className="text-dark-500 mt-1">
                Enter a strong password for your account
              </p>
            </>
          )}
        </div>

        {success ? (
          <div className="card text-center space-y-4">
            <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-success" />
            </div>
            <h2 className="text-xl font-black text-dark dark:text-white">
              Password Reset! 🎉
            </h2>
            <p className="text-dark-400">
              Your password has been changed successfully. Redirecting to
              login...
            </p>
            <Link to="/login" className="btn btn-primary w-full">
              Go to Login
            </Link>
          </div>
        ) : (
          <div className="card space-y-4">
            {/* New password */}
            <div>
              <label className="label">New Password *</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="input pl-10 pr-10"
                />
                <button
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200 dark:bg-gray-700"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-dark-400">
                    {strengthLabel} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="label">Confirm Password *</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className="input pl-10 pr-10"
                />
                <button
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm && password !== confirm && (
                <p className="text-xs text-danger mt-1">
                  Passwords do not match
                </p>
              )}
              {confirm && password === confirm && (
                <p className="text-xs text-success mt-1">✅ Passwords match</p>
              )}
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={16} /> Reset Password
                </>
              )}
            </button>

            <Link
              to="/login"
              className="block text-center text-sm text-dark-400 hover:text-primary transition-colors"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
