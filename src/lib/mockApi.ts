// Stand-in for the real M-Chaja backend (NestJS + PostgreSQL) until it's live —
// ported 1:1 from MockAPI.swift / MockApi.kt. Same seed data, same artificial
// network latency, same mutation behavior. See M-Chaja_Web_App_Port_Spec.md §6.
import { Store, useStore } from "./store";
import type { Rental, Station, User, WalletTransaction } from "./models";
import { createUser } from "./models";
import { HOURLY_RATE_TZS } from "./billing";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Anchors mock timestamps to a fixed hour on a given day offset (rather than a
 *  raw interval from `new Date()`) so seed data reliably lands "today" (or N
 *  days ago) regardless of what time of day the app happens to load. */
function daysAgoAt(daysAgo: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const seedStations: Station[] = [
  {
    id: "st-1",
    name: "Slipway Waterfront",
    address: "Msasani Peninsula, Dar es Salaam",
    latitude: -6.7594,
    longitude: 39.2513,
    availableCount: 18,
    totalSlots: 24,
    distanceLabel: "300 m",
    photos: [],
    operatingHours: "10:00 - 22:00",
    supportPhone: "+255 758 215 514",
    cabinetType: "big",
    locationImageName: "slipway_waterfront",
  },
  {
    id: "st-2",
    name: "Mlimani City Mall",
    address: "Sam Nujoma Rd, Dar es Salaam",
    latitude: -6.7749,
    longitude: 39.2087,
    availableCount: 2,
    totalSlots: 8,
    distanceLabel: "1.2 km",
    photos: [],
    operatingHours: "09:00 - 23:00",
    supportPhone: "+255 758 215 514",
    cabinetType: "small",
    locationImageName: "mlimani_city",
  },
  {
    id: "st-3",
    name: "Kariakoo Market",
    address: "Tandamti St, Dar es Salaam",
    latitude: -6.8175,
    longitude: 39.2735,
    availableCount: 0,
    totalSlots: 8,
    distanceLabel: "3.4 km",
    photos: [],
    operatingHours: "07:00 - 20:00",
    supportPhone: "+255 758 215 514",
    cabinetType: "small",
    locationImageName: "kariakoo",
  },
  {
    id: "st-4",
    name: "Coco Beach",
    address: "Toure Drive, Msasani, Dar es Salaam",
    latitude: -6.7663,
    longitude: 39.2802,
    availableCount: 20,
    totalSlots: 24,
    distanceLabel: "900 m",
    photos: [],
    operatingHours: "06:00 - 24:00",
    supportPhone: "+255 758 215 514",
    cabinetType: "big",
    locationImageName: "coco_beach",
  },
];

const seedTransactions: WalletTransaction[] = [
  { id: "tx-1", type: "rental_charge", amountTzs: -1500, createdAt: daysAgoAt(0, 8, 10), description: "Rental at Coco Beach (1 hr)" },
  { id: "tx-2", type: "top_up", amountTzs: 10000, createdAt: daysAgoAt(0, 9, 5), description: "Wallet top-up via mobile money" },
  { id: "tx-3", type: "rental_charge", amountTzs: -2000, createdAt: daysAgoAt(0, 10, 40), description: "Rental at Slipway Waterfront (2 hrs)" },
  { id: "tx-4", type: "withdrawal", amountTzs: -3000, createdAt: daysAgoAt(0, 12, 15), description: "Withdrawal to mobile money" },
  { id: "tx-5", type: "top_up", amountTzs: 5000, createdAt: daysAgoAt(0, 13, 30), description: "Wallet top-up via mobile money" },
  { id: "tx-6", type: "rental_charge", amountTzs: -1000, createdAt: daysAgoAt(1, 18), description: "Rental at Mlimani City Mall (1 hr)" },
  { id: "tx-7", type: "top_up", amountTzs: 5000, createdAt: daysAgoAt(3, 9), description: "Wallet top-up via mobile money" },
  { id: "tx-8", type: "rental_charge", amountTzs: -2000, createdAt: daysAgoAt(4, 15), description: "Rental at Slipway Waterfront (2 hrs)" },
];

function addHoursIso(iso: string, hours: number): string {
  const d = new Date(iso);
  d.setTime(d.getTime() + hours * 3_600_000);
  return d.toISOString();
}

const seedRentals: Rental[] = [
  {
    id: "rn-1",
    stationId: "st-1",
    stationName: "Slipway Waterfront",
    status: "completed",
    startedAt: daysAgoAt(2, 14, 10),
    endedAt: addHoursIso(daysAgoAt(2, 14, 10), 2),
    totalChargedTzs: 2000,
    batteryPercent: 96,
  },
  {
    id: "rn-2",
    stationId: "st-2",
    stationName: "Mlimani City Mall",
    status: "completed",
    startedAt: daysAgoAt(5, 9, 30),
    endedAt: addHoursIso(daysAgoAt(5, 9, 30), 1),
    totalChargedTzs: 1000,
    batteryPercent: 88,
  },
  {
    id: "rn-3",
    stationId: "st-4",
    stationName: "Coco Beach",
    status: "completed",
    startedAt: daysAgoAt(9, 18, 45),
    endedAt: addHoursIso(daysAgoAt(9, 18, 45), 3),
    totalChargedTzs: 3000,
    batteryPercent: 92,
  },
];

export class MockApiInvalidCodeError extends Error {
  constructor() {
    super("Enter the 4-digit code sent to your phone.");
    this.name = "MockApiInvalidCodeError";
  }
}

class MockApiImpl {
  stations = new Store<Station[]>(seedStations);
  walletBalanceTzs = new Store<number>(3000);
  transactions = new Store<WalletTransaction[]>(seedTransactions);
  rentals = new Store<Rental[]>(seedRentals);

  station(id: string): Station | undefined {
    return this.stations.get().find((s) => s.id === id);
  }

  get activeRental(): Rental | undefined {
    return this.rentals.get().find((r) => r.status === "active");
  }

  async topUp(amountTzs: number): Promise<void> {
    await sleep(800);
    this.walletBalanceTzs.set((prev) => prev + amountTzs);
    this.transactions.set((prev) => [
      { id: `tx-${prev.length + 1}`, type: "top_up", amountTzs, createdAt: new Date().toISOString(), description: "Wallet top-up" },
      ...prev,
    ]);
  }

  async withdraw(amountTzs: number): Promise<void> {
    await sleep(800);
    this.walletBalanceTzs.set((prev) => prev - amountTzs);
    this.transactions.set((prev) => [
      { id: `tx-${prev.length + 1}`, type: "withdrawal", amountTzs: -amountTzs, createdAt: new Date().toISOString(), description: "Withdrawal to mobile money" },
      ...prev,
    ]);
  }

  async startRental(stationId: string): Promise<Rental> {
    await sleep(1200);
    const stationName = this.station(stationId)?.name ?? "Unknown station";
    // A dot leaves the "available" pool the moment the power bank is checked
    // out, mirroring the physical cabinet's slot count in real time.
    this.stations.set((prev) =>
      prev.map((s) => (s.id === stationId ? { ...s, availableCount: Math.max(0, s.availableCount - 1) } : s)),
    );
    const rental: Rental = {
      id: `rn-${this.rentals.get().length + 1}`,
      stationId,
      stationName,
      status: "active",
      startedAt: new Date().toISOString(),
      batteryPercent: 96,
      prepaidTzs: HOURLY_RATE_TZS,
    };
    this.rentals.set((prev) => [rental, ...prev]);
    // The first hour is deducted immediately when the cabinet releases the
    // power bank — any additional hours are settled at return time.
    this.walletBalanceTzs.set((prev) => prev - HOURLY_RATE_TZS);
    this.transactions.set((prev) => [
      { id: `tx-${prev.length + 1}`, type: "rental_charge", amountTzs: -HOURLY_RATE_TZS, createdAt: new Date().toISOString(), description: `Rental at ${stationName} (1st hour)` },
      ...prev,
    ]);
    return rental;
  }

  async endRental(rentalId: string, totalChargedTzs: number): Promise<void> {
    await sleep(800);
    const rental = this.rentals.get().find((r) => r.id === rentalId);
    if (!rental) return;
    // The first hour was already deducted at rental start — only settle the balance.
    const remainingChargeTzs = Math.max(0, totalChargedTzs - (rental.prepaidTzs ?? 0));
    this.rentals.set((prev) =>
      prev.map((r) =>
        r.id === rentalId ? { ...r, status: "completed", endedAt: new Date().toISOString(), totalChargedTzs } : r,
      ),
    );
    this.walletBalanceTzs.set((prev) => prev - remainingChargeTzs);
    this.stations.set((prev) =>
      prev.map((s) => (s.id === rental.stationId ? { ...s, availableCount: Math.min(s.totalSlots, s.availableCount + 1) } : s)),
    );
  }

  async requestOtp(_phoneNumber: string): Promise<void> {
    await sleep(600);
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<User> {
    await sleep(600);
    if (code.length !== 4) {
      throw new MockApiInvalidCodeError();
    }
    return createUser(`user-${phoneNumber}`, phoneNumber);
  }
}

/** Singleton, matching `MockAPI.shared` / `MockApi` — import and use directly
 *  from anywhere, or via the `useMockApi*` hooks below inside components. */
export const MockApi = new MockApiImpl();

export function useStations(): Station[] {
  return useStore(MockApi.stations);
}

export function useWalletBalance(): number {
  return useStore(MockApi.walletBalanceTzs);
}

export function useTransactions(): WalletTransaction[] {
  return useStore(MockApi.transactions);
}

export function useRentals(): Rental[] {
  return useStore(MockApi.rentals);
}

export function useActiveRental(): Rental | undefined {
  return useRentals().find((r) => r.status === "active");
}
