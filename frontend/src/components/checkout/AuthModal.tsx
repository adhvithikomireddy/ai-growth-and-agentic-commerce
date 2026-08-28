import React, { useState } from "react";
import { User as UserIcon, Lock, Mail, Store, AlertCircle } from "lucide-react";
import { Modal } from "../ui/Modal.js";
import { Button } from "../ui/Button.js";
import { Input } from "../ui/Input.js";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage, SupportedLanguage } from "../../context/LanguageContext.js";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup } = useAuth();
  const { language } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "MERCHANT">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await signup({ email, password, name, role, language });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoCustomer = () => {
    setEmail("customer@gmail.com");
    setPassword("password123");
  };

  const handleQuickDemoMerchant = () => {
    setEmail("merchant@apexnova.store");
    setPassword("password123");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLogin ? "Sign In to NexCommerce" : "Create Your Account"}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Login / Signup */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isLogin ? "bg-white text-[#172018] shadow-xs" : "text-[#667067] hover:text-[#172018]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              !isLogin ? "bg-white text-[#172018] shadow-xs" : "text-[#667067] hover:text-[#172018]"
            }`}
          >
            Create Account
          </button>
        </div>

        {!isLogin && (
          <>
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
            />

            <div>
              <label className="block text-xs font-medium text-[#475548] mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("CUSTOMER")}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 ${
                    role === "CUSTOMER"
                      ? "border-[#166534] bg-[#DCFCE7] text-[#166534]"
                      : "border-[#E2E8F0] text-[#475548]"
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" /> Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("MERCHANT")}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 ${
                    role === "MERCHANT"
                      ? "border-[#166534] bg-[#DCFCE7] text-[#166534]"
                      : "border-[#E2E8F0] text-[#475548]"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" /> Merchant
                </button>
              </div>
            </div>
          </>
        )}

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 p-2.5 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button variant="primary" type="submit" loading={loading} className="w-full">
          {isLogin ? "Sign In" : "Register Account"}
        </Button>

        {/* Demo Fast Login Helpers */}
        <div className="pt-3 border-t border-[#E2E8F0] text-center space-y-1.5">
          <span className="text-[11px] text-[#667067] block">Quick Demo Credentials:</span>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={handleQuickDemoCustomer}
              className="text-[11px] px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-[#475548]"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={handleQuickDemoMerchant}
              className="text-[11px] px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-[#475548]"
            >
              Demo Merchant
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
