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
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-[#E4E2DD] rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-xl relative max-h-[92vh] overflow-y-auto text-[#18181B]">
        {/* Header Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E11D48] to-[#F43F5E]"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 sm:mb-6 pt-1 sm:pt-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFE4E6] border border-[#FECDD3] text-[#E11D48] font-mono text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
              Collegiate Campus Gate
            </span>
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight">
            {isSignUp ? `Create ${role} Account` : `Sign In as ${role}`}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {isSignUp
              ? "Register with your verified college credentials to join events and squad matchmaker."
              : "Enter your registered credentials to access your live portal."}
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-[#F3F1EC] rounded-xl sm:rounded-2xl border border-[#E4E2DD] mb-4 sm:mb-6">
          <button
            type="button"
            onClick={() => {
              setRole("Student");
              setErrorMessage("");
            }}
            className={`py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
              role === "Student" ? "bg-[#E11D48] text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"
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
              role === "Admin" ? "bg-[#18181B] text-white shadow-sm font-extrabold" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <span className="material-symbols-outlined text-sm sm:text-base">admin_panel_settings</span>
            <span>College Admin</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#FFE4E6] border border-[#FECDD3] text-[#BE123C] text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#E11D48]" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-xs">
          {/* Mode 1: Login */}
          {!isSignUp ? (
            <>
              <div>
                <label className="block font-semibold text-zinc-700 mb-1 sm:mb-1.5">
                  {role === "Student" ? "College Student Email" : "Official Faculty / Admin Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === "Student" ? "student@collegename.ac.in" : "admin@collegename.ac.in"}
                    className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1 sm:mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
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
                    <label className="block font-semibold text-zinc-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-3.5 py-2 sm:py-2.5 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">College Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="roll@ietlucknow.ac.in"
                        className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-3.5 py-2 sm:py-2.5 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Roll / ID Number *</label>
                      <input
                        type="text"
                        required
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        placeholder="Enter your roll/ID number"
                        className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-3.5 py-2 sm:py-2.5 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] font-mono"
                      />
                    </div>
                  </div>

                  {/* OTP Row */}
                  <div className="p-2.5 sm:p-3 bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-semibold text-zinc-700">
                        Email OTP Code *
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || otpCountdown > 0}
                        className="text-[10px] sm:text-[11px] font-bold text-[#E11D48] hover:text-[#BE123C] disabled:text-zinc-400 transition-colors flex items-center gap-1"
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
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit OTP code"
                        className="w-full bg-white border border-[#E4E2DD] rounded-lg pl-9 pr-3 py-2 text-[#18181B] font-mono tracking-widest text-sm focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Create Password *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-3.5 py-2 sm:py-2.5 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">College</label>
                      <select
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-[#18181B] focus:outline-none focus:border-[#E11D48]"
                      >
                        {collegesList.map((c) => (
                          <option key={c.id} value={c.name} className="bg-white text-zinc-900">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Department</label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-[#18181B] focus:outline-none focus:border-[#E11D48]"
                      >
                        <option value="CSE" className="bg-white text-zinc-900">CSE</option>
                        <option value="IT" className="bg-white text-zinc-900">IT</option>
                        <option value="ECE" className="bg-white text-zinc-900">ECE</option>
                        <option value="EE" className="bg-white text-zinc-900">EE</option>
                        <option value="ME" className="bg-white text-zinc-900">ME</option>
                        <option value="CE" className="bg-white text-zinc-900">CE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">
                        Gender <span className="text-[#C2410C] font-normal">(Diversity)</span>
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-[#18181B] focus:outline-none focus:border-[#E11D48]"
                      >
                        <option value="Male" className="bg-white text-zinc-900">Male</option>
                        <option value="Female" className="bg-white text-zinc-900">Female</option>
                        <option value="Other" className="bg-white text-zinc-900">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Skills (Comma-separated)</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. React, Node.js, UI/UX"
                      className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-3.5 py-2 sm:py-2.5 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                    />
                  </div>
                </>
              ) : (
                /* Admin Sign Up */
                <>
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Faculty / Organizer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-3.5 py-2 sm:py-2.5 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">College Name</label>
                      <select
                        value={adminCollege}
                        onChange={(e) => {
                          setAdminCollege(e.target.value);
                          const found = collegesList.find((c) => c.name === e.target.value);
                          if (found) setCollegeDomain(found.domain);
                        }}
                        className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-[#18181B] focus:outline-none focus:border-[#E11D48]"
                      >
                        {collegesList.map((c) => (
                          <option key={c.id} value={c.name} className="bg-white text-zinc-900">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">College Domain *</label>
                      <input
                        type="text"
                        required
                        value={collegeDomain}
                        onChange={(e) => setCollegeDomain(e.target.value)}
                        placeholder="ietlucknow.ac.in"
                        className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-3.5 py-2 sm:py-2.5 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Admin Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={`admin@${collegeDomain}`}
                        className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-3.5 py-2 sm:py-2.5 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Create Password *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-3.5 py-2 sm:py-2.5 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                      />
                    </div>
                  </div>

                  {/* Admin OTP */}
                  <div className="p-2.5 sm:p-3 bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-semibold text-zinc-700">
                        Admin Email OTP *
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || otpCountdown > 0}
                        className="text-[10px] sm:text-[11px] font-bold text-[#E11D48] hover:text-[#BE123C] disabled:text-zinc-400 transition-colors flex items-center gap-1"
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
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit OTP code"
                        className="w-full bg-white border border-[#E4E2DD] rounded-lg pl-9 pr-3 py-2 text-[#18181B] font-mono tracking-widest text-sm focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Leadership Designation *</label>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Faculty Convener, Tech Council Head"
                      className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl px-3.5 py-2 sm:py-2.5 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                    />
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] text-[10px] sm:text-[11px] leading-relaxed">
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
            className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs tracking-wide shadow-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2 ${
              role === "Student"
                ? "bg-[#E11D48] hover:bg-[#BE123C] text-white disabled:opacity-50"
                : "bg-[#18181B] hover:bg-zinc-800 text-white font-extrabold disabled:opacity-50"
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
        <div className="mt-4 sm:mt-5 text-center pt-3 border-t border-[#E4E2DD]">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage("");
            }}
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {isSignUp ? (
              <span>
                Already registered?{" "}
                <strong className="text-[#E11D48] underline underline-offset-2">
                  Sign In with Email &amp; Password
                </strong>
              </span>
            ) : (
              <span>
                New student or organizer?{" "}
                <strong className="text-[#E11D48] underline underline-offset-2">
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
