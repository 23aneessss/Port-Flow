const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pf_token");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pf_token");
      localStorage.removeItem("pf_role");
      localStorage.removeItem("pf_userId");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error ${res.status}`);
  }
  return res.json();
}

/* ── Auth ── */
export async function login(email: string, password: string) {
  return apiFetch<{ token: string; role: string; userId: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/* ── Dashboard ── */
export interface DashboardOverview {
  totalBookings: number;
  pendingBookings: number;
  carriersPending: number;
  totalTerminals: number;
  totalCarriers: number;
  totalDrivers: number;
}

export async function getDashboardOverview() {
  return apiFetch<DashboardOverview>("/operator/dashboard/overview");
}

/* ── Terminals ── */
export interface Terminal {
  id: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED";
  maxSlots: number;
  availableSlots: number;
  coordX: number;
  coordY: number;
  createdAt: string;
  updatedAt: string;
}

export async function listTerminals() {
  return apiFetch<Terminal[]>("/operator/terminals");
}

export async function getTerminal(id: string) {
  return apiFetch<Terminal>(`/operator/terminals/${id}`);
}

/* ── Bookings ── */
export interface BookingUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  carrierUserId: string;
  driverUserId: string | null;
  terminalId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "CONSUMED";
  decidedByOperatorUserId: string | null;
  qrPayload: string | null;
  createdAt: string;
  updatedAt: string;
  carrier: BookingUser;
  driver: BookingUser | null;
}

export async function listBookings(status?: string) {
  const params = status ? `?status=${status}` : "";
  return apiFetch<Booking[]>(`/operator/bookings${params}`);
}

export async function approveBooking(id: string) {
  return apiFetch<any>(`/operator/bookings/${id}/approve`, { method: "POST" });
}

export async function rejectBooking(id: string) {
  return apiFetch<any>(`/operator/bookings/${id}/reject`, { method: "POST" });
}

/* ── Anomalies ── */
export interface Anomaly {
  id: string;
  severity: string;
  message: string;
  terminalId: string | null;
  bookingId: string | null;
  createdAt: string;
  terminal: { id: string; name: string } | null;
  booking: any | null;
}

export async function listAnomalies() {
  return apiFetch<Anomaly[]>("/anomalies");
}
