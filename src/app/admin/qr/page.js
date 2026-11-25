"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { QRCodeCanvas } from "qrcode.react";

import { auth } from "../../../lib/firebase";
import { getStations } from "../../../services/stationService";

const ADMIN_UID = "l5A7js9KCkY8a7LYN4CZFlj24ut1";

function Icon({ children, className = "" }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {children}
    </span>
  );
}

export default function AdminQrGeneratorPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [siteOrigin, setSiteOrigin] = useState("");
  const [isReady, setIsReady] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedStationData = stations.find(
    (station) => station.id === selectedStation
  );

  const qrValue = selectedStation && siteOrigin
    ? `${siteOrigin}/station/${encodeURIComponent(selectedStation)}`
    : "";

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.uid !== ADMIN_UID) {
        if (user) await signOut(auth);

        if (active) router.replace("/admin");
        return;
      }

      try {
        const data = await getStations();

        if (active) {
          setStations(data);
          setSiteOrigin(window.location.origin);

          if (data.length > 0) {
            setSelectedStation(data[0].id);
          }
        }
      } catch (err) {
        console.error("Could not load stations:", err);

        if (active) {
          setError("Could not load stations. Please refresh the page.");
        }
      } finally {
        if (active) setIsReady(true);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  function handleDownload() {
    setError("");
    setNotice("");

    if (!selectedStationData || !qrValue) {
      setError("Please select a station first.");
      return;
    }

    const canvas = document.querySelector("#autoconnectQrCanvas canvas");

    if (!canvas) {
      setError("QR code is not ready yet. Please try again.");
      return;
    }

    try {
      const link = document.createElement("a");

      const fileName = selectedStationData.name
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase();

      link.download = `autoconnect-${fileName}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      setNotice("Station QR code downloaded successfully.");
    } catch (err) {
      console.error("QR download error:", err);
      setError("Could not download QR code. Please try again.");
    }
  }

  function handlePrint() {
    setError("");
    setNotice("");

    if (!selectedStationData) {
      setError("Please select a station first.");
      return;
    }

    window.print();
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/admin");
  }

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4 text-on-surface">
        <div className="flex items-center gap-3 rounded-lg border border-outline bg-surface-card px-5 py-4 shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="font-body text-body-md">
            Opening QR code generator...
          </span>
        </div>
      </main>
    );
  }

  return (
    <div id="top" className="flex min-h-screen bg-surface text-on-surface antialiased">

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* ADMIN SIDEBAR */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 flex min-h-screen w-64 -translate-x-full flex-col justify-between bg-primary p-5 text-on-primary transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex flex-col gap-6">

          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-on-secondary">
                <Icon className="text-title-lg">electric_rickshaw</Icon>
              </span>

              <span className="font-headline text-title-lg">
                AutoConnect
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 lg:hidden"
            >
              <Icon className="text-title-lg">close</Icon>
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">

            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 rounded-md px-3.5 py-2.5 font-label text-label-lg hover:bg-primary-container"
            >
              <Icon className="text-title-md">dashboard</Icon>
              Dashboard
            </Link>

            <Link
              href="/admin/stations"
              className="flex items-center gap-3 rounded-md px-3.5 py-2.5 font-label text-label-lg hover:bg-primary-container"
            >
              <Icon className="text-title-md">train</Icon>
              Manage Stations
            </Link>

            <Link
              href="/admin/drivers"
              className="flex items-center gap-3 rounded-md px-3.5 py-2.5 font-label text-label-lg hover:bg-primary-container"
            >
              <Icon className="text-title-md">group</Icon>
              Driver Management
            </Link>

            <Link
              href="/admin/drivers/add"
              className="flex items-center gap-3 rounded-md px-3.5 py-2.5 font-label text-label-lg hover:bg-primary-container"
            >
              <Icon className="text-title-md">person_add</Icon>
              Add New Driver
            </Link>

            <Link
              href="/admin/qr"
              className="flex items-center gap-3 rounded-md bg-secondary px-3.5 py-2.5 font-label text-label-lg text-on-secondary"
            >
              <Icon className="text-title-md">qr_code_2</Icon>
              QR Code Generator
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 rounded-md px-3.5 py-2.5 font-label text-label-lg hover:bg-primary-container"
            >
              <Icon className="text-title-md">public</Icon>
              View Website
            </Link>

          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-md bg-primary-container px-3.5 py-2.5 text-left font-label text-label-lg text-on-primary-container hover:opacity-90"
        >
          <Icon className="text-title-md">logout</Icon>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col">

        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-outline bg-surface-card px-4 sm:px-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md border border-outline p-2 lg:hidden"
            >
              <Icon className="text-title-lg">menu</Icon>
            </button>

            <h1 className="font-headline text-title-lg">
              QR Code Generator
            </h1>

          </div>
        </header>

        <main className="no-print mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">

          <div>
            <h2 className="font-headline text-headline-md">
              Generate Station QR Codes
            </h2>

            <p className="mt-1 font-body text-body-md text-on-surface-variant">
              Generate a unique QR code for every AutoConnect station.
            </p>
          </div>

          {error && (
            <div
              className="flex items-start gap-2 rounded-md bg-danger-container p-3.5 text-danger-text"
              role="alert"
            >
              <Icon>error</Icon>
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div
              className="flex items-start gap-2 rounded-md bg-success-container p-3.5 text-success-text"
              role="status"
            >
              <Icon>check_circle</Icon>
              <span>{notice}</span>
            </div>
          )}

          {stations.length === 0 ? (
            <section className="rounded-xl border border-outline bg-surface-card p-8 text-center shadow-sm">

              <Icon className="text-headline-lg text-on-surface-variant">
                train
              </Icon>

              <h3 className="mt-3 font-title text-title-lg">
                No Stations Found
              </h3>

              <p className="mt-2 text-body-md text-on-surface-variant">
                Please add a station before generating its QR code.
              </p>

              <Link
                href="/admin/stations"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-label text-label-lg text-on-primary"
              >
                <Icon>add</Icon>
                Add Station
              </Link>

            </section>
          ) : (

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">

              {/* QR CONTROLS */}
              <section className="flex flex-col gap-5 rounded-xl border border-outline bg-surface-card p-5 shadow-sm sm:p-6 lg:col-span-5">

                <div className="flex flex-col gap-2">

                  <label
                    htmlFor="station-select"
                    className="font-label text-label-md"
                  >
                    Select Station
                  </label>

                  <select
                    id="station-select"
                    value={selectedStation}
                    onChange={(event) => {
                      setSelectedStation(event.target.value);
                      setNotice("");
                      setError("");
                    }}
                    className="w-full rounded-md border border-outline-strong bg-surface px-3.5 py-3 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
                  >
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>

                  <p className="font-body text-label-md text-on-surface-variant">
                    Select a station to generate its unique QR code.
                  </p>

                </div>

                <div className="rounded-md bg-primary-container p-3.5 text-on-primary-container">

                  <p className="font-label text-label-md">
                    Selected Station
                  </p>

                  <p className="mt-1 font-title text-title-lg">
                    {selectedStationData?.name}
                  </p>

                </div>

                <div className="flex flex-col gap-3 border-t border-outline pt-4">

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-3 font-label text-label-lg text-on-secondary hover:opacity-95"
                  >
                    <Icon>download</Icon>
                    Download QR Code PNG
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-outline-strong bg-surface-card px-4 py-3 font-label text-label-lg text-primary hover:bg-surface-container-low"
                  >
                    <Icon>print</Icon>
                    Print Station Poster
                  </button>

                </div>

                <div className="rounded-md bg-primary-container p-3.5 text-on-primary-container">

                  <p className="font-label text-label-md">
                    Important
                  </p>

                  <p className="mt-1 font-body text-body-md">
                    For public posters, use your deployed website. A localhost
                    QR code will not work on other phones.
                  </p>

                </div>

              </section>

              {/* POSTER PREVIEW */}
              <section className="flex justify-center lg:col-span-7">

                <div
                  id="printablePoster"
                  className="flex w-full max-w-md flex-col items-center gap-5 rounded-xl border-2 border-primary bg-surface-card p-5 text-center shadow-md sm:p-8"
                >

                  <div className="flex w-full flex-col items-center gap-1 rounded-lg bg-primary px-5 py-4 text-on-primary">

                    <div className="flex items-center gap-2">
                      <Icon className="text-headline-sm text-secondary">
                        electric_rickshaw
                      </Icon>

                      <span className="font-headline text-headline-md tracking-wide">
                        AUTOCONNECT
                      </span>
                    </div>

                    <p className="mt-1 font-title text-title-lg text-secondary">
                      ऑटो चाहिए? QR स्कैन करें!
                    </p>

                  </div>

                  <div
                    id="autoconnectQrCanvas"
                    className="flex items-center justify-center rounded-xl border border-outline bg-white p-3 sm:p-4"
                  >
                    {qrValue && (
                      <QRCodeCanvas
                        key={qrValue}
                        value={qrValue}
                        size={220}
                        level="H"
                        includeMargin
                        bgColor="#FFFFFF"
                        fgColor="#173B57"
                        title={`AutoConnect QR Code - ${selectedStationData?.name}`}
                      />
                    )}
                  </div>

                  <Image
                    src="/images/autoconnect-hero.png"
                    alt="AutoConnect"
                    width={300}
                    height={224}
                    className="h-24 w-36 object-contain"
                    priority
                  />

                  <div className="flex flex-col gap-1">

                    <p className="font-title text-title-lg text-primary">
                      {selectedStationData?.name}
                    </p>

                    <p className="font-title text-title-md text-on-surface">
                      Find Local Auto Drivers
                    </p>

                    <p className="font-label text-label-lg text-on-surface">
                      Scan & Contact Directly
                    </p>

                    <span className="mt-1 inline-block rounded-full bg-secondary px-3 py-1 font-label text-label-md text-on-secondary">
                      No App Required!
                    </span>

                  </div>

                  <p className="w-full break-all border-t border-outline pt-3 font-mono text-mono-md text-on-surface-variant">
                    {qrValue}
                  </p>

                </div>

              </section>

            </div>
          )}

        </main>
      </div>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          #printablePoster,
          #printablePoster * {
            visibility: visible !important;
          }

          #printablePoster {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            border: 2px solid #173B57 !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

    </div>
  );
}