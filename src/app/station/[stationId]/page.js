"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  getStation,
} from "../../../services/stationService";

import {
  getDriversByStation,
} from "../../../services/driverService";

export default function StationPage() {
  const params = useParams();
  const stationId = params.stationId;

  const [station, setStation] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("autoconnect-language");
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const stationData = await getStation(stationId);

        if (!stationData) {
          setError("Station not found.");
          return;
        }

        setStation(stationData);

        const driverData = await getDriversByStation(stationId);
        setDrivers(driverData);

      } catch (err) {
        console.error(err);
        setError("Unable to load station details.");
      } finally {
        setLoading(false);
      }
    }

    if (stationId) loadData();
  }, [stationId]);

  const translations = {
    en: {
      title: "Available Auto Drivers",
      search: "Search by driver name or vehicle number...",
      call: "Call",
      whatsapp: "WhatsApp",
      noDrivers: "No drivers available at this station.",
      loading: "Loading...",
      home: "Home",
      notFound: "Station not found.",
    },
    hi: {
      title: "उपलब्ध ऑटो ड्राइवर",
      search: "ड्राइवर का नाम या वाहन नंबर खोजें...",
      call: "कॉल करें",
      whatsapp: "व्हाट्सएप",
      noDrivers: "इस स्टेशन पर कोई ड्राइवर उपलब्ध नहीं है।",
      loading: "लोड हो रहा है...",
      home: "होम",
      notFound: "स्टेशन नहीं मिला।",
    },
    mr: {
      title: "उपलब्ध ऑटो चालक",
      search: "चालकाचे नाव किंवा वाहन क्रमांक शोधा...",
      call: "कॉल करा",
      whatsapp: "व्हॉट्सॲप",
      noDrivers: "या स्टेशनवर कोणतेही चालक उपलब्ध नाहीत.",
      loading: "लोड होत आहे...",
      home: "मुख्यपृष्ठ",
      notFound: "स्टेशन सापडले नाही.",
    },
  };

  const text = translations[language] || translations.en;

  const filteredDrivers = drivers.filter((driver) => {
    const value = search.toLowerCase();

    return (
      driver.name?.toLowerCase().includes(value) ||
      driver.vehicleNumber?.toLowerCase().includes(value)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {text.loading}
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">
          {error || text.notFound}
        </h1>

        <Link href="/" className="text-blue-600 underline">
          {text.home}
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-5">

      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 font-semibold">
            ← {text.home}
          </Link>

          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              localStorage.setItem(
                "autoconnect-language",
                e.target.value
              );
            }}
            className="border rounded-lg p-2 bg-white"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {station.name}
          </h1>

          <p className="text-gray-500 mt-2">
            {text.title}
          </p>
        </div>

        <input
          type="text"
          placeholder={text.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 rounded-xl border bg-white mb-6"
        />

        {filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            {text.noDrivers}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">

            {filteredDrivers.map((driver) => (
              <div
                key={driver.id}
                className="bg-white rounded-2xl shadow-sm border p-5"
              >
                <h2 className="text-xl font-bold text-gray-800">
                  {driver.name}
                </h2>

                <p className="text-gray-500 mt-2">
                  Vehicle Number: {driver.vehicleNumber}
                </p>

                <div className="flex gap-3 mt-5">

                  <a
                    href={`tel:${driver.phone}`}
                    className="flex-1 text-center bg-green-600 text-white py-3 rounded-lg font-semibold"
                  >
                    📞 {text.call}
                  </a>

                  <a
                    href={`https://wa.me/${String(
                      driver.whatsapp || driver.phone
                    ).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-emerald-500 text-white py-3 rounded-lg font-semibold"
                  >
                    WhatsApp
                  </a>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}