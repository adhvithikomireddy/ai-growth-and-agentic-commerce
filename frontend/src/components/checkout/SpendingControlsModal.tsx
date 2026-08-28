import React, { useState } from "react";
import { Shield, Lock, Check } from "lucide-react";
import { Modal } from "../ui/Modal.js";
import { Button } from "../ui/Button.js";
import { Input } from "../ui/Input.js";
import { useAuth } from "../../context/AuthContext.js";

interface SpendingControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpendingControlsModal: React.FC<SpendingControlsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateSpendingLimits } = useAuth();
  const [autonomousLimit, setAutonomousLimit] = useState(
    user?.spendingControls?.autonomousLimit?.toString() || "2000"
  );
  const [maxDailySpend, setMaxDailySpend] = useState(
    user?.spendingControls?.maxDailySpend?.toString() || "100000"
  );
  const [newPin, setNewPin] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateSpendingLimits({
        autonomousLimit: Number(autonomousLimit),
        requirePinAbove: Number(autonomousLimit),
        maxDailySpend: Number(maxDailySpend),
        ...(newPin.length === 4 ? { newPin } : {}),
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Autonomous Spending & Authorization Controls"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-[#DCFCE7]/50 border border-[#BBF7D0] text-xs text-[#166534] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <Shield className="w-4 h-4" />
            <span>Server-Side Financial Guardrails</span>
          </div>
          <p className="leading-relaxed">
            Configure how your Buyer Agent handles checkout. Transactions below your Autonomous Limit can be completed quickly, while larger purchases strictly require your 4-digit PIN.
          </p>
        </div>

        <Input
          label="Autonomous Purchase Limit (₹)"
          type="number"
          value={autonomousLimit}
          onChange={(e) => setAutonomousLimit(e.target.value)}
          helperText="Purchases below this amount do not require transaction PIN."
          required
        />

        <Input
          label="Maximum Daily Spend Cap (₹)"
          type="number"
          value={maxDailySpend}
          onChange={(e) => setMaxDailySpend(e.target.value)}
          helperText="Any transaction exceeding cumulative daily limit is blocked automatically."
          required
        />

        <Input
          label="Change 4-Digit Security PIN"
          type="password"
          maxLength={4}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
          placeholder="Leave blank to keep current PIN"
          helperText="Enter 4 numeric digits to set a new authorization PIN."
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} icon={saved ? <Check className="w-4 h-4 text-white" /> : undefined}>
            {saved ? "Saved Settings!" : "Save Guardrails"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
