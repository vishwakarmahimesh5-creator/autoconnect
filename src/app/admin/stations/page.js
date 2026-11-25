"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";

import {
  getStations,
  addStation,
  updateStation,
  deleteStation,
} from "../../../services/stationService";

import { getAllDrivers } from "../../../services/driverService";

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

export default function ManageStationsPage() {
  const router = useRouter();

  const [stations, setStations] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [stationName, setStationName] = useState("");
  const [editingStation, setEditingStation] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [pendingDelete, setPendingDelete] = useState(null);

  // ==================================
  // ADMIN AUTHENTICATION
  // ==================================

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;

      if (!user) {
        router.replace("/admin");
        return;
      }

      if (user.uid !== ADMIN_UID) {
        await signOut(auth);

        if (active) {
          router.replace("/admin");
        }

        return;
      }

      loadData();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  // ==================================
  // LOAD STATIONS AND DRIVERS
  // ==================================

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [stationData, driverData] = await Promise.all([
        getStations(),
        getAllDrivers(),
      ]);

      setStations(stationData);
      setDrivers(driverData);
    } catch (err) {
      console.error("Loading error:", err);
      setError("Unable to load station information.");
    } finally {
      setLoading(false);
    }
  }

  // ==================================
  // ADD / UPDATE STATION
  // ==================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = stationName.trim();

    if (!cleanName) {
      setError("Please enter a station name.");
      return;
    }

    if (cleanName.length < 2) {
      setError("Station name must contain at least 2 characters.");
      return;
    }

    setSaving(true);

    try {
      if (editingStation) {
        await updateStation(editingStation.id, cleanName);

        setSuccess("Station updated successfully!");
      } else {
        await addStation(cleanName);

        setSuccess("New station added successfully!");
      }

      setStationName("");
      setEditingStation(null);

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save station.");
    } finally {
      setSaving(false);
    }
  }

  // ==================================
  // EDIT STATION
  // ==================================

  function handleEdit(station) {
    setEditingStation(station);
    setStationName(station.name);

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==================================
  // CANCEL EDIT
  // ==================================

  function cancelEdit() {
    setEditingStation(null);
    setStationName("");
    setError("");
  }

  // ==================================
  // DELETE STATION
  // ==================================

  async function confirmDelete() {
    if (!pendingDelete) return;

    setError("");
    setSuccess("");

    try {
      await deleteStation(pendingDelete.id);

      setSuccess("Station deleted successfully!");

      setPendingDelete(null);

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to delete station.");
      setPendingDelete(null);
    }
  }

  // ==================================
  // LOGOUT
  // ==================================

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/admin");
    } catch (err) {
      setError("Unable to logout. Please try again.");
    }
  }

  // ==================================
  // SEARCH STATIONS
  // ==================================

  const filteredStations = stations.filter((station) =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==================================
  // DRIVER COUNT
  // ==================================

  function getDriverCount(stationId) {
    return drivers.filter(
      (driver) => driver.stationId === stationId
    ).length;
  }

  // ==================================
  // LOADING SCREEN
  // ==================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">

        <div className="flex items-center gap-3 rounded-lg border border-outline bg-surface-card p-5">

          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />

          <span>Loading stations...</span>

        </div>

      </main>
    );
  }

  // ==================================
  // MAIN PAGE
  // ==================================

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">

      {/* MOBILE BACKDROP */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-primary p-5 text-on-primary transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        <div>

          <Link href="/" className="flex items-center gap-3 mb-8">

            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-on-secondary">

              <Icon>electric_rickshaw</Icon>

            </span>

            <span className="font-headline text-title-lg">
              AutoConnect
            </span>

          </Link>

          <nav className="flex flex-col gap-2">

            <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-white/10">

              <Icon>dashboard</Icon>
              Dashboard

            </Link>

            <Link href="/admin/stations" className="flex items-center gap-3 rounded-md bg-secondary px-3 py-3 text-on-secondary">

              <Icon>train</Icon>
              Manage Stations

            </Link>

            <Link href="/admin/drivers" className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-white/10">

              <Icon>group</Icon>
              Manage Drivers

            </Link>

            <Link href="/admin/drivers/add" className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-white/10">

              <Icon>person_add</Icon>
              Add New Driver

            </Link>

            <Link href="/admin/qr" className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-white/10">

              <Icon>qr_code_2</Icon>
              QR Generator

            </Link>

            <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-white/10">

              <Icon>public</Icon>
              View Website

            </Link>

          </nav>

        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-md bg-primary-container px-3 py-3 text-on-primary-container"
        >

          <Icon>logout</Icon>
          Logout

        </button>

      </aside>

      {/* MAIN CONTENT */}

      <div className="min-w-0 flex-1">

        {/* TOP NAVBAR */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline bg-surface-card px-5">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md border border-outline p-2 lg:hidden"
            >

              <Icon>menu</Icon>

            </button>

            <h1 className="font-headline text-title-lg">
              Manage Stations
            </h1>

          </div>

          <span className="hidden text-sm text-on-surface-variant sm:block">
            AutoConnect Admin
          </span>

        </header>

        <main className="mx-auto flex max-w-6xl flex-col gap-6 p-5 sm:p-6">

          {/* PAGE INTRODUCTION */}

          <section>

            <h2 className="font-headline text-2xl font-bold text-on-surface">
              Railway Station Management
            </h2>

            <p className="mt-2 text-sm text-on-surface-variant">
              Create and manage station categories for AutoConnect.
            </p>

          </section>

          {/* NOTIFICATIONS */}

          {error && (

            <div
              role="alert"
              className="rounded-lg border border-danger bg-danger-container p-4 text-danger"
            >

              {error}

            </div>

          )}

          {success && (

            <div
              role="status"
              className="rounded-lg border border-success bg-success-container p-4 text-success-text"
            >

              {success}

            </div>

          )}

          {/* STATION FORM */}

          <section className="rounded-xl border border-outline bg-surface-card p-5 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-primary">

                <Icon>
                  {editingStation ? "edit" : "add_location_alt"}
                </Icon>

              </span>

              <div>

                <h3 className="font-title text-title-lg font-semibold">

                  {editingStation ? "Edit Station" : "Add New Station"}

                </h3>

                <p className="text-sm text-on-surface-variant">

                  Enter the railway station or auto stand name.

                </p>

              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
            >

              <label className="flex-1">

                <span className="mb-2 block text-sm font-medium">
                  Station Name
                </span>

                <input
                  type="text"
                  value={stationName}
                  onChange={(event) =>
                    setStationName(event.target.value)
                  }
                  placeholder="Example: Umroli Station"
                  maxLength={80}
                  required
                  className="w-full rounded-md border border-outline-strong bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
                />

              </label>

              <div className="flex gap-3">

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-label text-on-primary hover:opacity-90 disabled:opacity-60"
                >

                  <Icon>
                    {editingStation ? "save" : "add"}
                  </Icon>

                  {saving
                    ? "Saving..."
                    : editingStation
                    ? "Update Station"
                    : "Add Station"}

                </button>

                {editingStation && (

                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-md border border-outline px-4 py-3 hover:bg-surface-container-low"
                  >

                    Cancel

                  </button>

                )}

              </div>

            </form>

          </section>

          {/* STATISTICS */}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <article className="rounded-xl border border-outline bg-surface-card p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-on-surface-variant">
                    Total Stations
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {stations.length}
                  </p>

                </div>

                <Icon className="text-3xl text-primary">
                  train
                </Icon>

              </div>

            </article>

            <article className="rounded-xl border border-outline bg-surface-card p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-on-surface-variant">
                    Total Registered Drivers
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {drivers.length}
                  </p>

                </div>

                <Icon className="text-3xl text-primary">
                  electric_rickshaw
                </Icon>

              </div>

            </article>

          </section>

          {/* SEARCH */}

          <section className="rounded-xl border border-outline bg-surface-card p-4">

            <label className="flex items-center gap-3">

              <Icon className="text-on-surface-variant">
                search
              </Icon>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search railway station..."
                className="w-full bg-transparent outline-none"
              />

            </label>

          </section>

          {/* STATION LIST */}

          <section className="flex flex-col gap-4">

            <div className="flex items-center justify-between">

              <h3 className="font-title text-title-lg font-semibold">
                Registered Stations
              </h3>

              <span className="text-sm text-on-surface-variant">
                {filteredStations.length} stations
              </span>

            </div>

            {filteredStations.length > 0 ? (

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {filteredStations.map((station) => {

                  const driverCount = getDriverCount(station.id);

                  return (

                    <article
                      key={station.id}
                      className="rounded-xl border border-outline bg-surface-card p-5 shadow-sm"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-start gap-3">

                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-container text-primary">

                            <Icon className="text-xl">
                              train
                            </Icon>

                          </span>

                          <div className="min-w-0">

                            <h4 className="font-title text-lg font-semibold">
                              {station.name}
                            </h4>

                            <p className="mt-1 text-xs text-on-surface-variant">
                              ID: {station.id}
                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-outline pt-4">

                        <p className="text-sm text-on-surface-variant">

                          <span className="font-semibold text-primary">
                            {driverCount}
                          </span>{" "}

                          Registered Drivers

                        </p>

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            title="Edit Station"
                            onClick={() => handleEdit(station)}
                            className="rounded-md border border-outline p-2 text-primary hover:bg-primary-container"
                          >

                            <Icon>edit</Icon>

                          </button>

                          <button
                            type="button"
                            title="Delete Station"
                            onClick={() => setPendingDelete(station)}
                            className="rounded-md border border-outline p-2 text-danger hover:bg-danger-container"
                          >

                            <Icon>delete</Icon>

                          </button>

                        </div>

                      </div>

                    </article>

                  );

                })}

              </div>

            ) : (

              <div className="rounded-xl border border-outline bg-surface-card p-10 text-center">

                <Icon className="text-5xl text-on-surface-variant">
                  train
                </Icon>

                <h3 className="mt-3 font-title text-lg font-semibold">

                  {stations.length === 0
                    ? "No Stations Added Yet"
                    : "No Matching Stations"}

                </h3>

                <p className="mt-2 text-sm text-on-surface-variant">

                  {stations.length === 0
                    ? "Add your first railway station using the form above."
                    : "Try searching with a different station name."}

                </p>

              </div>

            )}

          </section>

        </main>

      </div>

      {/* DELETE CONFIRMATION */}

      {pendingDelete && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-sm rounded-xl border border-outline bg-surface-card p-6 shadow-xl"
          >

            <div className="flex items-center gap-3">

              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-container text-danger">

                <Icon className="text-xl">
                  warning
                </Icon>

              </span>

              <h3
                id="delete-title"
                className="font-title text-lg font-semibold"
              >
                Delete Station?
              </h3>

            </div>

            <p className="mt-4 text-sm text-on-surface-variant">

              Are you sure you want to delete{" "}

              <strong className="text-on-surface">
                {pendingDelete.name}
              </strong>?

              <br />

              Stations containing registered drivers cannot be deleted.

            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-md border border-outline px-4 py-2"
              >

                Cancel

              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-danger px-4 py-2 text-white hover:opacity-90"
              >

                Delete

              </button>

            </div>

          </section>

        </div>

      )}

    </div>
  );
}