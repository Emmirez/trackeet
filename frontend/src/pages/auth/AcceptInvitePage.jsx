import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Users, Eye, EyeOff } from "lucide-react";
import { teamAPI } from "../../services/api.js";
import toast from "react-hot-toast";

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const { mutate: accept, isPending } = useMutation({
    mutationFn: teamAPI.acceptInvite,
    onSuccess: () => {
      toast.success("Account created! You can now log in.");
      navigate("/login");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Invalid or expired invite"),
  });

  const handleAccept = () => {
    if (!firstName.trim()) return toast.error("Enter your first name");
    if (!lastName.trim()) return toast.error("Enter your last name");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    accept({ token, firstName, lastName, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <p className="text-danger font-semibold">Invalid invite link</p>
          <Link to="/" className="btn btn-primary mt-4">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-dark dark:text-white">
            You've been invited!
          </h1>
          <p className="text-dark-400 mt-1">
            Create your account to join the team
          </p>
        </div>

        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name *</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="input"
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="input pr-12"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleAccept}
            disabled={isPending}
            className="btn btn-primary w-full py-3"
          >
            {isPending
              ? "Creating Account..."
              : "Accept Invite & Create Account"}
          </button>

          <p className="text-xs text-center text-dark-400">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
