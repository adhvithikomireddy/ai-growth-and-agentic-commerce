import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { LanguageProvider, useLanguage } from "./context/LanguageContext.js";
import { CartProvider } from "./context/CartContext.js";
import { CustomerNavbar } from "./components/customer/CustomerNavbar.js";
import { AIShoppingView } from "./pages/customer/AIShoppingView.js";
import { CatalogView } from "./pages/customer/CatalogView.js";
import { CartView } from "./pages/customer/CartView.js";
import { OrdersView } from "./pages/customer/OrdersView.js";
import { MerchantPortalView } from "./pages/merchant/MerchantPortalView.js";
import { SpendingControlsModal } from "./components/checkout/SpendingControlsModal.js";
import { AuthModal } from "./components/checkout/AuthModal.js";
import { Product } from "./types/index.js";
import { ProductDetailsModal } from "./components/customer/ProductDetailsModal.js";
import { NegotiationModal } from "./components/customer/NegotiationModal.js";
import { ProductComparisonModal } from "./components/customer/ProductComparisonModal.js";
import { ShieldCheck, Cpu } from "lucide-react";

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>("shop");

  // Modals state
  const [spendingModalOpen, setSpendingModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Cross-view product modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [negotiateProduct, setNegotiateProduct] = useState<Product | null>(null);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  const handleCompareToggle = (product: Product) => {
    if (comparedProducts.some((p) => p.productId === product.productId)) {
      setComparedProducts(comparedProducts.filter((p) => p.productId !== product.productId));
    } else {
      if (comparedProducts.length >= 2) {
        setComparedProducts([comparedProducts[1], product]);
      } else {
        setComparedProducts([...comparedProducts, product]);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F4] text-[#172018]">
      {/* Navigation Header */}
      {currentTab !== "merchant" ? (
        <CustomerNavbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenSpendingControls={() => setSpendingModalOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      ) : null}

      {/* Main View Body */}
      <main className="flex-1">
        {currentTab === "shop" && <AIShoppingView />}
        {currentTab === "catalog" && (
          <CatalogView
            onViewDetails={(p) => setDetailProduct(p)}
            onNegotiate={(p) => setNegotiateProduct(p)}
            onCompareToggle={handleCompareToggle}
            comparedProducts={comparedProducts}
          />
        )}
        {currentTab === "cart" && (
          <CartView
            onExplore={() => setCurrentTab("shop")}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}
        {currentTab === "orders" && <OrdersView />}
        {currentTab === "merchant" && (
          <MerchantPortalView onBackToCustomer={() => setCurrentTab("shop")} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6 px-4 text-center text-xs text-[#667067]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#166534] text-white flex items-center justify-center font-bold text-[10px]">
              N
            </div>
            <span className="font-semibold text-[#172018]">NexCommerce</span>
            <span>• Razorpay Buildathon: AI Growth & Agentic Commerce</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-[#166534]">
              <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Test Mode
            </span>
            <span className="flex items-center gap-1 text-[#166534]">
              <Cpu className="w-3.5 h-3.5" /> A2A Protocol Active
            </span>
            <span>MongoDB Atlas Persistent</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <SpendingControlsModal
        isOpen={spendingModalOpen}
        onClose={() => setSpendingModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <ProductDetailsModal
        product={detailProduct}
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
      />

      <NegotiationModal
        product={negotiateProduct}
        isOpen={Boolean(negotiateProduct)}
        onClose={() => setNegotiateProduct(null)}
      />

      <ProductComparisonModal
        products={comparedProducts}
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        onRemoveFromCompare={(id) => setComparedProducts(comparedProducts.filter((p) => p.productId !== id))}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <MainContent />
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
