// Ported 1:1 from Models.swift / the Android data classes — see
// M-Chaja_Web_App_Port_Spec.md §6. Keep field names and shapes in sync with
// those two files if either changes.

export type CabinetType = "small" | "big";

export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  availableCount: number;
  totalSlots: number;
  distanceLabel?: string;
  photos: string[];
  operatingHours: string;
  supportPhone: string;
  cabinetType: CabinetType;
  locationImageName: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  fullName: string;
  handle: string;
  email: string;
  nidaNumber: string;
  driversLicense: string;
  photoDataUrl?: string;
}

export function createUser(id: string, phoneNumber: string): User {
  return {
    id,
    phoneNumber,
    name: "Ally Mkumbwa",
    fullName: "Ally Assad Mkumbwa",
    handle: "mkumbwajr",
    email: "mkumbwajr@gmail.com",
    nidaNumber: "19900923-12101-00004-28",
    driversLicense: "",
  };
}

export type WalletTransactionType = "top_up" | "rental_charge" | "withdrawal";

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amountTzs: number; // negative for charges/withdrawals, positive for top-ups
  createdAt: string; // ISO date
  description: string;
}

export type RentalStatus = "active" | "completed";

export interface Rental {
  id: string;
  stationId: string;
  stationName: string;
  status: RentalStatus;
  startedAt: string; // ISO date
  endedAt?: string;
  totalChargedTzs?: number;
  batteryPercent?: number;
}
