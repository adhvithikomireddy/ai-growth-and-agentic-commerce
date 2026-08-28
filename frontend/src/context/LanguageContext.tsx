import React, { createContext, useContext, useState, useEffect } from "react";

export type SupportedLanguage = "en" | "hi" | "te";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    brand_name: "NexCommerce",
    tagline: "AI Growth & Agentic Commerce",
    nav_shop: "AI Shopping",
    nav_catalog: "Browse Catalog",
    nav_orders: "Orders",
    nav_cart: "Cart",
    nav_login: "Sign In",
    nav_logout: "Sign Out",
    nav_merchant_portal: "Merchant Operations",
    search_placeholder: "Ask AI in English, Hindi, or Telugu (e.g., 'Laptop under ₹70,000 for programming')",
    ask_ai_button: "Ask Buyer Agent",
    trending_title: "Trending in Catalog",
    recommendations_title: "Recommended for You",
    view_details: "View Details",
    add_to_cart: "Add to Cart",
    negotiate_price: "Negotiate Price",
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    ai_pick: "AI Verified Pick",
    specs: "Key Specifications",
    related_accessories: "Recommended Complementary Items",
    cart_title: "Your Shopping Cart",
    cart_empty: "Your cart is currently empty.",
    subtotal: "Subtotal",
    discount: "Agentic Savings",
    total: "Total Payable",
    proceed_to_checkout: "Proceed to Checkout",
    spending_limit_notice: "Autonomous Spending Limit",
    pin_required_notice: "Transaction PIN Authorization Required",
    authorize_purchase: "Authorize Purchase",
    cancel: "Cancel",
    enter_pin: "Enter 4-Digit Security PIN",
    payment_title: "Secure Checkout (Razorpay Test Mode)",
    verifying_payment: "Verifying Cryptographic Signature...",
    order_success: "Payment Verified & Order Confirmed!",
    view_receipt: "View & Print Receipt",
    draft_message_title: "AI Notification Draft (Multilingual)",
    copy_message: "Copy Draft",
  },
  hi: {
    brand_name: "नेक्सकॉमर्स",
    tagline: "एआई ग्रोथ और एजेंटिक कॉमर्स",
    nav_shop: "एआई शॉपिंग",
    nav_catalog: "कैटलॉग देखें",
    nav_orders: "मेरे ऑर्डर्स",
    nav_cart: "कार्ट",
    nav_login: "लॉग इन",
    nav_logout: "लॉग आउट",
    nav_merchant_portal: "मर्चेंट ऑपरेशन्स",
    search_placeholder: "हिंदी, तेलुगु या अंग्रेजी में पूछें (जैसे: '₹30,000 के अंदर अच्छा कैमरा वाला फोन')",
    ask_ai_button: "बायर एजेंट से पूछें",
    trending_title: "लोकप्रिय और ट्रेंडिंग उत्पाद",
    recommendations_title: "आपके लिए अनुशंसित",
    view_details: "विवरण देखें",
    add_to_cart: "कार्ट में जोड़ें",
    negotiate_price: "कीमत पर मोलभाव करें",
    in_stock: "उपलब्ध है",
    low_stock: "सीमित स्टॉक",
    out_of_stock: "स्टॉक खत्म",
    ai_pick: "एआई सत्यापित चयन",
    specs: "प्रमुख विनिर्देश",
    related_accessories: "साथ में उपयोगी सामान",
    cart_title: "आपकी शॉपिंग कार्ट",
    cart_empty: "आपकी कार्ट अभी खाली है।",
    subtotal: "उप-योग",
    discount: "एजेंटिक बचत",
    total: "कुल देय राशि",
    proceed_to_checkout: "चेकआउट करें",
    spending_limit_notice: "स्वायत्त खर्च सीमा",
    pin_required_notice: "लेनदेन पिन प्रमाणीकरण आवश्यक है",
    authorize_purchase: "खरीदारी अधिकृत करें",
    cancel: "रद्द करें",
    enter_pin: "4-अंकों का सुरक्षा पिन दर्ज करें",
    payment_title: "सुरक्षित भुगतान (रेज़रपे टेस्ट मोड)",
    verifying_payment: "भुगतान हस्ताक्षर सत्यापित हो रहा है...",
    order_success: "भुगतान सत्यापित और ऑर्डर कन्फर्म!",
    view_receipt: "रसीद देखें व प्रिंट करें",
    draft_message_title: "एआई संदेश ड्राफ्ट",
    copy_message: "ड्राफ्ट कॉपी करें",
  },
  te: {
    brand_name: "నెక్స్‌కామర్స్",
    tagline: "ఏఐ గ్రోత్ & ఏజెంటిక్ కామర్స్",
    nav_shop: "ఏఐ షాపింగ్",
    nav_catalog: "కేటలాగ్ బ్రౌజ్ చేయండి",
    nav_orders: "నా ఆర్డర్లు",
    nav_cart: "కార్ట్",
    nav_login: "లాగిన్",
    nav_logout: "లాగ్ అవుట్",
    nav_merchant_portal: "మర్చెంట్ పోర్టల్",
    search_placeholder: "తెలుగు, హిందీ లేదా ఇంగ్లీషులో అడగండి (ఉదా: '₹70,000 లోపు ప్రోగ్రామింగ్ కోసం లాప్‌టాప్')",
    ask_ai_button: "బయర్ ఏజెంట్‌ను అడగండి",
    trending_title: "కేటలాగ్‌లో ట్రెండింగ్ ఉత్పత్తులు",
    recommendations_title: "మీ కోసం సిఫార్సు చేసినవి",
    view_details: "వివరాలు చూడండి",
    add_to_cart: "కార్ట్‌కు జోడించు",
    negotiate_price: "మంచి ధర అడగండి",
    in_stock: "అందుబాటులో ఉంది",
    low_stock: "తక్కువ స్టాక్",
    out_of_stock: "స్టాక్ లేదు",
    ai_pick: "ఏఐ వెరిఫైడ్ పిక్",
    specs: "ముఖ్యమైన స్పెసిఫికేషన్లు",
    related_accessories: "సరిపోయే అదనపు ఉపకరణాలు",
    cart_title: "మీ షాపింగ్ కార్ట్",
    cart_empty: "మీ కార్ట్ ప్రస్తుతం ఖాళీగా ఉంది.",
    subtotal: "ఉప మొత్తం",
    discount: "ఏజెంట్ ఆదా",
    total: "మొత్తం చెల్లించవలసినది",
    proceed_to_checkout: "చెక్‌అవుట్‌కు వెళ్లండి",
    spending_limit_notice: "స్వయంప్రతిపత్తి వ్యయ పరిమితి",
    pin_required_notice: "సెక్యూరిటీ పిన్ అనుమతి అవసరం",
    authorize_purchase: "కొనుగోలును ఆమోదించండి",
    cancel: "రద్దు చేయండి",
    enter_pin: "4-అంకెల సెక్యూరిటీ పిన్ నమోదు చేయండి",
    payment_title: "సురక్షిత చెల్లింపు (రేజర్‌పే టెస్ట్ మోడ్)",
    verifying_payment: "చెల్లింపు సంతకాన్ని ధృవీకరిస్తోంది...",
    order_success: "చెల్లింపు ధృవీకరించబడింది & ఆర్డర్ పూర్తయింది!",
    view_receipt: "రసీదు చూడండి & ప్రింట్ చేయండి",
    draft_message_title: "ఏఐ ధృవీకరణ సందేశం",
    copy_message: "కాపీ చేయండి",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (k) => k,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem("app_lang") as SupportedLanguage) || "en";
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
