import React, { useState } from "react";
import { 
  auth, 
  isMockFirebase 
} from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile,
  signOut
} from "firebase/auth";
import { 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Leaf, 
  RefreshCw,
  Loader2,
  LockOpen,
  Sun,
  Moon
} from "lucide-react";
import firebaseConfig from "../../firebase-applet-config.json";

interface AuthScreenProps {
  onAuthSuccess: (user: { uid: string; displayName?: string | null; email?: string | null; emailVerified?: boolean }) => void;
  onEnterDemoMode?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function AuthScreen({ 
  onAuthSuccess, 
  onEnterDemoMode,
  darkMode,
  onToggleDarkMode
}: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "verify">("login");
  
  // Input fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Async feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: React.ReactNode } | null>(null);
  
  // Pending user object for verification checking
  const [pendingUser, setPendingUser] = useState<{ uid: string; displayName?: string | null; email?: string | null; emailVerified?: boolean } | null>(null);

  // Auto-redirect if unverified on reload
  React.useEffect(() => {
    if (!isMockFirebase && auth.currentUser && !auth.currentUser.emailVerified) {
      setPendingUser(auth.currentUser);
      setMode("verify");
      setMessage({
        type: "error",
        text: "Your email must be verified. We sent a secure link to your inbox!"
      });
    }
  }, []);

  const handleAuthError = (err: { message?: string; code?: string }) => {
    let readableMsg: React.ReactNode = err?.message || "Oops, something went wrong. Please try again!";
    
    if (err?.code === "auth/invalid-credential") {
      readableMsg = "Oops! Incorrect email or password. Check your spelling and try again!";
    } else if (err?.code === "auth/email-already-in-use") {
      readableMsg = "This email is already in use. Try logging in or press Reset Password.";
    } else if (err?.code === "auth/weak-password") {
      readableMsg = "Your password must have 6 letters or numbers to stay secure!";
    } else if (err?.code === "auth/invalid-email") {
      readableMsg = "Please enter a correct email ID (like name@gmail.com).";
    } else if (err?.code === "auth/operation-not-allowed") {
      const consoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
      readableMsg = (
        <span className="block space-y-2">
          <span className="block font-black text-rose-800 dark:text-rose-200">
            🔒 Log In Disabled
          </span>
          <span className="block text-text-primary">
            Email log in is not active in Firebase yet.
          </span>
          <span className="block bg-bg-base/50 p-2.5 rounded-xl border border-border-custom text-text-secondary text-[10px] space-y-1">
            <span className="block font-bold text-text-primary underline">How to open in 20 seconds:</span>
            <span className="block">1. Click the <a href={consoleUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold text-brand-primary hover:text-emerald-700">Firebase Console link</a>.</span>
            <span className="block">2. Go to <strong>Sign-in providers</strong>, click <strong>Email/Password</strong>.</span>
            <span className="block">3. Turn on <strong>Enable</strong> and click <strong>Save</strong>.</span>
          </span>
          <span className="block font-semibold text-text-secondary text-[10px] pt-1">
            💡 Easy Tip: You can also login instantly by using <strong>Demo Mode</strong> or <strong>Google Sign In</strong> below!
          </span>
        </span>
      );
    }
    setMessage({ type: "error", text: readableMsg });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: "error", text: "Please type your email and password." });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      if (isMockFirebase) {
        // Mock success for beautiful preview flow
        const dummyUser = {
          uid: "mock-uid-123",
          email: email,
          displayName: name || email.split("@")[0],
          emailVerified: false // defaults to unverified to show the verification flow
        };
        setPendingUser(dummyUser);
        setMode("verify");
        setMessage({ 
          type: "success", 
          text: "[DEMO] Mock account made. Please click the link to verify email!" 
        });
        return;
      }

      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      
      if (!user.emailVerified) {
        setPendingUser(user);
        setMode("verify");
        setMessage({ type: "error", text: "Please verify your email! We sent a link to your inbox." });
      } else {
        onAuthSuccess(user);
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setMessage({ type: "error", text: "Please type your name, email, and a 6-digit password." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isMockFirebase) {
        const dummyUser = {
          uid: "mock-uid-123",
          email: email,
          displayName: name,
          emailVerified: false
        };
        setPendingUser(dummyUser);
        setMode("verify");
        return;
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      
      // Update display name
      await updateProfile(user, { displayName: name });
      
      // Trigger email verification
      await sendEmailVerification(user);
      
      setPendingUser(user);
      setMode("verify");
      setMessage({ 
        type: "success", 
        text: "Account made! We sent a link to your email inbox." 
      });
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (isMockFirebase) {
        const dummyUser = {
          uid: "mock-google-789",
          email: "greenlearner@gmail.com",
          displayName: "Daily Green Learner",
          emailVerified: true
        };
        onAuthSuccess(dummyUser);
        return;
      }

      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      onAuthSuccess(credential.user);
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: "error", text: "Please type your email ID to reset password." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isMockFirebase) {
        setMessage({ 
          type: "success", 
          text: "[DEMO] We simulated sending a reset link to your email ID!" 
        });
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setMessage({ 
        type: "success", 
        text: "We sent a reset link to your email ID! Please check your spam folder." 
      });
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerificationStatus = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (isMockFirebase) {
        // Instantly bypass for the demo sandbox
        const verifiedUser = { ...pendingUser, emailVerified: true };
        onAuthSuccess(verifiedUser);
        return;
      }

      // Reload real user status
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          onAuthSuccess(user);
        } else {
          setMessage({ 
            type: "error", 
            text: "Email not verified yet. Please click the link we sent you!" 
          });
        }
      } else if (pendingUser) {
        // Fallback for custom credentials
        setMessage({ 
          type: "error", 
          text: "Verification link not clicked yet. Tap Check Status again!" 
        });
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCheck = async () => {
    setLoading(true);
    try {
      if (isMockFirebase) {
        setMessage({ type: "success", text: "[DEMO] Live email simulated!" });
        return;
      }
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setMessage({ type: "success", text: "Sent a fresh verification link!" });
      } else {
        setMessage({ type: "error", text: "Session lost. Please log back in." });
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-bg-surface/80 backdrop-blur-md rounded-[32px] border border-border-custom p-6 md:p-8 shadow-xl relative overflow-hidden transition-colors duration-250 text-text-primary" id="auth-screen-interactive-card">
      
      {/* Background glow nodes */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-brand-primary/10 rounded-full blur-2xl" />

      {/* Guest user Theme Toggler */}
      {onToggleDarkMode && (
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="absolute right-5 top-5 p-2 rounded-xl transition bg-bg-base border border-border-custom text-text-primary hover:opacity-85 cursor-pointer"
          title="Toggle preview theme mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-emerald-800" />}
        </button>
      )}

      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-[#2E7D4F] to-[#2BA962] dark:from-[#4ADE80] dark:to-[#22C55E] rounded-2xl flex items-center justify-center text-white mx-auto shadow-md animate-pulse">
          <Leaf className="w-6 h-6" />
        </div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight" id="auth-welcome-title">
          {mode === "login" && "Welcome to CarbonMate"}
          {mode === "signup" && "Create Your Account"}
          {mode === "forgot" && "Reset Your Password"}
          {mode === "verify" && "Verify Your Email"}
        </h2>
        <p className="text-xs text-text-secondary font-semibold leading-relaxed">
          {mode === "login" && "Sign in to track your Daily Pollution score! 🌿"}
          {mode === "signup" && "Create a free account to track Daily Pollution! 😊"}
          {mode === "forgot" && "Enter your email to reset your secure password."}
          {mode === "verify" && "We sent you an email. Please click the link to verify!"}
        </p>
      </div>

      {message && (
        <div 
          className={`p-4 rounded-2xl text-[11px] font-bold mb-5 flex items-start gap-2 border leading-normal ${
            message.type === "success" 
              ? "bg-emerald-50/80 border-emerald-250 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100" 
              : "bg-rose-50/80 border-rose-250 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-100"
          }`}
          id="auth-notification-banner"
        >
          {message.type === "success" ? <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-brand-primary" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* RENDER LOGIN PORTAL */}
      {mode === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="auth-login-email" className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
              <input 
                id="auth-login-email"
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-base border border-border-custom text-text-primary rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="auth-login-password" className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">Password</label>
              <button 
                type="button" 
                onClick={() => setMode("forgot")}
                className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
              <input 
                id="auth-login-password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-base border border-border-custom text-text-primary rounded-xl py-2.5 pl-10 pr-10 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-colors"
                required
              />
              <button 
                type="button" 
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-text-secondary hover:text-text-primary cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-brand-primary hover:opacity-90 active:scale-[0.98] transition rounded-2xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* RENDER ACCOUNT REGISTRATION */}
      {mode === "signup" && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="auth-signup-name" className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
              <input 
                id="auth-signup-name"
                type="text" 
                placeholder="Your Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-base border border-border-custom text-text-primary rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-signup-email" className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
              <input 
                id="auth-signup-email"
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-base border border-border-custom text-text-primary rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-signup-password" className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">Secret Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
              <input 
                id="auth-signup-password"
                type={showPassword ? "text" : "password"} 
                placeholder="6 or more characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-base border border-border-custom text-text-primary rounded-xl py-2.5 pl-10 pr-10 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-colors"
                required
              />
              <button 
                type="button" 
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-text-secondary hover:text-text-primary cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-brand-primary hover:opacity-90 active:scale-[0.98] transition rounded-2xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* RENDER PASSWORD RESET */}
      {mode === "forgot" && (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-base border border-border-custom text-text-primary rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-colors"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-brand-primary hover:opacity-90 active:scale-[0.98] transition rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Password Reset Link"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button 
            type="button" 
            onClick={() => setMode("login")}
            className="w-full py-2 bg-bg-surface border border-border-custom text-text-secondary hover:bg-bg-base transition rounded-xl font-bold text-xs cursor-pointer"
          >
            Back to Sign In
          </button>
        </form>
      )}

      {/* RENDER EMAIL VERIFICATION PROCESS */}
      {mode === "verify" && (
        <div className="space-y-5">
          <div className="border border-border-custom bg-bg-base p-4 rounded-2xl flex flex-col items-center text-center gap-2">
            <LockOpen className="w-7 h-7 text-brand-primary animate-bounce" />
            <p className="text-[11px] font-semibold leading-normal text-text-primary">
              Please click the verification link we sent to <span className="font-bold underline">{pendingUser?.email || email}</span> to log in safely!
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button 
              type="button" 
              onClick={handleCheckVerificationStatus}
              disabled={loading}
              className="w-full py-3 bg-brand-primary hover:opacity-95 font-black text-xs text-white rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              I have verified / Check Status
            </button>

            <button 
              type="button" 
              onClick={handleResendCheck}
              disabled={loading}
              className="w-full py-2 bg-bg-base border border-border-custom font-bold text-xs text-text-secondary rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Send again
            </button>

            {isMockFirebase && (
              <button 
                type="button" 
                onClick={() => onAuthSuccess({ ...pendingUser, emailVerified: true })}
                className="w-full py-2 bg-gradient-to-r from-teal-50/50 to-emerald-50/50 dark:from-emerald-950/10 dark:to-teal-950/10 text-[10px] font-black tracking-wider uppercase text-brand-primary border border-border-custom rounded-xl hover:opacity-90 transition cursor-pointer"
                id="verify-demo-bypass-btn"
              >
                ⏩ Sandbox Quick Bypass (Mock Mode)
              </button>
            )}

            <button 
              type="button" 
              onClick={() => {
                signOut(auth);
                setMode("login");
                setPendingUser(null);
                setMessage(null);
              }}
              className="w-full py-2 border border-border-custom hover:bg-bg-base text-text-secondary transition rounded-xl font-bold text-xs cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* RENDER ADJACENT INTERACTIVE LOGINS */}
      {mode !== "verify" && (
        <div className="mt-5 pt-5 border-t border-border-custom space-y-4">
          <div className="relative flex justify-center text-xs">
            <span className="bg-bg-surface px-3.5 py-1 text-[10px] font-black text-text-secondary absolute transform -translate-y-1/2">
              OR ACCESS WITH
            </span>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-bg-surface border border-border-custom hover:bg-bg-base active:scale-[0.99] transition text-xs font-bold text-text-primary flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
            id="google-signin-btn"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
               <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.564-1.88 4.584-6.887 4.584-4.33 0-7.859-3.583-7.859-8s3.529-8 7.859-8c2.463 0 4.114 1.053 5.053 1.957l3.228-3.1C18.257.9 15.53 0 12.24 0c-6.63 0-12 5.37-12 12s5.37 12 12 12c6.914 0 11.514-4.857 11.514-11.73 0-.785-.086-1.393-.186-1.985H12.24z"/>
            </svg>
            Sign In with Google
          </button>

          {onEnterDemoMode && (
            <button 
              type="button"
              onClick={onEnterDemoMode}
              className="w-full py-2 bg-[#E6F4EA] dark:bg-[#1C3A27] hover:opacity-90 border border-brand-primary/20 text-[10px] font-black text-[#137333] dark:text-[#81C995] uppercase tracking-widest rounded-xl transition cursor-pointer"
              id="sandbox-anonymous-entry-btn"
            >
              ⚡ Explore Demo Mode
            </button>
          )}

          <div className="text-center pt-2">
            {mode === "login" ? (
              <p className="text-xs font-semibold text-text-secondary">
                New to CarbonMate?{" "}
                <button 
                  type="button" 
                  onClick={() => { setMode("signup"); setMessage(null); }}
                  className="text-brand-primary hover:underline font-bold cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p className="text-xs font-semibold text-[#4F6356] dark:text-[#A8B8AA]">
                Already have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => { setMode("login"); setMessage(null); }}
                  className="text-brand-primary hover:underline font-bold cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
