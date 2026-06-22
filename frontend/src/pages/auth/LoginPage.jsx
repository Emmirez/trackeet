import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from "lucide-react";
import useAuthStore from "../../store/authStore.js";
import toast from "react-hot-toast";
import Navbar from "../landing/Navbar.jsx";
import Footer from "../landing/Footer.jsx";
import api, { authAPI } from "../../services/api.js";

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [showPwd, setShowPwd] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId2FA, setUserId2FA] = useState(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await authAPI.login({
        email: data.email,
        password: data.password,
      });

      // 2FA required
      if (res.data.requires2FA) {
        setRequires2FA(true);
        setUserId2FA(res.data.userId);
        return;
      }

      const { token, user } = res.data;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setToken(token);

      toast.success("Welcome back!");
      if (user?.role === "admin" || user?.role === "superadmin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Login failed";
      toast.error(msg);
      if (msg.includes("verify your email")) {
        setShowResend(true);
        setUserEmail(data.email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FA = async () => {
    if (twoFACode.length !== 6) return toast.error("Enter 6-digit code");
    setVerifying(true);
    try {
      const res = await authAPI.validate2FA({
        userId: userId2FA,
        code: twoFACode,
      });
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      useAuthStore.getState().setUser(res.data.user);
      useAuthStore.getState().setToken(res.data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="font-poppins min-h-screen flex flex-col">
      <Navbar scrolled={scrolled} />

      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark dark:via-surface dark:to-dark px-4 py-32">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/Trackeet-logo.png"
              alt="Trackeet"
              className="w-14 h-14 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-dark dark:text-white">
              Welcome back!
            </h1>
            <p className="text-dark-500 dark:text-gray-400 mt-1">
              Sign in to your business dashboard
            </p>
          </div>

          <div className="card">
            {requires2FA ? (
              /* ── 2FA Step ── */
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield size={32} className="text-primary" />
                  </div>
                  <h2 className="font-bold text-dark dark:text-white">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-sm text-dark-400 mt-1">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <input
                  value={twoFACode}
                  onChange={(e) =>
                    setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="input text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  autoFocus
                />

                <button
                  onClick={handle2FA}
                  disabled={verifying || twoFACode.length !== 6}
                  className="btn btn-primary w-full py-3"
                >
                  {verifying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Verify Code"
                  )}
                </button>

                <button
                  onClick={() => {
                    setRequires2FA(false);
                    setTwoFACode("");
                  }}
                  className="text-sm text-dark-400 hover:text-primary text-center block w-full transition-colors"
                >
                  ← Back to login
                </button>
              </div>
            ) : (
              /* ── Login Form ── */
              <>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="input-label">Email address</label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
                      />
                      <input
                        {...register("email")}
                        placeholder="you@business.com"
                        className={`input pl-10 ${errors.email ? "border-danger" : ""}`}
                        type="email"
                      />
                    </div>
                    {errors.email && (
                      <p className="input-error">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="input-label mb-0">Password</label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
                      />
                      <input
                        {...register("password")}
                        placeholder="••••••••"
                        className={`input pl-10 pr-10 ${errors.password ? "border-danger" : ""}`}
                        type={showPwd ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark"
                      >
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="input-error">{errors.password.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign in <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                {/* Email not verified banner */}
                {showResend && (
                  <div className="mt-4 p-3 bg-warning-light rounded-xl">
                    <p className="text-xs font-semibold text-warning">
                      📧 Email not verified
                    </p>
                    <p className="text-xs text-dark-500 mt-0.5">
                      Check your <strong>inbox and spam/junk folder</strong> for
                      the verification email.
                    </p>
                    <button
                      onClick={() =>
                        authAPI
                          .resendVerification(userEmail)
                          .then(() =>
                            toast.success(
                              "Verification email sent! Check inbox and spam.",
                            ),
                          )
                          .catch(() => toast.error("Failed to resend"))
                      }
                      className="text-xs text-primary font-semibold mt-2 hover:underline block"
                    >
                      Resend verification email →
                    </button>
                  </div>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dark-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-surface px-3 text-xs text-dark-400">
                      or
                    </span>
                  </div>
                </div>

                <p className="text-center text-sm text-dark-500 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary font-semibold hover:underline"
                  >
                    Create one free
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
