
import { useState } from "react";
import {
  Ticket,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  User,
  Mail,
  UserPlus,
  LogIn,
  CheckCircle2,
} from "lucide-react";

import ThemeToggle from "../UI/ThemeToggle";

export default function LoginForm({
  onLogin,
  loading,
  error,
}) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [registerMessage, setRegisterMessage] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onLogin(loginData);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegisterMessage("");

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterMessage("Password dan konfirmasi password tidak sama.");
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterMessage("Password minimal harus 6 karakter.");
      return;
    }

    setRegisterMessage(
      "Tampilan registrasi sudah siap. Integrasi pendaftaran akun akan dibuat pada tahap backend."
    );
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setRegisterMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">

      <div className="w-full max-w-6xl min-h-[680px] grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">

        {/* LEFT PANEL */}

        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 text-white relative overflow-hidden">

          <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <Ticket size={25} />
            </div>

            <div>
              <h1 className="font-bold text-lg">
                Ticket Tracker
              </h1>
              <p className="text-xs text-blue-200">
                IT Support Management
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/10 text-blue-100 text-xs mb-6">
              <ShieldCheck size={14} />
              Enterprise Support Platform
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
              Manage IT issues.
              <span className="text-blue-300">
                {" "}Stay productive.
              </span>
            </h2>

            <p className="text-blue-100/70 mt-6 leading-relaxed">
              Satu tempat untuk mengelola laporan,
              memantau progres, dan memastikan
              setiap masalah IT tertangani.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-10">
              <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                <ShieldCheck size={20} className="text-blue-300 mb-3" />
                <p className="font-semibold text-sm">
                  Secure Access
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  Protected accounts
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                <Ticket size={20} className="text-blue-300 mb-3" />
                <p className="font-semibold text-sm">
                  Ticket Management
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  Track every issue
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-blue-200/60">
            © 2026 IT Ticket Tracker. All rights reserved.
          </p>
        </div>

        {/* RIGHT PANEL */}

        <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-14">

          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Ticket size={20} />
              </div>

              <span className="font-bold text-slate-900 dark:text-white">
                Ticket Tracker
              </span>
            </div>

            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          <div className="max-w-md w-full mx-auto">

            {/* MODE SWITCH */}

            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
              <button
                type="button"
                onClick={() => changeMode("login")}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                  mode === "login"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LogIn size={17} />
                Sign In
              </button>

              <button
                type="button"
                onClick={() => changeMode("register")}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                  mode === "register"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <UserPlus size={17} />
                Sign Up
              </button>
            </div>

            {/* LOGIN FORM */}

            {mode === "login" && (
              <>
                <div className="mb-8">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">
                    WELCOME BACK
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Sign in to your account
                  </h2>

                  <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
                    Masukkan akun kamu untuk melanjutkan ke dashboard.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5">

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Username
                    </label>

                    <input
                      type="text"
                      value={loginData.username}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          username: e.target.value,
                        })
                      }
                      placeholder="Masukkan username"
                      autoComplete="username"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        placeholder="Masukkan password"
                        autoComplete="current-password"
                        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                    {!loading && <ArrowRight size={18} />}
                  </button>

                </form>
              </>
            )}

            {/* REGISTER FORM */}

            {mode === "register" && (
              <>
                <div className="mb-7">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">
                    CREATE ACCOUNT
                  </p>

                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Create your account
                  </h2>

                  <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
                    Daftarkan akun untuk menggunakan IT Ticket Tracker.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Full Name
                    </label>

                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                      <input
                        type="text"
                        value={registerData.fullName}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="Nama lengkap"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Username
                    </label>

                    <input
                      type="text"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          username: e.target.value,
                        })
                      }
                      placeholder="Buat username"
                      autoComplete="username"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                      <input
                        type="email"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        placeholder="nama@gmail.com"
                        autoComplete="email"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        placeholder="Minimal 6 karakter"
                        autoComplete="new-password"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Confirm Password
                    </label>

                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Ulangi password"
                        autoComplete="new-password"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>

                  {registerMessage && (
                    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-sm p-4 rounded-xl flex items-start gap-2">
                      <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                      <span>{registerMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                  >
                    Create Account
                    <ArrowRight size={18} />
                  </button>

                </form>

                <p className="text-xs text-slate-400 text-center mt-5 leading-relaxed">
                  Pendaftaran akun nantinya memerlukan persetujuan administrator sebelum dapat digunakan.
                </p>
              </>
            )}

            <div className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-400">
              <LockKeyhole size={14} />
              Secure authentication powered by JWT
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
