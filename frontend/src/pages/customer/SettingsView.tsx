import React, { useState } from "react";
import {
  Shield,
  Lock,
  ScanFace,
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Globe,
  Sliders,
  Check,
  Building2,
  Key,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { useTheme } from "../../context/ThemeContext.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { BiometricFaceScannerModal } from "../../components/common/BiometricFaceScannerModal.js";

export const SettingsView: React.FC = () => {
  const { user, updateSpendingLimits } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();

  // Biometric state
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [livenessCheck, setLivenessCheck] = useState(true);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState("Enrolled & Active (99.4% Match)");

  // Bank & Payment Privacy state
  const [zeroRetention, setZeroRetention] = useState(true);
  const [requirePinAboveLimit, setRequirePinAboveLimit] = useState(true);
  const [shareBudgetWithAgents, setShareBudgetWithAgents] = useState(false);

  // Spending limits
  const [autonomousLimit, setAutonomousLimit] = useState(
    user?.spendingControls?.autonomousLimit?.toString() || "2000"
  );
  const [maxDailySpend, setMaxDailySpend] = useState(
    user?.spendingControls?.maxDailySpend?.toString() || "100000"
  );
  const [newPin, setNewPin] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSpendingLimits({
        autonomousLimit: Number(autonomousLimit),
        requirePinAbove: Number(autonomousLimit),
        maxDailySpend: Number(maxDailySpend),
        ...(newPin.length === 4 ? { newPin } : {}),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      // Handled
    }
  };

  const handleDownloadAuditLog = () => {
    const auditData = {
      user: user?.email || "customer@example.com",
      exportedAt: new Date().toISOString(),
      securityStandards: ["DPDP Act 2023", "RBI Tokenization Circular 2022", "NPCI UAP Compatible"],
      biometrics: {
        enrolled: true,
        livenessCheck: true,
        lastVerificationToken: "BIO_PASS_ENCRYPTED_VAULT",
      },
      paymentPrivacy: {
        zeroCardRetention: true,
        maskedVPA: "customer@okhdfcbank",
        maskedCard: "**** **** **** 0002",
      },
      spendingGuardrails: {
        autonomousLimit: Number(autonomousLimit),
        maxDailySpend: Number(maxDailySpend),
      },
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `privacy-audit-ledger-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] dark:border-slate-800 pb-5 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172018] dark:text-white tracking-tight">
          Account & Privacy Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#667067] dark:text-slate-400">
          Manage your biometric security, banking privacy controls, autonomous agent guardrails, and theme appearance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar Quick Links */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 shadow-xs space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667067] dark:text-slate-400 block">
              Security Overview
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium">
                <span className="flex items-center gap-2">
                  <ScanFace className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Biometrics
                </span>
                <span className="text-[10px] bg-emerald-200/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-slate-800/60 text-neutral-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-neutral-500 dark:text-slate-400" /> Bank Privacy
                </span>
                <span className="text-[10px] bg-neutral-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold">RBI Tokenized</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-slate-800/60 text-neutral-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-neutral-500 dark:text-slate-400" /> Agent Limits
                </span>
                <span className="text-[10px] bg-neutral-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold">₹{autonomousLimit}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-2 text-emerald-950 dark:text-emerald-200">
            <span className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> NPCI & RBI Compliance
            </span>
            <p className="text-[11px] text-[#475548] dark:text-slate-300 leading-relaxed">
              Your autonomous agent operates strictly under zero-card-retention policies and client-side device biometric tokenization.
            </p>
          </div>
        </div>

        {/* Main Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 0: Appearance & Theme Preferences */}
          <Card className="p-6 space-y-4 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172018] dark:text-white">Appearance & Theme</h3>
                <p className="text-xs text-[#667067] dark:text-slate-400">Choose between clean Light Mode or high-contrast Dark Mode</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                  theme === "light"
                    ? "border-[#166534] bg-emerald-50/50 ring-2 ring-[#166534]/20"
                    : "border-[#E2E8F0] dark:border-slate-700 hover:bg-neutral-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#172018] dark:text-white block">Light Mode</span>
                  <span className="text-[10px] text-[#667067] dark:text-slate-400">Clean Emerald Crisp</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                  theme === "dark"
                    ? "border-[#22C55E] bg-slate-900 ring-2 ring-[#22C55E]/30"
                    : "border-[#E2E8F0] dark:border-slate-700 hover:bg-neutral-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#172018] dark:text-white block">Dark Mode</span>
                  <span className="text-[10px] text-[#667067] dark:text-slate-400">Deep Slate & Glow</span>
                </div>
              </button>
            </div>
          </Card>

          {/* Section 1: Biometric & Liveness Verification */}
          <Card className="p-6 space-y-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
                <ScanFace className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172018] dark:text-white">Biometric Face ID & Liveness</h3>
                <p className="text-xs text-[#667067] dark:text-slate-400">Zero-knowledge facial verification for high-value autonomous purchases</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700">
                <div className="space-y-0.5">
                  <span className="font-semibold text-[#172018] dark:text-white block">Biometric Enrollment Status</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">{biometricStatus}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFaceModal(true)}
                  icon={<ScanFace className="w-3.5 h-3.5" />}
                >
                  Test Scanner
                </Button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-[#172018] dark:text-white block">Live Optical Blinking & Depth Check</span>
                  <span className="text-[#667067] dark:text-slate-400 text-[11px]">Detects real human presence to prevent photo or video spoofing</span>
                </div>
                <input
                  type="checkbox"
                  checked={livenessCheck}
                  onChange={(e) => setLivenessCheck(e.target.checked)}
                  className="w-4 h-4 accent-[#166534] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="font-semibold text-[#172018] dark:text-white block">Require Biometric Above Spending Limit</span>
                  <span className="text-[#667067] dark:text-slate-400 text-[11px]">Triggers 3D facial scan when order exceeds autonomous threshold</span>
                </div>
                <input
                  type="checkbox"
                  checked={biometricEnabled}
                  onChange={(e) => setBiometricEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#166534] rounded cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Bank & Payment Privacy */}
          <Card className="p-6 space-y-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172018] dark:text-white">Bank Privacy & Zero-Retention Vault</h3>
                <p className="text-xs text-[#667067] dark:text-slate-400">Strict isolation of financial identifiers according to DPDP Act 2023</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-[#172018] dark:text-white block">Zero Raw Card / Account Retention</span>
                  <span className="text-[#667067] dark:text-slate-400 text-[11px]">Card details never touch backend servers; tokenized via Razorpay</span>
                </div>
                <span className="text-xs font-semibold text-[#166534] dark:text-emerald-400">Enforced (Always On)</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-[#172018] dark:text-white block">UPI VPA Identity Masking</span>
                  <span className="text-[#667067] dark:text-slate-400 text-[11px]">Merchant receives only pseudo-identifiers (`****@okhdfcbank`)</span>
                </div>
                <span className="text-xs font-semibold text-[#166534] dark:text-emerald-400">Masked</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="font-semibold text-[#172018] dark:text-white block">Instant Automated Refunds</span>
                  <span className="text-[#667067] dark:text-slate-400 text-[11px]">Cancelled transactions or failed deliveries auto-reverse to source bank account</span>
                </div>
                <span className="text-xs font-semibold text-[#166534] dark:text-emerald-400">Automated (T+0)</span>
              </div>
            </div>
          </Card>

          {/* Section 3: Autonomous Spending Limits & Policy Engine */}
          <Card className="p-6 space-y-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172018] dark:text-white">Agentic Spending Limits</h3>
                <p className="text-xs text-[#667067] dark:text-slate-400">Control autonomous purchasing thresholds and security PIN</p>
              </div>
            </div>

            <form onSubmit={handleSaveLimits} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Autonomous Purchase Limit (₹)"
                  type="number"
                  value={autonomousLimit}
                  onChange={(e) => setAutonomousLimit(e.target.value)}
                  helperText="Purchases below this amount do not prompt for PIN."
                  required
                />

                <Input
                  label="Maximum Daily Spend Cap (₹)"
                  type="number"
                  value={maxDailySpend}
                  onChange={(e) => setMaxDailySpend(e.target.value)}
                  helperText="Total cumulative daily spend ceiling."
                  required
                />
              </div>

              <Input
                label="Update 4-Digit Security PIN"
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Leave blank to keep current PIN"
                helperText="Enter 4 numeric digits to update your transaction authorization PIN."
              />

              <div className="flex items-center justify-between pt-2">
                {savedSuccess && (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Guardrails successfully saved!
                  </span>
                )}
                <Button type="submit" variant="primary" size="sm" className="ml-auto">
                  Save Financial Limits
                </Button>
              </div>
            </form>
          </Card>

          {/* Section 4: Data Privacy & Audit Ledger */}
          <Card className="p-6 space-y-4 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172018] dark:text-white">Data Privacy & Audit Export</h3>
                <p className="text-xs text-[#667067] dark:text-slate-400">Export your cryptographically signed transaction history</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-[#172018] dark:text-white block">Download Cryptographic Audit Trail</span>
                <span className="text-[#667067] dark:text-slate-400 text-[11px]">Includes all A2A packets, timestamps, negotiated margins, and payment signatures.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAuditLog}
                icon={<Download className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
              >
                Export JSON Ledger
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Biometric Face Modal for Testing */}
      <BiometricFaceScannerModal
        isOpen={showFaceModal}
        onClose={() => setShowFaceModal(false)}
        onVerified={(token) => {
          setBiometricStatus("Verified: Token #" + token.substring(9, 16));
          setShowFaceModal(false);
        }}
        actionTitle="Biometric Verification Test"
      />
    </div>
  );
};
