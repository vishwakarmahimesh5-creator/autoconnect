"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../../../lib/firebase";

import { getAllDrivers } from "../../../services/driverService";
import { getStations } from "../../../services/stationService";

const ADMIN_UID = "l5A7js9KCkY8a7LYN4CZFlj24ut1";

function Icon({ children, className = "" }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function StatCard({ title, count, icon, description }) {
  return (
    <article className="flex items-center justify-between gap-4 rounded-lg border border-outline bg-surface-card p-5 shadow-sm">

      <div>
        <p className="font-label text-label-md text-on-surface-variant">
          {title}
        </p>

        <p className="mt-2 font-headline text-headline-lg tabular-nums text-on-surface">
          {count}
        </p>

        <p className="mt-1 text-xs text-on-surface-variant">
          {description}
        </p>
      </div>

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
        <Icon className="text-headline-sm">{icon}</Icon>
      </div>

    </article>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [drivers, setDrivers] = useState([]);
  const [stations, setStations] = useState([]);

  const [adminEmail, setAdminEmail] = useState("");

  const [isReady, setIsReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ==================================
  // FIREBASE AUTHENTICATION
  // ==================================

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (!active) return;

      if (!user) {
        router.replace("/admin");
        return;
      }

      // Verify authorized admin
      if (user.uid !== ADMIN_UID) {

        try {
          await signOut(auth);
        } catch (err) {
          console.error("Unauthorized signout:", err);
        }

        if (active) {
          router.replace("/admin");
        }

        return;
      }

      setAdminEmail(user.email || "Administrator");

      // ==================================
      // LOAD FIRESTORE DATA
      // ==================================

      try {

        const [driverData, stationData] = await Promise.all([
          getAllDrivers(),
          getStations(),
        ]);

        if (!active) return;

        setDrivers(driverData);
        setStations(stationData);
        setError("");

      } catch (err) {

        console.error("Dashboard loading error:", err);

        if (active) {
          setError(
            "Unable to load dashboard data. Please refresh the page."
          );
        }

      } finally {

        if (active) {
          setIsReady(true);
        }

      }
    });

    return () => {
      active = false;
      unsubscribe();
    };

  }, [router]);

  // ==================================
  // LOGOUT
  // ==================================

  async function handleLogout() {

    setIsLoggingOut(true);

    try {

      await signOut(auth);

      router.replace("/admin");

    } catch (err) {

      console.error("Logout error:", err);

      setError("Unable to logout. Please try again.");

      setIsLoggingOut(false);
    }
  }

  // ==================================
  // RECENT DRIVERS
  // ==================================

  const recentDrivers = [...drivers]
    .sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;

      return timeB - timeA;
    })
    .slice(0, 5);

  // ==================================
  // LOADING SCREEN
  // ==================================

  if (!isReady) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-surface px-4">

        <div className="flex items-center gap-3 rounded-lg border border-outline bg-surface-card px-5 py-4 shadow-sm">

          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />

          <span className="text-body-md text-on-surface">
            Opening AutoConnect Dashboard...
          </span>

        </div>

      </main>

    );
  }

  // ==================================
  // DASHBOARD
  // ==================================

  return (

    <div className="flex min-h-screen bg-surface text-on-surface">

      {/* MOBILE BACKDROP */}

      {sidebarOpen && (

        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />

      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col justify-between
          bg-primary p-5 text-on-primary
          transition-transform duration-200
          lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        <div className="flex flex-col gap-7">

          {/* LOGO */}

          <Link href="/" className="flex items-center gap-3">

            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-on-secondary">

              <Icon className="text-title-lg">
                electric_rickshaw
              </Icon>

            </span>

            <span className="font-headline text-title-lg">
              AutoConnect
            </span>

          </Link>

          {/* NAVIGATION */}

          <nav className="flex flex-col gap-2">

            <Link
              href="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-md bg-secondary px-3.5 py-3 text-on-secondary"
            >

              <Icon>dashboard</Icon>

              <span className="font-label text-label-lg">
                Dashboard
              </span>

            </Link>

            <Link
              href="/admin/stations"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-md px-3.5 py-3 hover:bg-white/10"
            >

              <Icon>train</Icon>

              <span className="font-label text-label-lg">
                Manage Stations
              </span>

            </Link>

            <Link
              href="/admin/drivers"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-md px-3.5 py-3 hover:bg-white/10"
            >

              <Icon>group</Icon>

              <span className="font-label text-label-lg">
                Manage Drivers
              </span>

            </Link>

            <Link
              href="/admin/drivers/add"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-md px-3.5 py-3 hover:bg-white/10"
            >

              <Icon>person_add</Icon>

              <span className="font-label text-label-lg">
                Add New Driver
              </span>

            </Link>

            <Link
              href="/admin/qr"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-md px-3.5 py-3 hover:bg-white/10"
            >

              <Icon>qr_code_2</Icon>

              <span className="font-label text-label-lg">
                QR Generator
              </span>

            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 rounded-md px-3.5 py-3 hover:bg-white/10"
            >

              <Icon>public</Icon>

              <span className="font-label text-label-lg">
                View Website
              </span>

            </Link>

          </nav>

        </div>

        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 rounded-md bg-primary-container px-3.5 py-3 text-on-primary-container hover:opacity-90 disabled:opacity-60"
        >

          <Icon>logout</Icon>

          <span className="font-label text-label-lg">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>

        </button>

      </aside>

      {/* MAIN CONTENT */}

      <div className="flex min-w-0 flex-1 flex-col">

        {/* TOP NAVBAR */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-outline bg-surface-card px-4 sm:px-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md border border-outline p-2 lg:hidden"
            >

              <Icon>menu</Icon>

            </button>

            <h1 className="font-headline text-title-lg">
              Dashboard
            </h1>

          </div>

          <div className="flex items-center gap-3">

            <span className="hidden text-sm text-on-surface-variant sm:inline">

              {adminEmail}

            </span>

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary">

              <Icon>admin_panel_settings</Icon>

            </span>

          </div>

        </header>

        {/* DASHBOARD CONTENT */}

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-7 p-4 sm:p-6">

          {/* WELCOME */}

          <section>

            <h2 className="font-headline text-2xl font-bold text-on-surface">

              Welcome to AutoConnect!

            </h2>

            <p className="mt-2 text-sm text-on-surface-variant">

              Manage your railway stations and registered auto drivers.

            </p>

          </section>

          {/* ERROR */}

          {error && (

            <div
              role="alert"
              className="rounded-lg border border-danger bg-danger-container p-4 text-danger"
            >

              {error}

            </div>

          )}

          {/* STATISTICS */}

          <section
            aria-label="Dashboard statistics"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2"
          >

            <StatCard
              title="Total Registered Drivers"
              count={drivers.length}
              icon="electric_rickshaw"
              description="Drivers registered on AutoConnect"
            />

            <StatCard
              title="Total Railway Stations"
              count={stations.length}
              icon="train"
              description="Stations managed by AutoConnect"
            />

          </section>

          {/* QUICK ACTIONS */}

          <section className="rounded-lg border border-outline bg-surface-card p-5 shadow-sm">

            <h2 className="mb-5 font-title text-title-lg">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <Link
                href="/admin/stations"
                className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-on-primary hover:opacity-90"
              >

                <Icon>train</Icon>

                <span>Manage Stations</span>

              </Link>

              <Link
                href="/admin/drivers"
                className="flex items-center justify-center gap-2 rounded-md border border-outline-strong px-4 py-3 text-primary hover:bg-surface-container-low"
              >

                <Icon>group</Icon>

                <span>Manage Drivers</span>

              </Link>

              <Link
                href="/admin/drivers/add"
                className="flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-3 text-on-secondary hover:opacity-90"
              >

                <Icon>person_add</Icon>

                <span>Add Driver</span>

              </Link>

              <Link
                href="/admin/qr"
                className="flex items-center justify-center gap-2 rounded-md border border-outline-strong px-4 py-3 text-primary hover:bg-surface-container-low"
              >

                <Icon>qr_code_2</Icon>

                <span>Generate QR</span>

              </Link>

            </div>

          </section>

          {/* RECENT DRIVERS */}

          <section className="overflow-hidden rounded-lg border border-outline bg-surface-card shadow-sm">

            <div className="flex items-center justify-between border-b border-outline px-5 py-4">

              <h2 className="font-title text-title-lg">
                Recently Added Drivers
              </h2>

              <Link
                href="/admin/drivers"
                className="rounded-md bg-primary-container px-3 py-2 text-sm text-on-primary-container hover:opacity-90"
              >

                View All

              </Link>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-outline bg-surface-container-low">

                  <tr>

                    <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold">
                      Driver Name
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold">
                      Vehicle Number
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold">
                      Phone Number
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold">
                      Railway Station
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-outline">

                  {recentDrivers.length > 0 ? (

                    recentDrivers.map((driver) => {

                      const station = stations.find(
                        (item) => item.id === driver.stationId
                      );

                      return (

                        <tr
                          key={driver.id}
                          className="hover:bg-surface-container-low"
                        >

                          <td className="whitespace-nowrap px-4 py-4 font-medium">

                            {driver.name}

                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-mono text-sm">

                            {driver.vehicleNumber}

                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-mono text-sm">

                            {driver.phone}

                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm">

                            {station?.name || "Station not found"}

                          </td>

                        </tr>

                      );

                    })

                  ) : (

                    <tr>

                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-sm text-on-surface-variant"
                      >

                        No drivers registered yet.

                        <br />

                        Add your first driver to get started.

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </section>

        </main>

      </div>

    </div>

  );
}