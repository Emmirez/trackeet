import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { authAPI } from "../../services/api.js";
import toast from "react-hot-toast";
import Navbar from "../landing/Navbar.jsx";
import Footer from "../landing/Footer.jsx";

export default function ForgotPasswordPage() {
  const [sent,     setSent]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [email,    setEmail]    = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Enter your email address')
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="font-poppins min-h-screen flex flex-col">
      <Navbar scrolled={scrolled}/>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark dark:via-surface dark:to-dark px-4 py-32">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/Trackeet-logo.png" alt="Trackeet" className="w-14 h-14 mx-auto mb-4"/>
            <h1 className="text-2xl font-bold text-dark dark:text-white">Reset your password</h1>
            <p className="text-dark-500 dark:text-gray-400 mt-1">We'll send a reset link to your email</p>
          </div>

          <div className="card">
            {sent ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={32} className="text-success"/>
                </div>
                <h3 className="font-bold text-dark dark:text-white">Check your email!</h3>
                <p className="text-dark-500 text-sm">
                  We've sent a password reset link to <strong>{email}</strong>.
                </p>
                <div className="p-3 bg-warning-light rounded-xl text-left">
                  <p className="text-xs font-semibold text-warning">📬 Can't find it?</p>
                  <p className="text-xs text-dark-500 mt-0.5">Check your <strong>spam or junk folder</strong>.</p>
                </div>
                <Link to="/login" className="btn btn-primary w-full">Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"/>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      className="input pl-10"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"/>
                    : 'Send Reset Link'
                  }
                </button>
                <Link to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-dark-400 hover:text-primary transition-colors">
                  <ArrowLeft size={16}/> Back to login
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
}