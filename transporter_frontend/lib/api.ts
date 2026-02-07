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
export async function loginApi(email: string, password: string) {
  return apiFetch<{ token: string; role: string; userId: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerCarrier(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthDate: string;
  companyName: string;
  proofDocumentUrl: string;
}) {
  return apiFetch<{ user: any; profile: any }>("/carrier/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ── Terminals ── */
export interface TerminalOption {
  id: string;
  name: string;
}

export async function listTerminals() {
  return apiFetch<TerminalOption[]>("/carrier/terminals");
}

/* ── Drivers ── */
export interface DriverProfile {
  userId: string;
  carrierUserId: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthDate: string;
  truckNumber: string;
  truckPlate: string;
  drivingLicenseUrl: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    isActive: boolean;
  };
}

export async function listDrivers() {
  return apiFetch<DriverProfile[]>("/carrier/drivers");
}

export async function createDriver(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthDate: string;
  truckNumber: string;
  truckPlate: string;
  drivingLicenseUrl: string;
}) {
  return apiFetch<{ user: any; profile: any }>("/carrier/drivers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDriver(
  id: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    birthDate: string;
    truckNumber: string;
    truckPlate: string;
    drivingLicenseUrl: string;
    status: string;
  }>
) {
  return apiFetch<any>(`/carrier/drivers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDriver(id: string) {
  return apiFetch<{ deleted: boolean }>(`/carrier/drivers/${id}`, {
    method: "DELETE",
  });
}

/* ── Bookings ── */
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
}

export async function listBookings() {
  return apiFetch<Booking[]>("/carrier/bookings");
}

export async function createBooking(data: {
  terminalId: string;
  date: string;
  startTime: string;
  endTime: string;
  driverUserId?: string;
}) {
  return apiFetch<Booking>("/carrier/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBooking(
  id: string,
  data: Partial<{
    terminalId: string;
    date: string;
    startTime: string;
    endTime: string;
    driverUserId: string;
  }>
) {
  return apiFetch<Booking>(`/carrier/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBooking(id: string) {
  return apiFetch<{ deleted: boolean }>(`/carrier/bookings/${id}`, {
    method: "DELETE",
  });
}
