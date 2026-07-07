"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  ArrowLeft,
  ShieldCheck,
  Home,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/providers";
import type { Role } from "@/providers";

type UserType = "HomeSeeker" | "Agent" | "RealEstateAgency" | "Landlord" | "ServiceProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const USER_TYPES: { value: UserType; label: string; description: string }[] = [
  { value: "HomeSeeker", label: "Home Seeker", description: "Find properties & services" },
  { value: "Agent", label: "Agent", description: "List and manage properties" },
  { value: "RealEstateAgency", label: "Real Estate Agency", description: "List and manage properties as an agency" },
  { value: "Landlord", label: "Landlord", description: "Rent out your properties" },
  { value: "ServiceProvider", label: "Service Provider", description: "Offer trusted services" },
];

export default function AuthPage() {
  const router = useRouter();
  const { setRole, role } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [userType, setUserType] = useState<UserType>("HomeSeeker");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token && role !== "guest") {
      router.push("/");
    }
  }, [role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isLogin && password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (isLogin) {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, rememberMe }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", data.data.token);
        storage.setItem("user", JSON.stringify(data.data.user));

        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");

        const roleMap: Record<string, Role> = {
          admin: "admin",
          agent: "landlord",
          real_estate_agency: "landlord",
          landlord: "landlord",
          service_provider: "provider",
          vendor: "provider",
          home_seeker: "home_seeker",
        };
        const userRole = (
          data.data.user.userType ||
          data.data.user.role ||
          ""
        ).toLowerCase();
        setRole(roleMap[userRole] || "guest");
        setLoading(false);
        router.replace("/");
      } else {
        const userTypeMap: Record<UserType, string> = {
          HomeSeeker: "home_seeker",
          Agent: "agent",
          RealEstateAgency: "real_estate_agency",
          Landlord: "landlord",
          ServiceProvider: "service_provider",
        };

        const registerBody: Record<string, string> = {
            email,
            password,
            phone,
            firstName,
            lastName,
            userType: userTypeMap[userType],
          };
          if (userType === "ServiceProvider" && website.trim()) {
            registerBody.website = website.trim();
          }

        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registerBody),
        }).catch(() => {
          throw new Error(
            `Network error: Unable to reach server at ${API_URL}. Please check your connection.`,
          );
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        setSuccessMessage(
          "Registration successful! Please check your email to verify your account.",
        );
        setLoading(false);

        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPhone("");
        setFirstName("");
        setLastName("");
        setWebsite("");

        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage("");
        }, 3000);
      }
    } catch (err: unknown) {
      console.error("Auth error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (login: boolean) => {
    setIsLogin(login);
    setError("");
    setSuccessMessage("");
    if (login) setWebsite("");
  };

  const inputClass =
    "w-full h-12 px-4 pl-11 border border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 placeholder-gray-400 transition-all focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left panel — pinned full height, centered content, never scrolls */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative h-full shrink-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-linear-to-br from-blue-700/90 via-blue-800/85 to-indigo-900/90" />

        <div className="relative z-10 flex flex-col h-full w-full">
          <div className="p-10 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-10 pb-10">
            <motion.div
              key={isLogin ? "login-hero" : "signup-hero"}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-md"
            >
              <h1 className="text-4xl xl:text-5xl font-bold text-amber-400 leading-tight mb-4">
                {isLogin ? "Welcome Back" : "Create Your Account"}
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                {isLogin
                  ? "Log in to access trusted properties, verified service providers, and opportunities across Africa."
                  : "Join Africa's verified marketplace for properties and trusted service providers."}
              </p>

              <div className="mt-10 space-y-4">
                {[
                  { icon: ShieldCheck, text: "Verified listings & providers" },
                  { icon: Home, text: "Properties across Africa" },
                  { icon: Briefcase, text: "Trusted local services" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-white/85">
                    <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right panel — only scrollable region when form exceeds viewport */}
      <div className="flex-1 min-h-0 h-full overflow-y-auto overscroll-contain bg-linear-to-b from-slate-50 to-blue-50/40">
        {/* Mobile header */}
        <div className="lg:hidden p-4 flex items-center justify-between shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="flex min-h-full items-center justify-center px-4 sm:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[440px]"
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-7 sm:p-9">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="relative w-48 h-20 sm:w-56 sm:h-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logos/logoforsignuplogin.jpeg"
                    alt="FindAfriq"
                    className="max-w-full max-h-full w-auto h-auto object-contain mx-auto rounded-2xl"
                  />
                </div>
              </div>

              <div className="text-center mb-7">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLogin ? "Sign in to your account" : "Create a new account"}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode(!isLogin)}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3.5 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm"
                  >
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      I am a
                    </label>
                    <select
                      value={userType}
                      onChange={(e) => setUserType(e.target.value as UserType)}
                      className="w-full h-12 px-4 border border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      {USER_TYPES.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {userType === "ServiceProvider" && (
                      <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
                        Service providers should use their registered business name when creating an account.
                      </p>
                    )}
                  </div>
                )}

                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass.replace("pl-11", "px-4")}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={inputClass.replace("pl-11", "px-4")}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="Enter your email"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      WhatsApp Number
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                        placeholder="+250788123456"
                      />
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">
                      International format, e.g. +250788123456
                    </p>
                  </div>
                )}

                {!isLogin && userType === "ServiceProvider" && (
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Website <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className={inputClass.replace("pl-11", "px-4")}
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-11`}
                      placeholder="Enter your password"
                      minLength={6}
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="mt-1.5 text-xs text-gray-400">At least 6 characters</p>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClass} pr-11 ${confirmPassword && password !== confirmPassword ? "border-red-300 focus:border-red-400 focus:ring-red-500/10" : ""}`}
                        placeholder="Confirm your password"
                        minLength={6}
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-1.5 text-xs text-red-600">Passwords do not match</p>
                    )}
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/20"
                >
                  {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
                </motion.button>
              </form>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              By continuing, you agree to our{" "}
              <Link href="/routes/terms" className="text-blue-600 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/routes/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
