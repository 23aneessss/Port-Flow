export interface Operator {
  id: string
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
  gender: "MALE" | "FEMALE"
  birth_date: string
  status: "ACTIVE" | "SUSPENDED"
  terminal_id?: string
}

export interface Terminal {
  id: string
  name: string
  status: "ACTIVE" | "SUSPENDED"
  max_slots: number
  available_slots: number
  coordinates: { x: number; y: number }
  operators: string[]
}

export interface Transporter {
  id: string
  name: string
  phone: string
  status: "ACTIVE" | "SUSPENDED" | "PENDING"
  drivers: Driver[]
  registered_at: string
}

export interface Driver {
  id: string
  name: string
  phone: string
  license_number: string
}

export interface Anomaly {
  id: string
  title: string
  description: string
  terminal_id: string
  terminal_name: string
  severity: "CRITICAL" | "WARNING" | "INFO"
  timestamp: string
  status: "OPEN" | "ACKNOWLEDGED"
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "TERMINAL_OVERLOAD" | "SUSPICIOUS_ACTIVITY" | "EXTREME_DELAY" | "SYSTEM"
  priority: "HIGH" | "MEDIUM" | "LOW"
  timestamp: string
  read: boolean
}

export const operators: Operator[] = [
  { id: "op-001", email: "jean.dupont@port.com", password: "s3cur3P@ss1", first_name: "Jean", last_name: "Dupont", phone: "+33 6 12 34 56 78", gender: "MALE", birth_date: "1985-03-15", status: "ACTIVE", terminal_id: "t-001" },
  { id: "op-002", email: "marie.curie@port.com", password: "M@rie2024!", first_name: "Marie", last_name: "Curie", phone: "+33 6 98 76 54 32", gender: "FEMALE", birth_date: "1990-07-22", status: "ACTIVE", terminal_id: "t-002" },
  { id: "op-003", email: "lucas.martin@port.com", password: "Luc@s#2024", first_name: "Lucas", last_name: "Martin", phone: "+33 6 11 22 33 44", gender: "MALE", birth_date: "1988-11-05", status: "ACTIVE", terminal_id: "t-001" },
  { id: "op-004", email: "sophie.bernard@port.com", password: "S0phie_B!", first_name: "Sophie", last_name: "Bernard", phone: "+33 6 55 66 77 88", gender: "FEMALE", birth_date: "1992-01-30", status: "SUSPENDED", terminal_id: "t-003" },
  { id: "op-005", email: "pierre.moreau@port.com", password: "P1erre#M!", first_name: "Pierre", last_name: "Moreau", phone: "+33 6 22 33 44 55", gender: "MALE", birth_date: "1983-09-12", status: "ACTIVE", terminal_id: "t-002" },
  { id: "op-006", email: "claire.petit@port.com", password: "Cl@ire456", first_name: "Claire", last_name: "Petit", phone: "+33 6 44 55 66 77", gender: "FEMALE", birth_date: "1995-06-18", status: "ACTIVE", terminal_id: "t-004" },
  { id: "op-007", email: "thomas.leroy@port.com", password: "Th0m@s#99", first_name: "Thomas", last_name: "Leroy", phone: "+33 6 33 44 55 66", gender: "MALE", birth_date: "1987-12-03", status: "ACTIVE", terminal_id: "t-003" },
  { id: "op-008", email: "emma.roux@port.com", password: "Emm@R0ux!", first_name: "Emma", last_name: "Roux", phone: "+33 6 77 88 99 00", gender: "FEMALE", birth_date: "1993-04-25", status: "ACTIVE", terminal_id: "t-005" },
]

export const terminals: Terminal[] = [
  { id: "t-001", name: "Terminal à Conteneurs", status: "ACTIVE", max_slots: 120, available_slots: 34, coordinates: { x: 36.7620, y: 3.0580 }, operators: ["op-001", "op-003"] },
  { id: "t-002", name: "Terminal Céréalier", status: "ACTIVE", max_slots: 80, available_slots: 12, coordinates: { x: 36.7550, y: 3.0650 }, operators: ["op-002", "op-005"] },
  { id: "t-003", name: "Terminal Roulier", status: "ACTIVE", max_slots: 200, available_slots: 90, coordinates: { x: 36.7480, y: 3.0720 }, operators: ["op-004", "op-007"] },
  { id: "t-004", name: "Terminal Hydrocarbures", status: "ACTIVE", max_slots: 150, available_slots: 67, coordinates: { x: 36.7700, y: 3.0500 }, operators: ["op-006"] },
  { id: "t-005", name: "Terminal Voyageurs", status: "ACTIVE", max_slots: 250, available_slots: 89, coordinates: { x: 36.7580, y: 3.0450 }, operators: ["op-008"] },
  { id: "t-006", name: "Terminal Vraquiers", status: "ACTIVE", max_slots: 180, available_slots: 45, coordinates: { x: 36.7650, y: 3.0750 }, operators: [] },
]

export const transporters: Transporter[] = [
  { id: "tr-001", name: "TransLog France", phone: "+33 1 23 45 67 89", status: "ACTIVE", registered_at: "2024-01-15", drivers: [
    { id: "d-001", name: "Marc Blanc", phone: "+33 6 01 02 03 04", license_number: "FR-DL-2024-001" },
    { id: "d-002", name: "Julie Noir", phone: "+33 6 05 06 07 08", license_number: "FR-DL-2024-002" },
  ]},
  { id: "tr-002", name: "Rapid Cargo", phone: "+33 1 98 76 54 32", status: "ACTIVE", registered_at: "2024-02-20", drivers: [
    { id: "d-003", name: "Alain Dupuis", phone: "+33 6 10 20 30 40", license_number: "FR-DL-2024-003" },
  ]},
  { id: "tr-003", name: "EuroTrans SARL", phone: "+33 1 11 22 33 44", status: "PENDING", registered_at: "2024-06-01", drivers: [
    { id: "d-004", name: "Sofia Reyes", phone: "+33 6 50 60 70 80", license_number: "FR-DL-2024-004" },
    { id: "d-005", name: "Karim Benali", phone: "+33 6 90 80 70 60", license_number: "FR-DL-2024-005" },
    { id: "d-006", name: "Luc Fontaine", phone: "+33 6 11 33 55 77", license_number: "FR-DL-2024-006" },
  ]},
  { id: "tr-004", name: "MedPort Logistics", phone: "+33 1 44 55 66 77", status: "SUSPENDED", registered_at: "2023-11-10", drivers: [
    { id: "d-007", name: "Ana Moretti", phone: "+33 6 22 44 66 88", license_number: "FR-DL-2023-007" },
  ]},
  { id: "tr-005", name: "Atlantic Freight", phone: "+33 1 88 77 66 55", status: "PENDING", registered_at: "2024-07-05", drivers: [] },
  { id: "tr-006", name: "Delta Transport", phone: "+33 1 55 44 33 22", status: "ACTIVE", registered_at: "2024-03-12", drivers: [
    { id: "d-008", name: "Yves Laurent", phone: "+33 6 33 22 11 00", license_number: "FR-DL-2024-008" },
    { id: "d-009", name: "Nadia Caron", phone: "+33 6 44 33 22 11", license_number: "FR-DL-2024-009" },
  ]},
]

export const anomalies: Anomaly[] = [
  { id: "a-001", title: "Terminal Overload Detected", description: "Terminal Nord is approaching maximum capacity. Only 34 slots remaining out of 120.", terminal_id: "t-001", terminal_name: "Terminal Nord", severity: "WARNING", timestamp: "2024-07-15T14:30:00Z", status: "OPEN" },
  { id: "a-002", title: "Unauthorized Access Attempt", description: "Multiple unauthorized access attempts detected at Terminal Sud gate B.", terminal_id: "t-002", terminal_name: "Terminal Sud", severity: "CRITICAL", timestamp: "2024-07-15T13:45:00Z", status: "OPEN" },
  { id: "a-003", title: "Equipment Malfunction", description: "Crane #3 at Terminal Maritime reported a sensor failure.", terminal_id: "t-006", terminal_name: "Terminal Maritime", severity: "WARNING", timestamp: "2024-07-15T12:00:00Z", status: "ACKNOWLEDGED" },
  { id: "a-004", title: "Delayed Shipment Arrival", description: "Cargo vessel MV-Aurora delayed by 6 hours at Terminal Central.", terminal_id: "t-005", terminal_name: "Terminal Central", severity: "INFO", timestamp: "2024-07-15T10:15:00Z", status: "OPEN" },
  { id: "a-005", title: "Fire Alarm Triggered", description: "Fire alarm triggered in warehouse section C of Terminal Ouest. No fire detected.", terminal_id: "t-004", terminal_name: "Terminal Ouest", severity: "CRITICAL", timestamp: "2024-07-15T09:30:00Z", status: "ACKNOWLEDGED" },
  { id: "a-006", title: "Network Connectivity Loss", description: "Terminal Est experienced a 15-minute network outage affecting slot management system.", terminal_id: "t-003", terminal_name: "Terminal Est", severity: "WARNING", timestamp: "2024-07-14T22:10:00Z", status: "ACKNOWLEDGED" },
]

export const notifications: Notification[] = [
  { id: "n-001", title: "Terminal Overload Warning", message: "Terminal Sud is at 85% capacity. Consider redirecting incoming cargo.", type: "TERMINAL_OVERLOAD", priority: "HIGH", timestamp: "2024-07-15T14:35:00Z", read: false },
  { id: "n-002", title: "Suspicious Gate Activity", message: "Unusual access patterns detected at Terminal Sud - Gate B between 01:00 and 03:00.", type: "SUSPICIOUS_ACTIVITY", priority: "HIGH", timestamp: "2024-07-15T13:50:00Z", read: false },
  { id: "n-003", title: "Extreme Delay Alert", message: "Vessel MV-Aurora delay extended to 8 hours. Impact on Terminal Central operations.", type: "EXTREME_DELAY", priority: "MEDIUM", timestamp: "2024-07-15T12:30:00Z", read: false },
  { id: "n-004", title: "System Maintenance", message: "Scheduled maintenance for slot management system tonight 02:00-04:00.", type: "SYSTEM", priority: "LOW", timestamp: "2024-07-15T10:00:00Z", read: true },
  { id: "n-005", title: "Terminal Nord Capacity", message: "Terminal Nord capacity reaching critical levels - 72% utilized.", type: "TERMINAL_OVERLOAD", priority: "MEDIUM", timestamp: "2024-07-15T09:00:00Z", read: true },
  { id: "n-006", title: "New Transporter Registration", message: "Atlantic Freight has submitted a registration request for validation.", type: "SYSTEM", priority: "LOW", timestamp: "2024-07-14T16:00:00Z", read: true },
]

export const terminalUtilizationData = [
  { time: "00:00", nord: 62, sud: 70, est: 0, ouest: 45, central: 58, maritime: 65 },
  { time: "04:00", nord: 58, sud: 72, est: 0, ouest: 42, central: 55, maritime: 68 },
  { time: "08:00", nord: 65, sud: 78, est: 0, ouest: 50, central: 60, maritime: 72 },
  { time: "12:00", nord: 72, sud: 85, est: 0, ouest: 55, central: 64, maritime: 75 },
  { time: "16:00", nord: 78, sud: 82, est: 0, ouest: 58, central: 68, maritime: 70 },
  { time: "20:00", nord: 71, sud: 80, est: 0, ouest: 52, central: 62, maritime: 73 },
  { time: "Now", nord: 72, sud: 85, est: 0, ouest: 55, central: 64, maritime: 75 },
]

export const operatorDistributionData = [
  { terminal: "Nord", operators: 2 },
  { terminal: "Sud", operators: 2 },
  { terminal: "Est", operators: 2 },
  { terminal: "Ouest", operators: 1 },
  { terminal: "Central", operators: 1 },
  { terminal: "Maritime", operators: 0 },
]
