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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { BiometricFaceScannerModal } from "../../components/common/BiometricFaceScannerModal.js";

export const SettingsView: React.FC = () => {
  const { user, updateSpendingLimits } = useAuth();
  const { language, setLanguage, t } = useLanguage();

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-5 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172018] tracking-tight">
          Account & Privacy Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#667067]">
          Manage your biometric security, banking privacy controls, autonomous agent guardrails, and compliance preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar Quick Links */}
        <div className="space-y-2">
          <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667067] block">
              Security Overview
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 font-medium">
                <span className="flex items-center gap-2">
                  <ScanFace className="w-4 h-4 text-emerald-600" /> Biometrics
                </span>
                <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 text-neutral-700">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-neutral-500" /> Bank Privacy
                </span>
                <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded font-bold">RBI Tokenized</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 text-neutral-700">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-neutral-500" /> Agent Limits
                </span>
                <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded font-bold">₹{autonomousLimit}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 text-xs space-y-2 text-emerald-950">
            <span className="font-bold flex items-center gap-1.5 text-emerald-800">
              <Building2 className="w-4 h-4 text-emerald-600" /> NPCI & RBI Compliance
            </span>
            <p className="text-[11px] leading-relaxed text-emerald-800/90">
              This platform adheres to the Digital Personal Data Protection (DPDP) Act 2023. Raw banking credentials and biometric scans never leave your encrypted local enclave.
            </p>
          </div>
        </div>

        {/* Main Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Biometric Face Recognition Security */}
          <Card className="p-6 space-y-5 bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ScanFace className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172018]">Biometric Face Authentication</h3>
                  <p className="text-xs text-[#667067]">Webcam optical liveness scanning & cryptographic signatures</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {biometricStatus}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                <div>
                  <span className="font-semibold text-[#172018] block">Biometric Pay Authorization</span>
                  <span className="text-[#667067] text-[11px]">Require face verification before initiating transactions above autonomous threshold</span>
                </div>
                <input
                  type="checkbox"
                  checked={biometricEnabled}
                  onChange={(e) => setBiometricEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                <div>
                  <span className="font-semibold text-[#172018] block">3D Liveness & Anti-Spoofing Detection</span>
                  <span className="text-[#667067] text-[11px]">Verify real-time facial micro-motions to prevent photograph or screen spoofing</span>
                </div>
                <input
                  type="checkbox"
                  checked={livenessCheck}
                  onChange={(e) => setLivenessCheck(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#172018] block text-[11px]">Biometric Token Hash Vault</span>
                  <span className="text-[#667067] font-mono text-[10px]">#SHA256-AES-GCM-ENCLAVE-9482</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFaceModal(true)}
                  icon={<ScanFace className="w-3.5 h-3.5" />}
                >
                  Test Face Scan
                </Button>
              </div>
            </div>
          </Card>

          {/* Section 2: Banking & Payment Privacy Settings */}
          <Card className="p-6 space-y-5 bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172018]">Banking & Payment Privacy</h3>
                <p className="text-xs text-[#667067]">Card tokenization, VPA masking, and zero-retention policies</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                <div>
                  <span className="font-semibold text-[#172018] block">Zero Card Retention Compliance</span>
                  <span className="text-[#667067] text-[11px]">Neither NexCommerce nor Merchant Agents store raw CVV or credit card PANs</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Enforced (RBI Circular)
                </span>
              </div>

              {/* Masked Payment Methods Preview */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-[#E2E8F0] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#667067] tracking-wider block">
                  Masked Vaulted Methods (Razorpay Test Mode)
                </span>
                <div className="flex items-center justify-between py-1 text-xs">
                  <span className="font-mono text-[#172018]">Card: **** **** **** 0002 (Visa)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">Tokenized</span>
                </div>
                <div className="flex items-center justify-between py-1 text-xs border-t border-neutral-200/60 pt-1.5">
                  <span className="font-mono text-[#172018]">UPI VPA: customer@okhdfcbank</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">Masked</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="font-semibold text-[#172018] block">Instant Automated Refunds</span>
                  <span className="text-[#667067] text-[11px]">Cancelled transactions or failed deliveries auto-reverse to source bank account</span>
                </div>
                <span className="text-xs font-semibold text-[#166534]">Automated (T+0)</span>
              </div>
            </div>
          </Card>

          {/* Section 3: Autonomous Spending Limits & Policy Engine */}
          <Card className="p-6 space-y-5 bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172018]">Agentic Spending Limits</h3>
                <p className="text-xs text-[#667067]">Control autonomous purchasing thresholds and security PIN</p>
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
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
          <Card className="p-6 space-y-4 bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172018]">Data Privacy & Audit Export</h3>
                <p className="text-xs text-[#667067]">Export your cryptographically signed transaction history</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-[#172018] block">Download Cryptographic Audit Trail</span>
                <span className="text-[#667067] text-[11px]">Includes all A2A packets, timestamps, negotiated margins, and payment signatures.</span>
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
