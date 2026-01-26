import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      home: 'Home',
      analytics: 'Analytics',
      users: 'Users',
      add_greetings: 'Add Greetings',
      add_product: 'Add Product',
      update_price: 'Update Price',
      update_images: 'Update Images',
      cancel: 'Cancel',
      save: 'Save',
      signin: 'Sign In',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      price: 'Price',
      category: 'Category',
      description: 'Description',
      greeting: 'Greeting',
      profile: 'Profile',
      logout: 'Logout',
      market_analytics: 'Market Analytics',
      select_product: 'Select Product',
      price_movement_chart: 'Price Movement Chart',
      price_history: 'Price History',
      analytics_insights: 'Analytics Insights',
      update_product_price: 'Update Product Price',
      add_greeting: 'Add Greeting',
      delete: 'Delete',
      close: 'Close',
    }
  },
  hi: {
    translation: {
      home: 'होम',
      analytics: 'एनालिटिक्स',
      users: 'उपयोगकर्ता',
      add_greetings: 'शुभकामनाएँ जोड़ें',
      add_product: 'उत्पाद जोड़ें',
      update_price: 'मूल्य अपडेट करें',
      update_images: 'छवियाँ अपडेट करें',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      signin: 'साइन इन',
      signup: 'साइन अप',
      email: 'ईमेल',
      password: 'पासवर्ड',
      name: 'नाम',
      price: 'मूल्य',
      category: 'श्रेणी',
      description: 'विवरण',
      greeting: 'शुभकामना',
      profile: 'प्रोफ़ाइल',
      logout: 'लॉगआउट',
      market_analytics: 'बाजार विश्लेषण',
      select_product: 'उत्पाद चुनें',
      price_movement_chart: 'मूल्य परिवर्तन चार्ट',
      price_history: 'मूल्य इतिहास',
      analytics_insights: 'विश्लेषण अंतर्दृष्टि',
      update_product_price: 'उत्पाद मूल्य अपडेट करें',
      add_greeting: 'शुभकामना जोड़ें',
      delete: 'हटाएं',
      close: 'बंद करें',
    }
  },
  te: {
    translation: {
      home: 'హోమ్',
      analytics: 'విశ్లేషణ',
      users: 'వినియోగదారులు',
      add_greetings: 'శుభాకాంక్షలు జోడించండి',
      add_product: 'ఉత్పత్తి జోడించండి',
      update_price: 'ధరను నవీకరించండి',
      update_images: 'చిత్రాలను నవీకరించండి',
      cancel: 'రద్దు చేయండి',
      save: 'సేవ్ చేయండి',
      signin: 'సైన్ ఇన్',
      signup: 'సైన్ అప్',
      email: 'ఇమెయిల్',
      password: 'పాస్వర్డ్',
      name: 'పేరు',
      price: 'ధర',
      category: 'వర్గం',
      description: 'వివరణ',
      greeting: 'శుభాకాంక్ష',
      profile: 'ప్రొఫైల్',
      logout: 'లాగౌట్',
      market_analytics: 'మార్కెట్ విశ్లేషణ',
      select_product: 'ఉత్పత్తిని ఎంచుకోండి',
      price_movement_chart: 'ధర మార్పు చార్ట్',
      price_history: 'ధర చరిత్ర',
      analytics_insights: 'విశ్లేషణ లోతులు',
      update_product_price: 'ఉత్పత్తి ధరను నవీకరించండి',
      add_greeting: 'శుభాకాంక్ష జోడించండి',
      delete: 'తొలగించండి',
      close: 'మూసివేయండి',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 