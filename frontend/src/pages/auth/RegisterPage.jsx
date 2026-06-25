import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Store,
} from "lucide-react";
import { authAPI } from "../../services/api.js";
import toast from "react-hot-toast";
import Navbar from "../landing/Navbar.jsx";
import Footer from "../landing/Footer.jsx";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore.js";
import api from "../../services/api.js";

const CATEGORIES = [
  {
    value: "fashion",
    emoji: "👗",
    label: "Fashion & Clothing",
    desc: "Clothes, shoes, accessories",
  },
  {
    value: "food",
    emoji: "🍔",
    label: "Food & Catering",
    desc: "Restaurants, caterers, vendors",
  },
  {
    value: "beauty",
    emoji: "💅",
    label: "Beauty & Salon",
    desc: "Hair, nails, makeup, spa",
  },
  {
    value: "pharmacy",
    emoji: "💊",
    label: "Pharmacy",
    desc: "Drugs, supplements, medical",
  },
  {
    value: "electronics",
    emoji: "📱",
    label: "Electronics",
    desc: "Phones, gadgets, repairs",
  },
  {
    value: "pos",
    emoji: "💳",
    label: "POS & Financial Services",
    desc: "POS, transfers, financial",
  },
  {
    value: "grocery",
    emoji: "🛒",
    label: "Grocery & Supermarket",
    desc: "Food items, provisions",
  },
  {
    value: "furniture",
    emoji: "🪑",
    label: "Furniture",
    desc: "Furniture, decor, fittings",
  },
  {
    value: "home_services",
    emoji: "🔧",
    label: "Home Services",
    desc: "Plumbers, electricians, cleaners",
  },
  {
    value: "printing",
    emoji: "🖨️",
    label: "Printing & Branding",
    desc: "Flyers, banners, branding",
  },
  {
    value: "freelance",
    emoji: "💻",
    label: "Freelancers & Creatives",
    desc: "Designers, developers, writers",
  },
  {
    value: "general",
    emoji: "🏪",
    label: "General Business",
    desc: "Any other business type",
  },
];

const schema = yup.object({
  firstName: yup.string().required("First name required"),
  lastName: yup.string().required("Last name required"),
  businessName: yup.string().required("Business name required"),
  email: yup.string().email("Invalid email").required(),
  phone: yup.string().required("Phone required"),
  password: yup.string().min(6).required(),
});

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showVerifyMessage, setShowVerifyMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [referralCode, setReferralCode] = useState(refCode);
  const navigate = useNavigate();

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

  // const onSubmit = async (data) => {
  //   setIsLoading(true);
  //   try {
  //     await authAPI.register({ ...data, businessCategory: selectedCategory, ref: refCode || undefined });
  //     setRegisteredEmail(data.email);
  //     setShowVerifyMessage(true);
  //   } catch (err) {
  //     toast.error(
  //       err.response?.data?.message || err.message || "Registration failed",
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await authAPI.register({
        ...data,
        businessCategory: selectedCategory,
        ref: refCode || undefined,
      });
      const { token, user } = res.data;

      // Log user in directly
      import("../../services/api.js").then(({ default: api }) => {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      });
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setToken(token);

      toast.success("Welcome to Trackeet! 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Registration failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendVerification(registeredEmail);
      toast.success("Verification email resent! Check inbox and spam.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="font-poppins min-h-screen flex flex-col">
      <Navbar scrolled={scrolled} />

      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark dark:via-surface dark:to-dark px-4 py-32">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <img
              src="/Trackeet-logo.png"
              alt="Trackeet"
              className="w-14 h-14 mx-auto mb-4"
            />
            {!showVerifyMessage && (
              <>
                <h1 className="text-2xl font-bold text-dark dark:text-white">
                  {step === 1
                    ? "What type of business?"
                    : "Create free account"}
                </h1>
                <p className="text-dark-500 dark:text-gray-400 mt-1">
                  {step === 1
                    ? "We'll customize Trackeet for your industry"
                    : "5 invoices free. No credit card needed."}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {[1, 2].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all ${
                        s === step
                          ? "w-8 bg-primary"
                          : s < step
                            ? "w-4 bg-primary/40"
                            : "w-4 bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {showVerifyMessage ? (
            <div className="card text-center space-y-5">
              <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={40} className="text-success" />
              </div>
              <div>
                <h2 className="text-xl font-black text-dark dark:text-white">
                  Account Created! 🎉
                </h2>
                <p className="text-dark-400 text-sm mt-1">
                  Your Trackeet account has been successfully created.
                </p>
              </div>
              <div className="p-4 bg-primary-light dark:bg-primary/10 rounded-xl text-left">
                <p className="text-sm font-semibold text-dark dark:text-white mb-1">
                  📧 Check your email
                </p>
                <p className="text-sm text-dark-400">
                  We sent a verification link to{" "}
                  <strong className="text-dark dark:text-white">
                    {registeredEmail}
                  </strong>
                  . Click the link to verify and activate your account.
                </p>
              </div>
              <div className="p-3 bg-warning-light rounded-xl text-left">
                <p className="text-xs font-semibold text-warning">
                  📬 Can't find the email?
                </p>
                <p className="text-xs text-dark-500 mt-0.5">
                  Check your <strong>spam or junk folder</strong> and mark it as
                  "Not Spam".
                </p>
              </div>
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-primary font-semibold hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend verification email →"}
              </button>
              <Link to="/login" className="btn btn-primary w-full">
                Go to Login <ArrowRight size={16} />
              </Link>
              <p className="text-xs text-dark-400">
                Once verified, log in with your email and password.
              </p>
            </div>
          ) : step === 1 ? (
            <div className="card">
              <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex flex-col items-start gap-1 p-3 rounded-2xl border-2 transition-all text-left
                      ${
                        selectedCategory === cat.value
                          ? "bg-primary-light border-primary"
                          : "border-dark-200 dark:border-gray-700 hover:border-primary/40"
                      }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl">{cat.emoji}</span>
                      {selectedCategory === cat.value && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-sm font-bold leading-tight ${selectedCategory === cat.value ? "text-primary" : "text-dark dark:text-white"}`}
                    >
                      {cat.label}
                    </p>
                    <p className="text-xs text-dark-400 leading-tight">
                      {cat.desc}
                    </p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (!selectedCategory)
                    return toast.error("Please select your business type");
                  setStep(2);
                }}
                className="btn btn-primary w-full mt-4"
              >
                Continue <ArrowRight size={16} />
              </button>

              <p className="text-center text-sm text-dark-500 mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <div className="card">
              {/* Referral code banner */}
              {refCode && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-success-light rounded-xl border border-success/20">
                  <span className="text-lg">🎁</span>
                  <div>
                    <p className="text-xs font-bold text-success">
                      Referral code applied: {refCode}
                    </p>
                    <p className="text-xs text-dark-400">
                      You'll get 1 free month when you upgrade to any paid plan
                    </p>
                  </div>
                </div>
              )}
              {/* Selected category badge */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-primary-light rounded-xl">
                <span className="text-xl">
                  {CATEGORIES.find((c) => c.value === selectedCategory)?.emoji}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">
                    {
                      CATEGORIES.find((c) => c.value === selectedCategory)
                        ?.label
                    }
                  </p>
                  <p className="text-xs text-dark-400">
                    Trackeet will be customized for your industry
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Change
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { n: "firstName", l: "First Name" },
                    { n: "lastName", l: "Last Name" },
                  ].map((f) => (
                    <div key={f.n}>
                      <label className="input-label">{f.l}</label>
                      <div className="relative">
                        <User
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
                        />
                        <input
                          {...register(f.n)}
                          className={`input pl-9 ${errors[f.n] ? "border-danger" : ""}`}
                          placeholder={f.l}
                        />
                      </div>
                      {errors[f.n] && (
                        <p className="input-error">{errors[f.n].message}</p>
                      )}
                    </div>
                  ))}
                </div>

                {[
                  {
                    n: "businessName",
                    l: "Business Name",
                    i: Building2,
                    t: "text",
                    p: "e.g. Amaka Fashion Store",
                  },
                  {
                    n: "email",
                    l: "Email Address",
                    i: Mail,
                    t: "email",
                    p: "you@business.com",
                  },
                  {
                    n: "phone",
                    l: "Phone Number",
                    i: Phone,
                    t: "tel",
                    p: "+234 800 000 0000",
                  },
                ].map((f) => (
                  <div key={f.n}>
                    <label className="input-label">{f.l}</label>
                    <div className="relative">
                      <f.i
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
                      />
                      <input
                        {...register(f.n)}
                        type={f.t}
                        placeholder={f.p}
                        className={`input pl-9 ${errors[f.n] ? "border-danger" : ""}`}
                      />
                    </div>
                    {errors[f.n] && (
                      <p className="input-error">{errors[f.n].message}</p>
                    )}
                  </div>
                ))}

                <div>
                  <label className="input-label">Password</label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
                    />
                    <input
                      {...register("password")}
                      type={showPwd ? "text" : "password"}
                      placeholder="Min 6 characters"
                      className={`input pl-9 pr-9 ${errors.password ? "border-danger" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="input-error">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-ghost border border-dark-200 dark:border-gray-700 px-4"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary flex-1"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Store size={16} /> Create Account
                      </>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-center text-sm text-dark-500 mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
