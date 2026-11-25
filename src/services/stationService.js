import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  limit,
} from "firebase/firestore";

import { db } from "../lib/firebase";

// Convert station name into URL-friendly ID
export const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

// Get all stations
export const getStations = async () => {
  const snapshot = await getDocs(collection(db, "stations"));

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Get one station
export const getStation = async (stationId) => {
  const stationRef = doc(db, "stations", stationId);
  const snapshot = await getDoc(stationRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// Add new station
export const addStation = async (name) => {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Station name is required.");
  }

  const stationId = createSlug(cleanName);

  if (!stationId) {
    throw new Error("Invalid station name.");
  }

  const stationRef = doc(db, "stations", stationId);
  const existingStation = await getDoc(stationRef);

  if (existingStation.exists()) {
    throw new Error("This station already exists.");
  }

  await setDoc(stationRef, {
    name: cleanName,
    slug: stationId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return stationId;
};

// Update station name
export const updateStation = async (stationId, name) => {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Station name is required.");
  }

  await updateDoc(doc(db, "stations", stationId), {
    name: cleanName,
    updatedAt: serverTimestamp(),
  });
};

// Delete station
// A station cannot be deleted while drivers are assigned to it.
export const deleteStation = async (stationId) => {
  const driverQuery = query(
    collection(db, "drivers"),
    where("stationId", "==", stationId),
    limit(1)
  );

  const driverSnapshot = await getDocs(driverQuery);

  if (!driverSnapshot.empty) {
    throw new Error(
      "This station has drivers. Reassign or delete those drivers first."
    );
  }

  await deleteDoc(doc(db, "stations", stationId));
};