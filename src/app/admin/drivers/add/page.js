"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../../../../lib/firebase";
import { getStations } from "../../../../services/stationService";
import {
  getDriver,
  addDriver,
  updateDriver,
} from "../../../../services/driverService";

const ADMIN_UID = "l5A7js9KCkY8a7LYN4CZFlj24ut1";

export default function AddDriverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    vehicleNumber: "",
    phone: "",
    whatsapp: "",
    stationId: "",
  });

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.uid !== ADMIN_UID) {
        if (user) await signOut(auth);
        router.replace("/admin");
        return;
      }

      try {
        const stationData = await getStations();

        if (!active) return;
        setStations(stationData);

        if (editId) {
          const driver = await getDriver(editId);

          if (!driver) {
            setError("Driver not found.");
          } else {
            setForm({
              name: driver.name || "",
              vehicleNumber: driver.vehicleNumber || "",
              phone: driver.phone || "",
              whatsapp: driver.whatsapp || "",
              stationId: driver.stationId || "",
            });
          }
        }
      } catch (err) {
        console.error(err);
        if (active) setError(err.message || "Unable to load data.");
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router, editId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const data = {
        name: form.name.trim(),
        vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || form.phone.trim(),
        stationId: form.stationId,
      };

      if (editId) {
        await updateDriver(editId, data);
      } else {
        await addDriver(data);
      }

      router.push("/admin/drivers");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save driver.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading driver form...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-10">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {editId ? "Edit Driver" : "Add New Driver"}
          </h1>

          <Link href="/admin/drivers" className="text-blue-600">
            Back
          </Link>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block">Driver Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded border p-3"
              placeholder="Enter driver name"
            />
          </div>

          <div>
            <label className="mb-1 block">Vehicle Number *</label>
            <input
              name="vehicleNumber"
              value={form.vehicleNumber}
              onChange={handleChange}
              required
              className="w-full rounded border p-3 uppercase"
              placeholder="MH 12 AB 1234"
            />
          </div>

          <div>
            <label className="mb-1 block">Phone Number *</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              maxLength={10}
              className="w-full rounded border p-3"
              placeholder="10 digit mobile number"
            />
          </div>

          <div>
            <label className="mb-1 block">WhatsApp Number (Optional)</label>
            <input
              name="whatsapp"
              type="tel"
              value={form.whatsapp}
              onChange={handleChange}
              maxLength={10}
              className="w-full rounded border p-3"
              placeholder="Leave blank to use phone number"
            />
          </div>

          <div>
            <label className="mb-1 block">Station Category *</label>
            <select
              name="stationId"
              value={form.stationId}
              onChange={handleChange}
              required
              className="w-full rounded border p-3"
            >
              <option value="">Select Station</option>

              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          {stations.length === 0 && (
            <p className="text-sm text-red-600">
              Please add a station before adding drivers.
            </p>
          )}

          <button
            type="submit"
            disabled={saving || stations.length === 0}
            className="w-full rounded bg-blue-700 p-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editId
                ? "Update Driver"
                : "Save Driver"}
          </button>
        </form>
      </div>
    </main>
  );
}