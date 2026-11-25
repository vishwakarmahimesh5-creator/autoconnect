"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../../../lib/firebase";
import { getAllDrivers, deleteDriver } from "../../../services/driverService";
import { getStations } from "../../../services/stationService";

const ADMIN_UID = "l5A7js9KCkY8a7LYN4CZFlj24ut1";

function Icon({ children, className = "" }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {children}
    </span>
  );
}

function getInitials(name = "Driver") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function DriverManagementPage() {
  const router = useRouter();

  const [drivers, setDrivers] = useState([]);
  const [stations, setStations] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStation, setSelectedStation] = useState("");

  const [viewDriver, setViewDriver] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    const [driverData, stationData] = await Promise.all([
      getAllDrivers(),
      getStations(),
    ]);

    setDrivers(driverData);
    setStations(stationData);
  }

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.uid !== ADMIN_UID) {
        if (user) await signOut(auth);

        if (active) router.replace("/admin");
        return;
      }

      try {
        await loadData();
      } catch (err) {
        console.error("Driver loading error:", err);
        if (active) setError("Could not load drivers. Please refresh the page.");
      } finally {
        if (active) setIsReady(true);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  const stationMap = useMemo(
    () => new Map(stations.map((station) => [station.id, station.name])),
    [stations]
  );

  const filteredDrivers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return drivers.filter((driver) => {
      const matchesSearch =
        !query ||
        String(driver.name || "").toLowerCase().includes(query) ||
        String(driver.phone || "").toLowerCase().includes(query) ||
        String(driver.vehicleNumber || "").toLowerCase().includes(query);

      const matchesStation =
        !selectedStation || driver.stationId === selectedStation;

      return matchesSearch && matchesStation;
    });
  }, [drivers, searchTerm, selectedStation]);

  function resetFilters() {
    setSearchTerm("");
    setSelectedStation("");
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;

    try {
      setDeleting(true);
      await deleteDriver(pendingDelete.id);

      setDrivers((previous) =>
        previous.filter((driver) => driver.id !== pendingDelete.id)
      );

      setPendingDelete(null);

      if (viewDriver?.id === pendingDelete.id) {
        setViewDriver(null);
      }
    } catch (err) {
      console.error("Delete driver error:", err);
      setError(err.message || "Could not delete driver.");
    } finally {
      setDeleting(false);
    }
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
          <span className="font-body text-body-md">Opening driver management...</span>
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
        className={`fixed inset-y-0 left-0 z-50 flex min-h-screen w-64 -translate-x-full flex-col justify-between bg-primary p-5 text-on-primary transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-on-secondary">
                <Icon className="text-title-lg">electric_rickshaw</Icon>
              </span>
              <span className="font-headline text-title-lg">AutoConnect</span>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 hover:opacity-80 lg:hidden"
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
              className="flex items-center gap-3 rounded-md bg-secondary px-3.5 py-2.5 font-label text-label-lg text-on-secondary"
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
              className="flex items-center gap-3 rounded-md px-3.5 py-2.5 font-label text-label-lg hover:bg-primary-container"
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

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-outline bg-surface-card px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md border border-outline p-2 lg:hidden"
            >
              <Icon className="text-title-lg">menu</Icon>
            </button>

            <h1 className="truncate font-headline text-title-lg">
              Driver Management
            </h1>
          </div>

          <Link
            href="/admin/drivers/add"
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-3 py-2 font-label text-label-md text-on-primary hover:opacity-95 sm:px-4 sm:text-label-lg"
          >
            <Icon className="text-title-md">add</Icon>
            Add Driver
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 p-4 sm:p-6">

          {error && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-danger bg-danger-container p-3 text-danger-text">
              <p className="text-sm">{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Close error"
              >
                <Icon>close</Icon>
              </button>
            </div>
          )}

          {/* FILTER BAR */}
          <section className="grid grid-cols-1 items-end gap-3 rounded-lg border border-outline bg-surface-card p-4 shadow-sm md:grid-cols-12">

            <label className="flex flex-col gap-1 md:col-span-6">
              <span className="font-label text-label-md">Search</span>

              <div className="relative">
                <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-title-md text-on-surface-variant">
                  search
                </Icon>

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search name, phone, or vehicle..."
                  className="w-full rounded-md border border-outline-strong bg-surface py-2.5 pl-10 pr-3.5 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1 md:col-span-4">
              <span className="font-label text-label-md">Station</span>

              <select
                value={selectedStation}
                onChange={(event) => setSelectedStation(event.target.value)}
                className="w-full rounded-md border border-outline-strong bg-surface px-3.5 py-2.5 text-body-md outline-none focus:border-primary"
              >
                <option value="">All Stations</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center justify-between gap-2 md:col-span-2 md:justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-md px-2 py-2 font-label text-label-md text-on-surface-variant hover:underline"
              >
                Clear
              </button>

              <span className="whitespace-nowrap rounded-md bg-primary-container px-3 py-2 font-label text-label-md text-on-primary-container">
                {filteredDrivers.length} Drivers
              </span>
            </div>
          </section>

          {/* DRIVER TABLE */}
          <section className="overflow-hidden rounded-lg border border-outline bg-surface-card shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="border-b border-outline bg-surface-container-low">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-label text-label-md text-on-surface-variant">Profile</th>
                    <th className="whitespace-nowrap px-4 py-3 font-label text-label-md text-on-surface-variant">Driver Name</th>
                    <th className="whitespace-nowrap px-4 py-3 font-label text-label-md text-on-surface-variant">Phone Number</th>
                    <th className="whitespace-nowrap px-4 py-3 font-label text-label-md text-on-surface-variant">Vehicle Number</th>
                    <th className="whitespace-nowrap px-4 py-3 font-label text-label-md text-on-surface-variant">Station</th>
                    <th className="whitespace-nowrap px-4 py-3 font-label text-label-md text-on-surface-variant">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-outline">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="transition-colors hover:bg-surface-container-low">

                      <td className="px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-label text-label-md text-on-primary">
                          {getInitials(driver.name)}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-label text-label-lg">
                        {driver.name}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-mono text-mono-md text-on-surface-variant">
                        +91 {driver.phone}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-mono text-mono-md">
                        {driver.vehicleNumber}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-body text-body-md">
                        {stationMap.get(driver.stationId) || "Unknown Station"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">

                          <button
                            type="button"
                            onClick={() => setViewDriver(driver)}
                            aria-label={`View ${driver.name}`}
                            className="rounded-md p-1.5 text-primary hover:bg-surface-container"
                          >
                            <Icon className="text-title-md">visibility</Icon>
                          </button>

                          <Link
                            href={`/admin/drivers/add?id=${encodeURIComponent(driver.id)}`}
                            aria-label={`Edit ${driver.name}`}
                            className="rounded-md p-1.5 text-primary hover:bg-surface-container"
                          >
                            <Icon className="text-title-md">edit</Icon>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setPendingDelete(driver)}
                            aria-label={`Delete ${driver.name}`}
                            className="rounded-md p-1.5 text-danger hover:bg-danger-container"
                          >
                            <Icon className="text-title-md">delete</Icon>
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDrivers.length === 0 && (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <Icon className="text-headline-lg text-on-surface-variant">
                  search_off
                </Icon>

                <p className="font-title text-title-md">
                  No drivers found
                </p>

                <p className="text-sm text-on-surface-variant">
                  Add a new driver or change your search filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-1 rounded-md bg-primary px-4 py-2 font-label text-label-md text-on-primary"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </section>

          <p className="font-body text-label-md text-on-surface-variant">
            Driver records are managed through Firebase Firestore.
          </p>

        </main>
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewDriver && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewDriver(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="driver-details-title"
            className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-outline bg-surface-card p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="driver-details-title" className="font-title text-title-lg">
                Driver Details
              </h2>

              <button
                type="button"
                onClick={() => setViewDriver(null)}
                aria-label="Close details"
                className="rounded-md p-1 text-on-surface-variant hover:bg-surface-container"
              >
                <Icon className="text-title-lg">close</Icon>
              </button>
            </div>

            <div className="flex items-center gap-3 border-b border-outline pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-label text-label-lg text-on-primary">
                {getInitials(viewDriver.name)}
              </div>

              <div>
                <p className="font-title text-title-md">{viewDriver.name}</p>
                <p className="font-mono text-mono-md text-on-surface-variant">
                  {viewDriver.vehicleNumber}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 font-body text-body-md">
              <dt className="text-on-surface-variant">Phone</dt>
              <dd>+91 {viewDriver.phone}</dd>

              <dt className="text-on-surface-variant">WhatsApp</dt>
              <dd>+91 {viewDriver.whatsapp || viewDriver.phone}</dd>

              <dt className="text-on-surface-variant">Station</dt>
              <dd>{stationMap.get(viewDriver.stationId) || "Unknown Station"}</dd>
            </dl>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewDriver(null)}
                className="rounded-md bg-primary px-4 py-2 font-label text-label-md text-on-primary"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setPendingDelete(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-driver-title"
            className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-outline bg-surface-card p-6 shadow-xl"
          >
            <h2 id="delete-driver-title" className="font-title text-title-lg">
              Confirm Deletion
            </h2>

            <p className="font-body text-body-md text-on-surface-variant">
              Are you sure you want to delete {pendingDelete.name}?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setPendingDelete(null)}
                className="rounded-md border border-outline-strong px-4 py-2 font-label text-label-lg hover:bg-surface-container-low disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="rounded-md bg-danger px-4 py-2 font-label text-label-lg text-white hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}