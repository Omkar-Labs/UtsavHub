import React, { useState } from "react";
import { collegesList } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loader2, Mail, Lock, KeyRound, ShieldAlert, X } from "lucide-react";

export default function AuthModal({ isOpen, onClose, initialRole = "Student", onLoginSuccess }) {
  const { login, register, sendOtp } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState(initialRole === "Admin" ? "Admin" : "Student");
  const [isSignUp, setIsSignUp] = useState(false);

  // Common Login Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP State
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Sign Up Only Fields (Student)
  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("IET Lucknow");
  const [branch, setBranch] = useState("CSE");
  const [gender, setGender] = useState("Male");
  const [skills, setSkills] = useState("");

  // Sign Up Only Fields (Admin)
  const [adminName, setAdminName] = useState("");
  const [adminCollege, setAdminCollege] = useState("IET Lucknow");
  const [collegeDomain, setCollegeDomain] = useState("ietlucknow.ac.in");
  const [designation, setDesignation] = useState("Faculty Coordinator / Tech Council Head");

  // Status & Error
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle OTP Dispatch
  const handleSendOtp = async () => {
    setErrorMessage("");
    if (!email || !email.trim()) {
      setErrorMessage("Please enter your college email first to receive the OTP.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await sendOtp(email.trim().toLowerCase());
      setOtpSent(true);
      showToast(res.message || "OTP sent to your institutional email", "success", "OTP Dispatched");

      setOtpCountdown(60);
      const timer = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to send OTP";
      setErrorMessage(msg);
      showToast(msg, "error", "OTP Failed");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (!isSignUp) {
        if (!email.trim() || !password.trim()) {
          setErrorMessage("Please enter both email and password.");
          setIsSubmitting(false);
          return;
        }

        const user = await login(email.trim().toLowerCase(), password, role);
        showToast(`Welcome back, ${user.name}!`, "success", "Logged In");
        if (onLoginSuccess) onLoginSuccess(user);
        onClose();
      } else {
        if (!otp.trim()) {
          setErrorMessage("Verification OTP is required. Click 'Send OTP' and check your inbox.");
          setIsSubmitting(false);
          return;
        }

        const payload = {
          name: role === "Student" ? studentName.trim() : adminName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          otp: otp.trim(),
        };

        if (role === "Student") {
          if (!studentName.trim() || !rollNo.trim()) {
            setErrorMessage("Please fill all required student details.");
            setIsSubmitting(false);
            return;
          }
          payload.rollNo = rollNo.trim();
          payload.college = selectedCollege;
          payload.branch = branch;
          payload.gender = gender;
          payload.skills = skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : [];
        } else {
          if (!adminName.trim() || !collegeDomain.trim() || !designation.trim()) {
            setErrorMessage("Please fill all required administrator fields.");
            setIsSubmitting(false);
            return;
          }
          payload.college = adminCollege;
          payload.collegeDomain = collegeDomain.trim().toLowerCase();
          payload.designation = designation.trim();
        }

        const user = await register(payload);
        showToast(`Account successfully created for ${user.name}!`, "success", "Registration Complete");
        if (onLoginSuccess) onLoginSuccess(user);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Authentication failed";
      setErrorMessage(msg);
      showToast(msg, "error", "Auth Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1a1815] border-2 border-[#38332d] rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Retro Header Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff4d2e] via-[#f59e0b] to-[#10b981]"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-[#2c2824] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 sm:mb-6 pt-1 sm:pt-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ff4d2e]/15 border border-[#ff4d2e]/30 text-[#ff4d2e] font-mono text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
              Retro Campus Gate
            </span>
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#fcfaf6] tracking-tight">
            {isSignUp ? `Create ${role} Account` : `Sign In as ${role}`}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            {isSignUp
              ? "Register with your verified college credentials to join events and squad matchmaker."
              : "Enter your registered credentials to access your live portal."}
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-[#131211] rounded-xl sm:rounded-2xl border border-[#2b2723] mb-4 sm:mb-6">
          <button
            type="button"
            onClick={() => {
              setRole("Student");
              setErrorMessage("");
            }}
            className={`py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
              role === "Student" ? "bg-[#ff4d2e] text-white shadow-md" : "text-stone-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm sm:text-base">school</span>
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("Admin");
              setErrorMessage("");
            }}
            className={`py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
              role === "Admin" ? "bg-[#f59e0b] text-stone-950 shadow-md font-extrabold" : "text-stone-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm sm:text-base">admin_panel_settings</span>
            <span>College Admin</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-xs">
          {/* Mode 1: Login */}
          {!isSignUp ? (
            <>
              <div>
                <label className="block font-semibold text-stone-300 mb-1 sm:mb-1.5">
                  {role === "Student" ? "College Student Email" : "Official Faculty / Admin Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === "Student" ? "student@ietlucknow.ac.in" : "admin@ietlucknow.ac.in"}
                    className="w-full bg-[#23201c] border border-[#38332d] rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-white placeholder:text-stone-500 focus:outline-none focus:border-[#ff4d2e] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1 sm:mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#23201c] border border-[#38332d] rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-white placeholder:text-stone-500 focus:outline-none focus:border-[#ff4d2e] transition-colors"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Mode 2: Sign Up */
            <>
              {role === "Student" ? (
                <>
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Omkar Tripathi"
                      className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-3.5 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">College Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="roll@ietlucknow.ac.in"
                        className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-3.5 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">Roll / ID Number *</label>
                      <input
                        type="text"
                        required
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        placeholder="2500520100142"
                        className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-3.5 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e] font-mono"
                      />
                    </div>
                  </div>

                  {/* OTP Row */}
                  <div className="p-2.5 sm:p-3 bg-[#131211] border border-[#38332d] rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-semibold text-stone-300">
                        Email OTP Code *
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || otpCountdown > 0}
                        className="text-[10px] sm:text-[11px] font-bold text-[#ff4d2e] hover:text-[#ff6a50] disabled:text-stone-500 transition-colors flex items-center gap-1"
                      >
                        {isSendingOtp ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : otpCountdown > 0 ? (
                          <span>Resend in {otpCountdown}s</span>
                        ) : otpSent ? (
                          <span>Resend OTP</span>
                        ) : (
                          <span>Send Verification OTP</span>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit OTP code"
                        className="w-full bg-[#23201c] border border-[#38332d] rounded-lg pl-9 pr-3 py-2 text-white font-mono tracking-widest text-sm focus:outline-none focus:border-[#ff4d2e]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">Create Password *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-3.5 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">College</label>
                      <select
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                        className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
                      >
                        {collegesList.map((c) => (
                          <option key={c.id} value={c.name} className="bg-[#1a1815]">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">Department</label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
                      >
                        <option value="CSE" className="bg-[#1a1815]">CSE</option>
                        <option value="IT" className="bg-[#1a1815]">IT</option>
                        <option value="ECE" className="bg-[#1a1815]">ECE</option>
                        <option value="EE" className="bg-[#1a1815]">EE</option>
                        <option value="ME" className="bg-[#1a1815]">ME</option>
                        <option value="CE" className="bg-[#1a1815]">CE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Gender <span className="text-[#f59e0b] font-normal">(Diversity)</span>
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
                      >
                        <option value="Male" className="bg-[#1a1815]">Male</option>
                        <option value="Female" className="bg-[#1a1815]">Female</option>
                        <option value="Other" className="bg-[#1a1815]">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">Skills (Comma-separated)</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. React, Node.js, UI/UX"
                      className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-3.5 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
                    />
                  </div>
                </>
              ) : (
                /* Admin Sign Up */
                <>
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">Faculty / Organizer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Dr. Diksha Sharma"
                      className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-3.5 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">College Name</label>
                      <select
                        value={adminCollege}
                        onChange={(e) => {
                          setAdminCollege(e.target.value);
                          const found = collegesList.find((c) => c.name === e.target.value);
                          if (found) setCollegeDomain(found.domain);
                        }}
                        className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#f59e0b]"
                      >
                        {collegesList.map((c) => (
                          <option key={c.id} value={c.name} className="bg-[#1a1815]">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">College Domain *</label>
                      <input
                        type="text"
                        required
                        value={collegeDomain}
                        onChange={(e) => setCollegeDomain(e.target.value)}
                        placeholder="ietlucknow.ac.in"
                        className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-3.5 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#f59e0b] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">Admin Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={`admin@${collegeDomain}`}
                        className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-3.5 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#f59e0b] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">Create Password *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-3.5 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#f59e0b]"
                      />
                    </div>
                  </div>

                  {/* Admin OTP */}
                  <div className="p-2.5 sm:p-3 bg-[#131211] border border-[#38332d] rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-semibold text-stone-300">
                        Admin Email OTP *
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || otpCountdown > 0}
                        className="text-[10px] sm:text-[11px] font-bold text-[#f59e0b] hover:text-[#fbbf24] disabled:text-stone-500 transition-colors flex items-center gap-1"
                      >
                        {isSendingOtp ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : otpCountdown > 0 ? (
                          <span>Resend in {otpCountdown}s</span>
                        ) : otpSent ? (
                          <span>Resend OTP</span>
                        ) : (
                          <span>Send Verification OTP</span>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit OTP code"
                        className="w-full bg-[#23201c] border border-[#38332d] rounded-lg pl-9 pr-3 py-2 text-white font-mono tracking-widest text-sm focus:outline-none focus:border-[#f59e0b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">Leadership Designation *</label>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Faculty Convener, Tech Council Head"
                      className="w-full bg-[#23201c] border border-[#38332d] rounded-xl px-3.5 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] text-[10px] sm:text-[11px] leading-relaxed">
                    <span className="font-bold">Quota Notice:</span> Maximum 2 Admin accounts permitted per institution domain to prevent unauthorized access.
                  </div>
                </>
              )}
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs tracking-wide shadow-lg transition-all duration-200 mt-2 flex items-center justify-center gap-2 ${
              role === "Student"
                ? "bg-[#ff4d2e] hover:bg-[#e63d1e] text-white disabled:opacity-50"
                : "bg-[#f59e0b] hover:bg-[#d97706] text-stone-950 font-extrabold disabled:opacity-50"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isSignUp ? (
              `Complete ${role} Registration`
            ) : (
              `Sign In to ${role} Portal`
            )}
          </button>
        </form>

        {/* Switch Sign In / Up */}
        <div className="mt-4 sm:mt-5 text-center pt-3 border-t border-[#2b2723]">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage("");
            }}
            className="text-xs text-stone-400 hover:text-white transition-colors"
          >
            {isSignUp ? (
              <span>
                Already registered?{" "}
                <strong className="text-[#ff4d2e] underline underline-offset-2">
                  Sign In with Email &amp; Password
                </strong>
              </span>
            ) : (
              <span>
                New student or organizer?{" "}
                <strong className="text-[#ff4d2e] underline underline-offset-2">
                  Create New Account
                </strong>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
