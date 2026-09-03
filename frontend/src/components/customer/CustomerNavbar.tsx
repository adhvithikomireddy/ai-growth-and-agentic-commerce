import React, { useState } from "react";
import { ShoppingBag, Sparkles, User as UserIcon, Shield, Globe, LogOut, Store, FileText, Settings, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useCart } from "../../context/CartContext.js";
import { useLanguage, SupportedLanguage } from "../../context/LanguageContext.js";
import { useTheme } from "../../context/ThemeContext.js";
import { Button } from "../ui/Button.js";
import { Badge } from "../ui/Badge.js";

interface CustomerNavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSpendingControls: () => void;
  onOpenAuth: () => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSpendingControls,
  onOpenAuth,
}) => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages: Array<{ code: SupportedLanguage; label: string }> = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "te", label: "తెలుగు" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab("shop")}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#166534] dark:bg-[#22C55E] flex items-center justify-center text-white shadow-xs group-hover:bg-[#14532D] transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-[#172018] dark:text-white block leading-none">
                  {t("brand_name")}
                </span>
                <span className="text-[10px] text-[#667067] dark:text-slate-400 font-medium tracking-wide uppercase">
                  Autonomous Commerce
                </span>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCurrentTab("shop")}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === "shop"
                    ? "bg-[#DCFCE7] dark:bg-[#14532D]/40 text-[#166534] dark:text-[#4ADE80]"
                    : "text-[#475548] dark:text-slate-300 hover:text-[#172018] dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-slate-800/60"
                }`}
              >
                {t("nav_shop")}
              </button>
              <button
                onClick={() => setCurrentTab("catalog")}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === "catalog"
                    ? "bg-[#DCFCE7] dark:bg-[#14532D]/40 text-[#166534] dark:text-[#4ADE80]"
                    : "text-[#475548] dark:text-slate-300 hover:text-[#172018] dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-slate-800/60"
                }`}
              >
                {t("nav_catalog")}
              </button>
              {user && (
                <button
                  onClick={() => setCurrentTab("orders")}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === "orders"
                      ? "bg-[#DCFCE7] dark:bg-[#14532D]/40 text-[#166534] dark:text-[#4ADE80]"
                      : "text-[#475548] dark:text-slate-300 hover:text-[#172018] dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {t("nav_orders")}
                </button>
              )}
              <button
                onClick={() => setCurrentTab("settings")}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === "settings"
                    ? "bg-[#DCFCE7] dark:bg-[#14532D]/40 text-[#166534] dark:text-[#4ADE80]"
                    : "text-[#475548] dark:text-slate-300 hover:text-[#172018] dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Privacy & Settings</span>
              </button>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* Theme Mode Toggle (Sun/Moon) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-[#172018] dark:text-amber-400 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-xs font-medium text-[#475548] dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ADE80]" />
                <span>{languages.find(l => l.code === language)?.label}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 rounded-xl border border-[#E2E8F0] dark:border-slate-800 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                        language === lang.code
                          ? "bg-[#DCFCE7] dark:bg-[#14532D]/40 text-[#166534] dark:text-[#4ADE80] font-semibold"
                          : "text-[#475548] dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {lang.label}
                      {language === lang.code && <span className="text-[#166534] dark:text-[#4ADE80]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Spending Controls Pill */}
            {user && (
              <button
                onClick={onOpenSpendingControls}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 hover:border-[#166534]/50 transition-colors"
                title="Autonomous Spending Limit & PIN Controls"
              >
                <Shield className="w-3.5 h-3.5 text-[#166534] dark:text-[#4ADE80]" />
                <span className="text-xs text-[#475548] dark:text-slate-300">
                  Auto-Limit: <strong className="text-[#172018] dark:text-white">₹{user.spendingControls?.autonomousLimit?.toLocaleString("en-IN")}</strong>
                </span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setCurrentTab("cart")}
              className="relative p-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-[#172018] dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#166534] dark:bg-[#22C55E] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Merchant Portal Switch */}
            <Button
              variant="soft"
              size="sm"
              icon={<Store className="w-3.5 h-3.5" />}
              onClick={() => setCurrentTab("merchant")}
              className="hidden lg:inline-flex"
            >
              {t("nav_merchant_portal")}
            </Button>

            {/* Auth / Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <span className="block text-xs font-semibold text-[#172018] dark:text-white truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="block text-[10px] text-[#667067] dark:text-slate-400 uppercase font-mono">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-[#667067] dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title={t("nav_logout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button size="sm" variant="primary" onClick={onOpenAuth}>
                {t("nav_login")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
