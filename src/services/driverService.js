import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";

const driversCollection = collection(db, "drivers");

// Validate and normalize Indian mobile number
const normalizePhone = (phone) => {
  let number = String(phone || "").replace(/\D/g, "");

  if (number.startsWith("91") && number.length === 12) {
    number = number.slice(2);
  }

  if (!/^[6-9]\d{9}$/.test(number)) {
    throw new Error("Enter a valid 10-digit Indian mobile number.");
  }

  return number;
};

// Validate driver information
const validateDriver = (data) => {
  const name = String(data.name || "").trim();

  const vehicleNumber = String(data.vehicleNumber || "")
    .trim()
    .toUpperCase();

  const vehicleNumberKey = vehicleNumber.replace(/[^A-Z0-9]/g, "");

  if (!name || name.length < 2) {
    throw new Error("Enter a valid driver name.");
  }

  if (!vehicleNumberKey || vehicleNumberKey.length < 6 ||
      vehicleNumberKey.length > 15) {
    throw new Error("Enter a valid vehicle registration number.");
  }

  const phone = normalizePhone(data.phone);

  const whatsapp = data.whatsapp
    ? normalizePhone(data.whatsapp)
    : phone;

  if (!data.stationId) {
    throw new Error("Please select a railway station.");
  }

  return {
    name,
    vehicleNumber,
    vehicleNumberKey,
    phone,
    whatsapp,
    stationId: data.stationId,
  };
};

// Check whether station exists
const checkStation = async (stationId) => {
  const stationRef = doc(db, "stations", stationId);
  const stationSnapshot = await getDoc(stationRef);

  if (!stationSnapshot.exists()) {
    throw new Error("Selected station does not exist.");
  }
};

// Prevent duplicate vehicle registration numbers
const checkDuplicateVehicle = async (
  vehicleNumberKey,
  ignoreDriverId = null
) => {
  const q = query(
    driversCollection,
    where("vehicleNumberKey", "==", vehicleNumberKey)
  );

  const snapshot = await getDocs(q);

  const duplicate = snapshot.docs.some(
    (item) => item.id !== ignoreDriverId
  );

  if (duplicate) {
    throw new Error("This vehicle number is already registered.");
  }
};

// Get all drivers
export const getAllDrivers = async () => {
  const snapshot = await getDocs(driversCollection);

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Get drivers belonging to one station
export const getDriversByStation = async (stationId) => {
  const q = query(
    driversCollection,
    where("stationId", "==", stationId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Get one driver
export const getDriver = async (driverId) => {
  const snapshot = await getDoc(
    doc(db, "drivers", driverId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// Add new driver
export const addDriver = async (data) => {
  const driver = validateDriver(data);

  await checkStation(driver.stationId);

  await checkDuplicateVehicle(driver.vehicleNumberKey);

  const newDriver = {
    ...driver,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const result = await addDoc(driversCollection, newDriver);

  return result.id;
};

// Update driver
export const updateDriver = async (driverId, data) => {
  const driver = validateDriver(data);

  const driverRef = doc(db, "drivers", driverId);

  const existingDriver = await getDoc(driverRef);

  if (!existingDriver.exists()) {
    throw new Error("Driver not found.");
  }

  await checkStation(driver.stationId);

  await checkDuplicateVehicle(
    driver.vehicleNumberKey,
    driverId
  );

  await updateDoc(driverRef, {
    ...driver,
    updatedAt: serverTimestamp(),
  });
};

// Delete driver
export const deleteDriver = async (driverId) => {
  const driverRef = doc(db, "drivers", driverId);

  const existingDriver = await getDoc(driverRef);

  if (!existingDriver.exists()) {
    throw new Error("Driver not found.");
  }

  await deleteDoc(driverRef);
};