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
  return apiFetch<DashboardOverview>("/admin/dashboard/overview");
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
  return apiFetch<Terminal[]>("/admin/terminals");
}

export async function getTerminal(id: string) {
  return apiFetch<Terminal>(`/admin/terminals/${id}`);
}

export async function createTerminal(data: {
  name: string;
  maxSlots: number;
  availableSlots: number;
  coordX: number;
  coordY: number;
  status?: string;
}) {
  return apiFetch<Terminal>("/admin/terminals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTerminal(
  id: string,
  data: Partial<{
    name: string;
    status: string;
    maxSlots: number;
    availableSlots: number;
    coordX: number;
    coordY: number;
  }>
) {
  return apiFetch<Terminal>(`/admin/terminals/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTerminal(id: string) {
  return apiFetch<Terminal>(`/admin/terminals/${id}`, { method: "DELETE" });
}

/* ── Operators ── */
export interface OperatorWithUser {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
}

export async function createOperator(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthDate: string;
}) {
  return apiFetch<{ user: any; profile: any }>("/admin/operators", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOperator(id: string) {
  return apiFetch<OperatorWithUser>(`/admin/operator/${id}`);
}

export async function updateOperator(
  id: string,
  data: Partial<{
    email: string;
    password: string;
    isActive: boolean;
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    birthDate: string;
  }>
) {
  return apiFetch<OperatorWithUser>(`/admin/operator/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteOperator(id: string) {
  return apiFetch<any>(`/admin/operator/${id}`, { method: "DELETE" });
}

/* ── Carriers ── */
export interface CarrierProfile {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthDate: string;
  companyName: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  proofDocumentUrl: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
}

export async function listCarriers(status?: string) {
  const params = status ? `?status=${status}` : "";
  return apiFetch<CarrierProfile[]>(`/admin/carriers${params}`);
}

export async function approveCarrier(id: string) {
  return apiFetch<any>(`/admin/carriers/${id}/approve`, { method: "POST" });
}

export async function rejectCarrier(id: string) {
  return apiFetch<any>(`/admin/carriers/${id}/reject`, { method: "POST" });
}

export async function listCarrierDrivers(carrierId: string) {
  return apiFetch<any[]>(`/admin/carriers/${carrierId}/drivers`);
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
