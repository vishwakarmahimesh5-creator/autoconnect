"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useLanguage } from "../context/LanguageContext";
import { getStations } from "../services/stationService";

const LANGUAGE_OPTIONS = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    symbol: "A",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    symbol: "अ",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    symbol: "अ",
  },
];

const PAGE_TEXT = {
  en: {
    home: "Home",
    about: "About Us",
    contact: "Contact",
    admin: "Admin Login",

    welcome: "Welcome to AutoConnect",
    chooseLanguage: "Choose your preferred language",
    languageDescription:
      "Select a language to continue to the local auto driver directory.",

    eyebrow: "YOUR LOCAL RIDE, JUST ONE SCAN AWAY",
    title: "Find Your Local Auto Driver",
    description:
      "Discover local auto-rickshaw drivers and contact them directly. No app or customer registration required.",

    stationTitle: "Select Your Railway Station",
    stationDescription:
      "Choose the station where you want to find an auto driver.",

    searchPlaceholder: "Search railway station...",
    viewDrivers: "View Drivers",

    noStations: "No stations have been added yet.",
    noResults: "No matching stations found.",
    loading: "Loading stations...",

    changeLanguage: "Change Language",

    howTitle: "How AutoConnect Works",
    howDescription:
      "Finding a local auto driver is simple and quick.",

    step1: "Scan the QR Code",
    step1Description:
      "Scan the QR code displayed at your railway station.",

    step2: "Choose Your Language",
    step2Description:
      "Select English, Hindi or Marathi.",

    step3: "Contact Your Driver",
    step3Description:
      "Find your station's drivers and contact them directly.",

    whyTitle: "Why AutoConnect?",
    feature1: "No App Required",
    feature1Description:
      "Open the website directly in your mobile browser.",

    feature2: "Direct Contact",
    feature2Description:
      "Call drivers or contact them through WhatsApp.",

    feature3: "Station Wise Directory",
    feature3Description:
      "Find drivers registered at your selected station.",

    feature4: "Easy to Use",
    feature4Description:
      "Simple and accessible for everyone.",

    footerDescription:
      "Connecting passengers with local auto-rickshaw drivers.",

    disclaimer:
      "AutoConnect is an independent local auto-rickshaw directory. We are not affiliated with any government authority or transportation company. Please verify driver details before travelling.",

    copyright: "All Rights Reserved.",
  },

  hi: {
    home: "होम",
    about: "हमारे बारे में",
    contact: "संपर्क",
    admin: "एडमिन लॉगिन",

    welcome: "ऑटोकनेक्ट में आपका स्वागत है",
    chooseLanguage: "अपनी पसंदीदा भाषा चुनें",
    languageDescription:
      "स्थानीय ऑटो चालक डायरेक्टरी देखने के लिए अपनी भाषा चुनें।",

    eyebrow: "आपकी स्थानीय सवारी, बस एक स्कैन दूर",
    title: "अपने स्थानीय ऑटो चालक को खोजें",
    description:
      "स्थानीय ऑटो चालकों को खोजें और उनसे सीधे संपर्क करें। किसी ऐप या ग्राहक रजिस्ट्रेशन की आवश्यकता नहीं है।",

    stationTitle: "अपना रेलवे स्टेशन चुनें",
    stationDescription:
      "वह स्टेशन चुनें जहाँ आपको ऑटो चालक ढूँढना है।",

    searchPlaceholder: "रेलवे स्टेशन खोजें...",
    viewDrivers: "ड्राइवर देखें",

    noStations: "अभी तक कोई स्टेशन नहीं जोड़ा गया है।",
    noResults: "कोई मिलता-जुलता स्टेशन नहीं मिला।",
    loading: "स्टेशन लोड हो रहे हैं...",

    changeLanguage: "भाषा बदलें",

    howTitle: "ऑटोकनेक्ट कैसे काम करता है",
    howDescription:
      "स्थानीय ऑटो चालक को खोजना आसान और तेज़ है।",

    step1: "QR कोड स्कैन करें",
    step1Description:
      "रेलवे स्टेशन पर लगे QR कोड को स्कैन करें।",

    step2: "अपनी भाषा चुनें",
    step2Description:
      "अंग्रेज़ी, हिंदी या मराठी चुनें।",

    step3: "ड्राइवर से संपर्क करें",
    step3Description:
      "अपने स्टेशन के ड्राइवर खोजें और सीधे संपर्क करें।",

    whyTitle: "ऑटोकनेक्ट क्यों?",
    feature1: "ऐप की जरूरत नहीं",
    feature1Description:
      "अपने मोबाइल ब्राउज़र में सीधे वेबसाइट खोलें।",

    feature2: "सीधा संपर्क",
    feature2Description:
      "ड्राइवर को कॉल करें या व्हाट्सऐप पर संपर्क करें।",

    feature3: "स्टेशन के अनुसार डायरेक्टरी",
    feature3Description:
      "अपने चुने हुए स्टेशन के पंजीकृत ड्राइवर खोजें।",

    feature4: "उपयोग में आसान",
    feature4Description:
      "सभी के लिए सरल और सुविधाजनक।",

    footerDescription:
      "यात्रियों को स्थानीय ऑटो चालकों से जोड़ना।",

    disclaimer:
      "ऑटोकनेक्ट एक स्वतंत्र स्थानीय ऑटो-रिक्शा डायरेक्टरी है। इसका किसी सरकारी संस्था या परिवहन कंपनी से संबंध नहीं है। यात्रा से पहले ड्राइवर की जानकारी सत्यापित करें।",

    copyright: "सर्वाधिकार सुरक्षित।",
  },

  mr: {
    home: "मुख्यपृष्ठ",
    about: "आमच्याबद्दल",
    contact: "संपर्क",
    admin: "ॲडमिन लॉगिन",

    welcome: "ऑटोकनेक्टमध्ये आपले स्वागत आहे",
    chooseLanguage: "आपली आवडती भाषा निवडा",
    languageDescription:
      "स्थानिक रिक्षाचालकांची यादी पाहण्यासाठी आपली भाषा निवडा.",

    eyebrow: "तुमची स्थानिक राईड, फक्त एका स्कॅनवर",
    title: "तुमचा स्थानिक रिक्षाचालक शोधा",
    description:
      "स्थानिक रिक्षाचालक शोधा आणि त्यांच्याशी थेट संपर्क साधा. कोणत्याही ॲप किंवा ग्राहक नोंदणीची गरज नाही.",

    stationTitle: "तुमचे रेल्वे स्टेशन निवडा",
    stationDescription:
      "ज्या स्टेशनवर तुम्हाला रिक्षाचालक शोधायचा आहे ते निवडा.",

    searchPlaceholder: "रेल्वे स्टेशन शोधा...",
    viewDrivers: "चालक पहा",

    noStations: "अद्याप कोणतेही स्टेशन जोडलेले नाही.",
    noResults: "कोणतेही जुळणारे स्टेशन सापडले नाही.",
    loading: "स्टेशन लोड होत आहेत...",

    changeLanguage: "भाषा बदला",

    howTitle: "ऑटोकनेक्ट कसे कार्य करते",
    howDescription:
      "स्थानिक रिक्षाचालक शोधणे सोपे आणि जलद आहे.",

    step1: "QR कोड स्कॅन करा",
    step1Description:
      "रेल्वे स्टेशनवर लावलेला QR कोड स्कॅन करा.",

    step2: "आपली भाषा निवडा",
    step2Description:
      "इंग्रजी, हिंदी किंवा मराठी निवडा.",

    step3: "चालकाशी संपर्क साधा",
    step3Description:
      "तुमच्या स्टेशनवरील चालक शोधा आणि थेट संपर्क साधा.",

    whyTitle: "ऑटोकनेक्ट का?",
    feature1: "ॲपची गरज नाही",
    feature1Description:
      "तुमच्या मोबाईल ब्राउझरमध्ये थेट वेबसाइट उघडा.",

    feature2: "थेट संपर्क",
    feature2Description:
      "चालकाला कॉल करा किंवा व्हॉट्सॲपवर संपर्क साधा.",

    feature3: "स्टेशननुसार चालकांची यादी",
    feature3Description:
      "तुम्ही निवडलेल्या स्टेशनवरील नोंदणीकृत चालक शोधा.",

    feature4: "वापरण्यास सोपे",
    feature4Description:
      "प्रत्येकासाठी सोपे आणि सोयीस्कर.",

    footerDescription:
      "प्रवाशांना स्थानिक रिक्षाचालकांशी जोडणे.",

    disclaimer:
      "ऑटोकनेक्ट ही स्वतंत्र स्थानिक रिक्षाचालकांची निर्देशिका आहे. तिचा कोणत्याही सरकारी संस्था किंवा परिवहन कंपनीशी संबंध नाही. प्रवास करण्यापूर्वी चालकाची माहिती तपासा.",

    copyright: "सर्व हक्क राखीव.",
  },
};

export default function Home() {
  const { language, setLanguage } = useLanguage();

  const [showLanguageScreen, setShowLanguageScreen] =
    useState(true);

  const [stations, setStations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const text = PAGE_TEXT[language] || PAGE_TEXT.en;

  // Fetch stations from Firebase
  useEffect(() => {
    let active = true;

    async function loadStations() {
      try {
        setLoading(true);
        setError("");

        const result = await getStations();

        if (active) {
          setStations(result);
        }
      } catch (err) {
        console.error("Station loading error:", err);

        if (active) {
          setError(
            "Unable to load stations. Please check your connection."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStations();

    return () => {
      active = false;
    };
  }, []);

  // Search stations
  const filteredStations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return stations;
    }

    return stations.filter((station) =>
      station.name.toLowerCase().includes(query)
    );
  }, [stations, searchTerm]);

  // Select language
function handleLanguageSelect(code) {
  console.log("Selected language:", code);

  setLanguage(code);
  setShowLanguageScreen(false);

  alert("Language selected: " + code);
}

  // Change language
  function handleChangeLanguage() {
    setShowLanguageScreen(true);
  }

  // Language Selection Screen
  if (showLanguageScreen) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center px-5 py-12">

        <div className="w-full max-w-xl">

          <div className="text-center mb-9">

            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-secondary rounded-xl mb-5">
              <span className="material-symbols-outlined text-4xl">
                electric_rickshaw
              </span>
            </div>

            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
              AutoConnect
            </h1>

            <p className="text-on-surface-variant mt-3 text-lg">
              {text.welcome}
            </p>

            <h2 className="font-title text-xl font-semibold text-on-surface mt-5">
              {text.chooseLanguage}
            </h2>

            <p className="text-on-surface-variant text-sm mt-2">
              {text.languageDescription}
            </p>

            <p className="text-sm text-on-surface-variant mt-3">
              अपनी भाषा चुनें / आपली भाषा निवडा
            </p>

          </div>

          <div className="space-y-4">

            {LANGUAGE_OPTIONS.map((item) => (

              <button
                key={item.code}
                type="button"
                onClick={() => handleLanguageSelect(item.code)}
                className="w-full flex items-center justify-between gap-4 p-5 bg-surface-card border border-outline rounded-xl shadow-sm hover:border-primary hover:bg-primary-container transition-all"
              >

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-lg bg-secondary-container text-primary flex items-center justify-center text-2xl font-bold">
                    {item.symbol}
                  </div>

                  <div className="text-left">

                    <p className="font-title text-lg font-semibold text-on-surface">
                      {item.nativeName}
                    </p>

                    <p className="text-sm text-on-surface-variant">
                      {item.name}
                    </p>

                  </div>

                </div>

                <span className="material-symbols-outlined text-primary">
                  arrow_forward
                </span>

              </button>

            ))}

          </div>

          <p className="text-center text-xs text-on-surface-variant mt-8">
            AutoConnect — Your Local Ride, Just One Scan Away.
          </p>

        </div>

      </main>
    );
  }

  // Main Homepage
  return (
    <div
      id="top"
      className="min-h-screen flex flex-col bg-surface"
    >

      {/* NAVBAR */}

      <header className="sticky top-0 z-40 bg-surface-card border-b border-outline">

        <div className="max-w-6xl mx-auto px-5 md:px-6 h-16 flex items-center justify-between gap-4">

          <Link
            href="/"
            className="flex items-center gap-2.5"
          >

            <span className="w-10 h-10 rounded-md bg-primary text-secondary flex items-center justify-center">

              <span className="material-symbols-outlined">
                electric_rickshaw
              </span>

            </span>

            <span className="font-headline text-title-lg font-bold text-primary">
              AutoConnect
            </span>

          </Link>

          <nav className="flex items-center gap-2">

            <Link
              href="/about"
              className="hidden sm:inline-flex px-3 py-2 text-on-surface hover:bg-surface-container-low rounded-md"
            >
              {text.about}
            </Link>

            <button
              type="button"
              onClick={handleChangeLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-outline text-primary hover:bg-primary-container"
            >

              <span className="material-symbols-outlined text-lg">
                language
              </span>

              <span className="text-sm font-medium">
                {language.toUpperCase()}
              </span>

            </button>

            <Link
              href="/admin"
              className="px-3 py-2 rounded-md bg-primary text-white text-sm font-medium hover:opacity-90"
            >
              {text.admin}
            </Link>

          </nav>

        </div>

      </header>

      <main className="flex-1">

        {/* HERO SECTION */}

        <section className="bg-surface-card border-b border-outline">

          <div className="max-w-6xl mx-auto px-6 py-14">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container mb-5">

                <span className="material-symbols-outlined text-sm">
                  qr_code_scanner
                </span>

                <span className="text-xs font-semibold uppercase tracking-wide">
                  {text.eyebrow}
                </span>

              </div>

              <h1 className="font-headline text-3xl md:text-5xl font-bold text-primary leading-tight">
                {text.title}
              </h1>

              <p className="text-on-surface-variant text-base md:text-lg mt-5 max-w-2xl leading-relaxed">
                {text.description}
              </p>

              <div className="flex flex-wrap gap-4 mt-6">

                <span className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary">
                    check_circle
                  </span>
                  {text.step1}
                </span>

                <span className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary">
                    check_circle
                  </span>
                  {text.step2}
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* STATION DIRECTORY */}

        <section className="max-w-6xl mx-auto w-full px-5 md:px-6 py-12">

          <div className="mb-7">

            <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
              {text.stationTitle}
            </h2>

            <p className="text-on-surface-variant mt-2">
              {text.stationDescription}
            </p>

          </div>

          {/* SEARCH */}

          <div className="bg-surface-card border border-outline rounded-xl p-4 mb-7 shadow-sm">

            <div className="relative">

              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>

              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={text.searchPlaceholder}
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-surface border border-outline-strong text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary"
              />

            </div>

          </div>

          {/* LOADING */}

          {loading && (

            <div className="text-center py-12">

              <span className="material-symbols-outlined text-4xl text-primary animate-spin">
                progress_activity
              </span>

              <p className="text-on-surface-variant mt-3">
                {text.loading}
              </p>

            </div>

          )}

          {/* ERROR */}

          {!loading && error && (

            <div className="bg-danger-container text-danger p-5 rounded-lg text-center">

              <p>{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 underline font-semibold"
              >
                {text.loading === "Loading stations..."
                  ? "Refresh"
                  : "Retry / पुनः प्रयास करें"}
              </button>

            </div>

          )}

          {/* STATION CARDS */}

          {!loading && !error && filteredStations.length > 0 && (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredStations.map((station) => (

                <Link
                  key={station.id}
                  href={`/station/${encodeURIComponent(station.id)}`}
                  className="group bg-surface-card border border-outline rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary transition-all"
                >

                  <div className="flex items-center justify-between mb-5">

                    <div className="w-12 h-12 rounded-lg bg-primary text-secondary flex items-center justify-center">

                      <span className="material-symbols-outlined text-2xl">
                        train
                      </span>

                    </div>

                    <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>

                  </div>

                  <h3 className="font-title text-lg font-semibold text-on-surface">
                    {station.name}
                  </h3>

                  <p className="text-sm text-on-surface-variant mt-2">
                    {text.viewDrivers}
                  </p>

                </Link>

              ))}

            </div>

          )}

          {/* EMPTY STATES */}

          {!loading && !error && filteredStations.length === 0 && (

            <div className="bg-surface-card border border-outline rounded-xl p-10 text-center">

              <span className="material-symbols-outlined text-5xl text-on-surface-variant">
                search_off
              </span>

              <h3 className="font-title text-lg font-semibold text-on-surface mt-3">
                {stations.length === 0
                  ? text.noStations
                  : text.noResults}
              </h3>

              <p className="text-on-surface-variant text-sm mt-2">

                {stations.length === 0
                  ? "Please check again later."
                  : text.searchPlaceholder}

              </p>

            </div>

          )}

        </section>

        {/* HOW IT WORKS */}

        <section className="bg-surface-card border-y border-outline">

          <div className="max-w-6xl mx-auto px-6 py-12">

            <h2 className="font-headline text-2xl font-bold text-on-surface">
              {text.howTitle}
            </h2>

            <p className="text-on-surface-variant mt-2 mb-8">
              {text.howDescription}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {[
                {
                  number: "1",
                  icon: "qr_code_scanner",
                  title: text.step1,
                  description: text.step1Description,
                },
                {
                  number: "2",
                  icon: "language",
                  title: text.step2,
                  description: text.step2Description,
                },
                {
                  number: "3",
                  icon: "call",
                  title: text.step3,
                  description: text.step3Description,
                },
              ].map((step) => (

                <article
                  key={step.number}
                  className="bg-surface border border-outline rounded-xl p-6"
                >

                  <div className="w-12 h-12 bg-primary text-secondary rounded-lg flex items-center justify-center mb-4">

                    <span className="material-symbols-outlined text-2xl">
                      {step.icon}
                    </span>

                  </div>

                  <h3 className="font-title text-lg font-semibold text-on-surface">
                    {step.title}
                  </h3>

                  <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">
                    {step.description}
                  </p>

                </article>

              ))}

            </div>

          </div>

        </section>

        {/* WHY AUTOCONNECT */}

        <section className="max-w-6xl mx-auto px-6 py-12">

          <h2 className="font-headline text-2xl font-bold text-on-surface mb-7">
            {text.whyTitle}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {[
              ["language", text.feature1, text.feature1Description],
              ["phone_in_talk", text.feature2, text.feature2Description],
              ["train", text.feature3, text.feature3Description],
              ["touch_app", text.feature4, text.feature4Description],
            ].map(([icon, title, description]) => (

              <article
                key={title}
                className="bg-surface-card border border-outline rounded-xl p-5"
              >

                <span className="material-symbols-outlined text-3xl text-primary">
                  {icon}
                </span>

                <h3 className="font-title font-semibold text-on-surface mt-3">
                  {title}
                </h3>

                <p className="text-sm text-on-surface-variant mt-2">
                  {description}
                </p>

              </article>

            ))}

          </div>

        </section>

      </main>

      {/* FOOTER */}

      <footer className="bg-surface-card border-t border-outline">

        <div className="max-w-6xl mx-auto px-6 py-9">

          <div className="flex flex-col md:flex-row justify-between gap-6">

            <div className="max-w-sm">

              <div className="flex items-center gap-2">

                <span className="material-symbols-outlined text-primary text-3xl">
                  electric_rickshaw
                </span>

                <span className="font-headline text-lg font-bold text-primary">
                  AutoConnect
                </span>

              </div>

              <p className="text-sm text-on-surface-variant mt-3">
                {text.footerDescription}
              </p>

            </div>

            <div className="flex flex-wrap gap-5 text-sm">

              <Link href="/" className="hover:text-primary">
                {text.home}
              </Link>

              <Link href="/about" className="hover:text-primary">
                {text.about}
              </Link>

              <Link href="/admin" className="hover:text-primary">
                {text.admin}
              </Link>

            </div>

          </div>

          <div className="mt-7 p-4 rounded-lg bg-surface-container-low border border-outline">

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {text.disclaimer}
            </p>

          </div>

          <p className="text-xs text-on-surface-variant mt-5">
            © {new Date().getFullYear()} AutoConnect. {text.copyright}
          </p>

        </div>

      </footer>

    </div>
  );
}