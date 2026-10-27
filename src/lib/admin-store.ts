import { useSyncExternalStore } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HospitalStatus = "active" | "inactive" | "maintenance";
export type DoctorStatus = "available" | "serving" | "on_break" | "off_shift" | "unavailable";
export type QueueStatus = "waiting" | "serving" | "completed" | "no_show" | "cancelled";
export type EmergencyStatus = "new" | "acknowledged" | "resolved";
export type ErrorSeverity = "low" | "medium" | "high" | "critical";
export type ErrorStatus = "open" | "investigating" | "resolved" | "dismissed";

export interface Hospital {
  id: string;
  name: string;
  city: string;
  region: string;
  status: HospitalStatus;
  departments: string[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  hospitalId: string;
  department: string;
  room?: string;
  shiftStart?: string;
  shiftEnd?: string;
  status: DoctorStatus;
  breakCount: number;
  breakMinutes: number;
  breakStartedAt?: string;
  lastStatusChange: string;
  archived?: boolean;
}

export interface QueueEntry {
  id: string;
  token: string;
  hospitalId: string;
  department: string;
  doctorId?: string;
  registeredAt: string;
  completedAt?: string;
  status: QueueStatus;
}

export interface EmergencyReport {
  id: string;
  hospitalId: string;
  reportedAt: string;
  location?: string;
  category: string;
  status: EmergencyStatus;
  assignedTo?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface ErrorReport {
  id: string;
  reportedAt: string;
  source: string;
  title: string;
  description: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  owner?: string;
  resolutionNote?: string;
  resolvedAt?: string;
}

export interface ActivityEvent {
  id: string;
  type: string;
  at: string;
  refId: string;
  summary: string;
}

export interface DemoDB {
  version: number;
  createdAt: string;
  hospitals: Hospital[];
  doctors: Doctor[];
  queue: QueueEntry[];
  emergencies: EmergencyReport[];
  errors: ErrorReport[];
  activity: ActivityEvent[];
}

// ---------------------------------------------------------------------------
// Seed data — clearly fictional demonstration records
// ---------------------------------------------------------------------------

const ts = (daysBack: number, hoursOffset = 0) =>
  new Date(Date.now() - daysBack * 86400000 + hoursOffset * 3600000).toISOString();

function seedHospitals(): Hospital[] {
  const base = { createdAt: ts(30), updatedAt: ts(1) };
  return [
    {
      id: "HOSP-001",
      name: "City General Hospital",
      city: "Central District",
      region: "Metro City",
      status: "active",
      departments: ["General Medicine", "Cardiology", "Orthopaedics", "Pediatrics"],
      ...base,
    },
    {
      id: "HOSP-002",
      name: "Riverside Medical Center",
      city: "East Bank",
      region: "Metro City",
      status: "active",
      departments: ["General Medicine", "ENT", "Cardiology"],
      ...base,
    },
    {
      id: "HOSP-003",
      name: "Sunrise Community Hospital",
      city: "East Zone",
      region: "Metro City",
      status: "active",
      departments: ["General Medicine", "Orthopaedics", "Pediatrics"],
      ...base,
    },
    {
      id: "HOSP-004",
      name: "Lakeside Hospital",
      city: "West Zone",
      region: "Metro City",
      status: "maintenance",
      departments: ["General Medicine", "Dermatology", "Neurology"],
      ...base,
    },
    {
      id: "HOSP-005",
      name: "Metro Care Hospital",
      city: "Uptown",
      region: "Metro City",
      status: "active",
      departments: ["General Medicine", "Cardiology", "Orthopaedics", "Pediatrics", "ENT"],
      ...base,
    },
  ];
}

function seedDoctors(): Doctor[] {
  const d = (
    id: string,
    name: string,
    hospitalId: string,
    department: string,
    room: string,
    shiftStart: string,
    shiftEnd: string,
    status: DoctorStatus,
    breakCount = 1,
    breakMinutes = 30,
    lastDays = 1,
  ): Doctor => ({
    id,
    name,
    hospitalId,
    department,
    room,
    shiftStart,
    shiftEnd,
    status,
    breakCount,
    breakMinutes,
    lastStatusChange: ts(lastDays, -2),
  });
  return [
    d(
      "DR-001",
      "Dr. Priya Sharma",
      "HOSP-001",
      "General Medicine",
      "Room 101",
      "08:00",
      "16:00",
      "available",
      1,
      25,
    ),
    d(
      "DR-002",
      "Dr. Rohan Mehta",
      "HOSP-001",
      "Orthopaedics",
      "Room 204",
      "09:00",
      "17:00",
      "serving",
      0,
      0,
    ),
    d(
      "DR-003",
      "Dr. Ananya Iyer",
      "HOSP-001",
      "Pediatrics",
      "Room 112",
      "08:00",
      "14:00",
      "on_break",
      2,
      55,
      0,
    ),
    d(
      "DR-004",
      "Dr. Vikram Singh",
      "HOSP-001",
      "Cardiology",
      "Room 210",
      "10:00",
      "18:00",
      "available",
      1,
      20,
    ),
    d(
      "DR-005",
      "Dr. Neha Kapoor",
      "HOSP-002",
      "General Medicine",
      "Room 104",
      "08:30",
      "16:30",
      "available",
      1,
      30,
    ),
    d(
      "DR-006",
      "Dr. Arjun Nair",
      "HOSP-002",
      "ENT",
      "Room 118",
      "09:00",
      "17:00",
      "serving",
      1,
      15,
    ),
    d(
      "DR-007",
      "Dr. Kavya Reddy",
      "HOSP-002",
      "Cardiology",
      "Room 121",
      "10:00",
      "18:00",
      "off_shift",
      0,
      0,
      2,
    ),
    d(
      "DR-008",
      "Dr. Sameer Gupta",
      "HOSP-003",
      "Orthopaedics",
      "Room 205",
      "08:00",
      "16:00",
      "available",
      1,
      35,
    ),
    d(
      "DR-009",
      "Dr. Meera Joshi",
      "HOSP-003",
      "Pediatrics",
      "Room 109",
      "09:00",
      "15:00",
      "available",
      2,
      40,
    ),
    d(
      "DR-010",
      "Dr. Aditya Verma",
      "HOSP-003",
      "General Medicine",
      "Room 103",
      "08:00",
      "16:00",
      "on_break",
      1,
      10,
      0,
    ),
    d(
      "DR-011",
      "Dr. Pooja Desai",
      "HOSP-004",
      "Dermatology",
      "Room 207",
      "10:00",
      "18:00",
      "off_shift",
      0,
      0,
      3,
    ),
    d(
      "DR-012",
      "Dr. Rahul Bhat",
      "HOSP-004",
      "Neurology",
      "Room 215",
      "09:00",
      "17:00",
      "available",
      1,
      25,
    ),
    d(
      "DR-013",
      "Dr. Sneha Pillai",
      "HOSP-004",
      "General Medicine",
      "Room 102",
      "08:00",
      "16:00",
      "unavailable",
      1,
      20,
      4,
    ),
    d(
      "DR-014",
      "Dr. Karan Malhotra",
      "HOSP-005",
      "Cardiology",
      "Room 301",
      "09:00",
      "17:00",
      "serving",
      1,
      30,
    ),
    d(
      "DR-015",
      "Dr. Divya Menon",
      "HOSP-005",
      "General Medicine",
      "Room 305",
      "08:00",
      "16:00",
      "available",
      2,
      50,
    ),
    d(
      "DR-016",
      "Dr. Suresh Rao",
      "HOSP-005",
      "Orthopaedics",
      "Room 312",
      "08:00",
      "16:00",
      "available",
      0,
      0,
    ),
    d(
      "DR-017",
      "Dr. Ritika Sen",
      "HOSP-005",
      "Pediatrics",
      "Room 308",
      "09:00",
      "15:00",
      "available",
      1,
      15,
    ),
    d(
      "DR-018",
      "Dr. Manav Shah",
      "HOSP-005",
      "ENT",
      "Room 316",
      "10:00",
      "18:00",
      "off_shift",
      0,
      0,
      2,
    ),
  ];
}

const HISTORY_PATTERN: QueueStatus[] = [
  "completed",
  "completed",
  "no_show",
  "completed",
  "cancelled",
  "completed",
  "completed",
];

function seedQueue(doctors: Doctor[]): QueueEntry[] {
  const defs: { hosp: string; prefix: string; depts: string[] }[] = [
    {
      hosp: "HOSP-001",
      prefix: "A",
      depts: ["General Medicine", "Cardiology", "Orthopaedics", "Pediatrics"],
    },
    { hosp: "HOSP-002", prefix: "B", depts: ["General Medicine", "ENT", "Cardiology"] },
    { hosp: "HOSP-003", prefix: "C", depts: ["General Medicine", "Orthopaedics", "Pediatrics"] },
    { hosp: "HOSP-004", prefix: "D", depts: ["General Medicine", "Dermatology", "Neurology"] },
    {
      hosp: "HOSP-005",
      prefix: "E",
      depts: ["General Medicine", "Cardiology", "Orthopaedics", "Pediatrics", "ENT"],
    },
  ];
  const out: QueueEntry[] = [];
  for (const def of defs) {
    let num = 101;
    for (let day = 0; day < 14; day++) {
      const count = 4 + ((day + def.prefix.length) % 3);
      for (let i = 0; i < count; i++) {
        const department = def.depts[(i + day) % def.depts.length]!;
        const doc = doctors.find(
          (x) =>
            x.hospitalId === def.hosp && x.department === department && x.status !== "off_shift",
        );
        const registeredAt = ts(day, -(i + 2));
        let status: QueueStatus;
        let completedAt: string | undefined;
        if (day === 0) {
          status = (["waiting", "waiting", "serving", "completed", "no_show"] as QueueStatus[])[
            i % 5
          ]!;
          if (status === "completed") completedAt = ts(0, -(i + 1) + 0.4);
        } else {
          status = HISTORY_PATTERN[(i + day) % HISTORY_PATTERN.length]!;
          if (status === "completed") completedAt = ts(day, -(i + 2) + 0.5);
        }
        out.push({
          id: `Q-${def.hosp.slice(-3)}-${num}`,
          token: `${def.prefix}${num}`,
          hospitalId: def.hosp,
          department,
          ...(doc === undefined ? {} : { doctorId: doc.id }),
          registeredAt,
          ...(completedAt === undefined ? {} : { completedAt }),
          status,
        });
        num++;
      }
    }
  }
  return out;
}

function seedEmergencies(): EmergencyReport[] {
  return [
    {
      id: "ER-001",
      hospitalId: "HOSP-001",
      reportedAt: ts(0, -1),
      location: "Cardiology corridor · Floor 2",
      category: "Wheelchair assistance",
      status: "acknowledged",
      assignedTo: "Front Desk Team A",
    },
    {
      id: "ER-002",
      hospitalId: "HOSP-001",
      reportedAt: ts(0, -3),
      location: "General Medicine · Floor 1",
      category: "Patient feeling unwell",
      status: "new",
    },
    {
      id: "ER-003",
      hospitalId: "HOSP-002",
      reportedAt: ts(1, -2),
      location: "Cardiology waiting area",
      category: "Elderly patient needs help",
      status: "resolved",
      assignedTo: "Nursing Team B",
      resolvedAt: ts(1),
      notes: "Staff escorted the patient to the consultation room.",
    },
    {
      id: "ER-004",
      hospitalId: "HOSP-003",
      reportedAt: ts(2, -5),
      location: "Orthopaedics · Floor 1",
      category: "Wheelchair assistance",
      status: "resolved",
      assignedTo: "Front Desk Team C",
      resolvedAt: ts(2, -4),
      notes: "Wheelchair arranged within four minutes.",
    },
    {
      id: "ER-005",
      hospitalId: "HOSP-005",
      reportedAt: ts(1, -6),
      location: "Radiology · Ground floor",
      category: "Patient feeling unwell",
      status: "acknowledged",
      assignedTo: "Nursing Team A",
    },
    {
      id: "ER-006",
      hospitalId: "HOSP-004",
      reportedAt: ts(3, -1),
      location: "Main lobby",
      category: "Assistance request",
      status: "new",
    },
  ];
}

function seedErrors(): ErrorReport[] {
  return [
    {
      id: "ERR-001",
      reportedAt: ts(0, -2),
      source: "Integration",
      title: "WhatsApp API timeout",
      description: "Notification gateway timed out while sending queue updates to demo recipients.",
      severity: "critical",
      status: "investigating",
      owner: "Platform team",
    },
    {
      id: "ERR-002",
      reportedAt: ts(0, -8),
      source: "Patient app",
      title: "Map data not loading",
      description: "Hospital map tiles failed to load on the patient directions screen.",
      severity: "high",
      status: "open",
    },
    {
      id: "ERR-003",
      reportedAt: ts(2, -4),
      source: "Queue",
      title: "Database connection lost",
      description: "Queue updates briefly failed during a demo database maintenance window.",
      severity: "critical",
      status: "resolved",
      owner: "Platform team",
      resolutionNote: "Connection restored after maintenance; queue resumed from last token.",
      resolvedAt: ts(2, -2),
    },
    {
      id: "ERR-004",
      reportedAt: ts(1, -7),
      source: "Integration",
      title: "SMS delivery failed",
      description: "Two demo SMS notifications were not delivered to the test numbers.",
      severity: "medium",
      status: "open",
    },
    {
      id: "ERR-005",
      reportedAt: ts(4, -3),
      source: "Queue",
      title: "Queue update error",
      description: "A token status change did not refresh the department view until manual reload.",
      severity: "low",
      status: "dismissed",
      resolutionNote: "Could not reproduce after caching fix.",
      resolvedAt: ts(3, -1),
    },
    {
      id: "ERR-006",
      reportedAt: ts(1, -1),
      source: "Admin console",
      title: "Slow dashboard load",
      description:
        "Overview metrics took noticeably longer than usual to render on the demo dataset.",
      severity: "medium",
      status: "open",
    },
    {
      id: "ERR-007",
      reportedAt: ts(5, -2),
      source: "Notification",
      title: "Notification not delivered",
      description: "A scheduled demo reminder was not delivered to subscribed patients.",
      severity: "high",
      status: "investigating",
      owner: "Platform team",
    },
  ];
}

function seedActivity(): ActivityEvent[] {
  return [
    {
      id: "ACT-001",
      type: "emergency.status",
      at: ts(1, -2),
      refId: "ER-003",
      summary: "Emergency report ER-003 marked resolved",
    },
    {
      id: "ACT-002",
      type: "doctor.break_end",
      at: ts(1, -1),
      refId: "DR-005",
      summary: "Dr. Neha Kapoor ended a 30 min break",
    },
    {
      id: "ACT-003",
      type: "doctor.break_start",
      at: ts(1, -1.5),
      refId: "DR-005",
      summary: "Dr. Neha Kapoor started a break",
    },
    {
      id: "ACT-004",
      type: "error.status",
      at: ts(2, -2),
      refId: "ERR-003",
      summary: "Error report ERR-003 marked resolved",
    },
    {
      id: "ACT-005",
      type: "hospital.status",
      at: ts(3, -1),
      refId: "HOSP-004",
      summary: "Lakeside Hospital set to Maintenance",
    },
    {
      id: "ACT-006",
      type: "doctor.status",
      at: ts(3, -2),
      refId: "DR-013",
      summary: "Dr. Sneha Pillai marked Unavailable",
    },
    {
      id: "ACT-007",
      type: "queue.status",
      at: ts(4, -1),
      refId: "Q-001-101",
      summary: "Token A101 marked Completed",
    },
    {
      id: "ACT-008",
      type: "hospital.added",
      at: ts(6),
      refId: "HOSP-005",
      summary: "Metro Care Hospital added to the demo network",
    },
  ];
}

export function buildSeed(): DemoDB {
  const hospitals = seedHospitals();
  const doctors = seedDoctors();
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    hospitals,
    doctors,
    queue: seedQueue(doctors),
    emergencies: seedEmergencies(),
    errors: seedErrors(),
    activity: seedActivity(),
  };
}

// ---------------------------------------------------------------------------
// Store — client-side demo persistence (localStorage of this browser only)
// ---------------------------------------------------------------------------

const STORAGE_KEY = "sahai_setu_admin_demo_v1";

let db: DemoDB = buildSeed();
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage may be unavailable; demo continues in memory only.
  }
}

/** Loads the browser's saved demo dataset once, after first render (SSR-safe). */
export function loadPersisted(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoDB;
      if (parsed && parsed.version === 1) db = parsed;
    }
  } catch {
    // Corrupt data — keep the seed.
  }
  notify();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useAdminDB(): DemoDB {
  return useSyncExternalStore(subscribe, getDB, getDB);
}

export function getDB(): DemoDB {
  return db;
}

function commit(patch: Partial<DemoDB>, event?: { type: string; refId: string; summary: string }) {
  const activity = event
    ? [
        {
          id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          at: new Date().toISOString(),
          ...event,
        },
        ...db.activity,
      ].slice(0, 200)
    : db.activity;
  db = { ...db, ...patch, activity };
  persist();
  notify();
}

// ---------------------------------------------------------------------------
// Mutations — every change logs an activity entry and updates the shared store
// ---------------------------------------------------------------------------

export function addHospital(data: {
  name: string;
  city: string;
  region: string;
  status: HospitalStatus;
  departments: string[];
}): Hospital {
  const now = new Date().toISOString();
  const existing = new Set(db.hospitals.map((h) => h.id));
  let n = db.hospitals.length + 1;
  let id = `HOSP-${String(n).padStart(3, "0")}`;
  while (existing.has(id)) id = `HOSP-${String(++n).padStart(3, "0")}`;
  const hospital: Hospital = { id, ...data, createdAt: now, updatedAt: now };
  commit(
    { hospitals: [...db.hospitals, hospital] },
    { type: "hospital.added", refId: id, summary: `${data.name} added to the demo network` },
  );
  return hospital;
}

export function updateHospital(
  id: string,
  patch: Partial<Pick<Hospital, "name" | "city" | "region" | "status" | "departments">>,
) {
  const h = db.hospitals.find((x) => x.id === id);
  if (!h) return;
  const hospitals = db.hospitals.map((x) =>
    x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x,
  );
  commit(
    { hospitals },
    { type: "hospital.updated", refId: id, summary: `${patch.name ?? h.name} details updated` },
  );
}

export function setHospitalStatus(id: string, status: HospitalStatus) {
  const h = db.hospitals.find((x) => x.id === id);
  if (!h) return;
  const hospitals = db.hospitals.map((x) =>
    x.id === id ? { ...x, status, updatedAt: new Date().toISOString() } : x,
  );
  commit(
    { hospitals },
    {
      type: "hospital.status",
      refId: id,
      summary: `${h.name} set to ${status.charAt(0).toUpperCase()}${status.slice(1)}`,
    },
  );
}

export function archiveHospital(id: string) {
  const h = db.hospitals.find((x) => x.id === id);
  if (!h) return;
  const hospitals = db.hospitals.map((x) =>
    x.id === id ? { ...x, archived: true, updatedAt: new Date().toISOString() } : x,
  );
  commit(
    { hospitals },
    {
      type: "hospital.archived",
      refId: id,
      summary: `${h.name} archived (soft removal — can be restored)`,
    },
  );
}

export function restoreHospital(id: string) {
  const h = db.hospitals.find((x) => x.id === id);
  if (!h) return;
  const hospitals = db.hospitals.map((x) =>
    x.id === id ? { ...x, archived: false, updatedAt: new Date().toISOString() } : x,
  );
  commit(
    { hospitals },
    { type: "hospital.restored", refId: id, summary: `${h.name} restored from archive` },
  );
}

export function addDoctor(data: {
  name: string;
  hospitalId: string;
  department: string;
  room?: string;
  shiftStart?: string;
  shiftEnd?: string;
  status?: DoctorStatus;
}) {
  const existing = new Set(db.doctors.map((x) => x.id));
  let n = db.doctors.length + 1;
  let id = `DR-${String(n).padStart(3, "0")}`;
  while (existing.has(id)) id = `DR-${String(++n).padStart(3, "0")}`;
  const doctor: Doctor = {
    id,
    name: data.name,
    hospitalId: data.hospitalId,
    department: data.department,
    ...(data.room === undefined ? {} : { room: data.room }),
    ...(data.shiftStart === undefined ? {} : { shiftStart: data.shiftStart }),
    ...(data.shiftEnd === undefined ? {} : { shiftEnd: data.shiftEnd }),
    status: data.status ?? "available",
    breakCount: 0,
    breakMinutes: 0,
    lastStatusChange: new Date().toISOString(),
  };
  commit(
    { doctors: [...db.doctors, doctor] },
    { type: "doctor.added", refId: id, summary: `${data.name} added to the roster` },
  );
}

export function updateDoctor(
  id: string,
  patch: Partial<
    Pick<Doctor, "name" | "hospitalId" | "department" | "room" | "shiftStart" | "shiftEnd">
  >,
) {
  const doc = db.doctors.find((x) => x.id === id);
  if (!doc) return;
  const doctors = db.doctors.map((x) => (x.id === id ? { ...x, ...patch } : x));
  commit(
    { doctors },
    { type: "doctor.updated", refId: id, summary: `${patch.name ?? doc.name} details updated` },
  );
}

export function setDoctorStatus(id: string, status: DoctorStatus) {
  const doc = db.doctors.find((x) => x.id === id);
  if (!doc) return;
  const doctors = db.doctors.map((x) => {
    if (x.id !== id) return x;
    const { breakStartedAt: _breakStartedAt, ...rest } = x;
    return { ...rest, status, lastStatusChange: new Date().toISOString() };
  });
  commit(
    { doctors },
    { type: "doctor.status", refId: id, summary: `${doc.name} marked ${status.replace("_", " ")}` },
  );
}

export function startBreak(id: string) {
  const doc = db.doctors.find((x) => x.id === id);
  if (!doc || doc.status === "on_break") return;
  const doctors = db.doctors.map((x) =>
    x.id === id
      ? {
          ...x,
          status: "on_break" as DoctorStatus,
          breakStartedAt: new Date().toISOString(),
          lastStatusChange: new Date().toISOString(),
        }
      : x,
  );
  commit(
    { doctors },
    { type: "doctor.break_start", refId: id, summary: `${doc.name} started a break` },
  );
}

export function endBreak(id: string) {
  const doc = db.doctors.find((x) => x.id === id);
  if (!doc || doc.status !== "on_break" || !doc.breakStartedAt) return;
  const minutes = Math.max(
    1,
    Math.round((Date.now() - new Date(doc.breakStartedAt).getTime()) / 60000),
  );
  const doctors = db.doctors.map((x) =>
    x.id === id
      ? (() => {
          const { breakStartedAt: _breakStartedAt, ...rest } = x;
          return {
            ...rest,
            status: "available" as DoctorStatus,
            breakCount: x.breakCount + 1,
            breakMinutes: x.breakMinutes + minutes,
            lastStatusChange: new Date().toISOString(),
          };
        })()
      : x,
  );
  commit(
    { doctors },
    { type: "doctor.break_end", refId: id, summary: `${doc.name} ended a ${minutes} min break` },
  );
}

export function setQueueStatus(id: string, status: QueueStatus) {
  const entry = db.queue.find((x) => x.id === id);
  if (!entry) return;
  const queue = db.queue.map((x) => {
    if (x.id !== id) return x;
    if (status === "completed") return { ...x, status, completedAt: new Date().toISOString() };
    const { completedAt: _completedAt, ...rest } = x;
    return { ...rest, status };
  });
  commit(
    { queue },
    {
      type: "queue.status",
      refId: id,
      summary: `Token ${entry.token} marked ${status.replace("_", " ")}`,
    },
  );
}

export function setEmergencyStatus(id: string, status: EmergencyStatus, notes?: string) {
  const rep = db.emergencies.find((x) => x.id === id);
  if (!rep) return;
  const emergencies = db.emergencies.map((x) => {
    if (x.id !== id) return x;
    const next = { ...x, status };
    const nextWithNotes = notes === undefined ? next : { ...next, notes };
    if (status === "resolved") return { ...nextWithNotes, resolvedAt: new Date().toISOString() };
    const { resolvedAt: _resolvedAt, ...rest } = nextWithNotes;
    return rest;
  });
  commit(
    { emergencies },
    { type: "emergency.status", refId: id, summary: `Emergency report ${id} marked ${status}` },
  );
}

export function assignEmergency(id: string, assignedTo: string) {
  const rep = db.emergencies.find((x) => x.id === id);
  if (!rep) return;
  const emergencies = db.emergencies.map((x) =>
    x.id === id ? { ...x, assignedTo, status: x.status === "new" ? "acknowledged" : x.status } : x,
  );
  commit(
    { emergencies },
    {
      type: "emergency.assigned",
      refId: id,
      summary: `Emergency report ${id} assigned to ${assignedTo}`,
    },
  );
}

export function addErrorReport(data: {
  source: string;
  title: string;
  description: string;
  severity: ErrorSeverity;
}) {
  const existing = new Set(db.errors.map((x) => x.id));
  let n = db.errors.length + 1;
  let id = `ERR-${String(n).padStart(3, "0")}`;
  while (existing.has(id)) id = `ERR-${String(++n).padStart(3, "0")}`;
  const report: ErrorReport = { id, reportedAt: new Date().toISOString(), status: "open", ...data };
  commit(
    { errors: [report, ...db.errors] },
    { type: "error.added", refId: id, summary: `Error report ${id} filed: ${data.title}` },
  );
}

export function setErrorStatus(id: string, status: ErrorStatus, resolutionNote?: string) {
  const rep = db.errors.find((x) => x.id === id);
  if (!rep) return;
  const errors = db.errors.map((x) => {
    if (x.id !== id) return x;
    const next = { ...x, status };
    const nextWithNote = resolutionNote === undefined ? next : { ...next, resolutionNote };
    if (status === "resolved" || status === "dismissed")
      return { ...nextWithNote, resolvedAt: new Date().toISOString() };
    const { resolvedAt: _resolvedAt, ...rest } = nextWithNote;
    return rest;
  });
  commit(
    { errors },
    { type: "error.status", refId: id, summary: `Error report ${id} marked ${status}` },
  );
}

export function resetDemoData() {
  db = buildSeed();
  persist();
  notify();
}

// ---------------------------------------------------------------------------
// Derived metrics — always computed from the shared store
// ---------------------------------------------------------------------------

export type Range = "7d" | "30d" | "all";

export function rangeStartMs(range: Range): number {
  if (range === "all") return 0;
  return Date.now() - (range === "7d" ? 7 : 30) * 86400000;
}

const activeHospitals = (db: DemoDB) => db.hospitals.filter((h) => !h.archived);
const inRange = (iso: string | undefined, start: number) =>
  !!iso && new Date(iso).getTime() >= start;

export interface Stats {
  served: number;
  pending: number;
  noShow: number;
  emergencyTotal: number;
  emergencyOpen: number;
  openErrors: number;
}

export function doctorStats(db: DemoDB, doctorId: string, range: Range) {
  const start = rangeStartMs(range);
  const mine = db.queue.filter((q) => q.doctorId === doctorId);
  return {
    served: mine.filter((q) => q.status === "completed" && inRange(q.completedAt, start)).length,
    pending: mine.filter((q) => q.status === "waiting" || q.status === "serving").length,
    noShow: mine.filter((q) => q.status === "no_show" && inRange(q.registeredAt, start)).length,
  };
}

export function hospitalStats(
  db: DemoDB,
  hospitalId: string,
  range: Range,
): Stats & { onDuty: number; serving: number } {
  const start = rangeStartMs(range);
  const hosp = db.hospitals.find((h) => h.id === hospitalId);
  const q = db.queue.filter((x) => x.hospitalId === hospitalId);
  const docs = db.doctors.filter((d) => d.hospitalId === hospitalId && !d.archived);
  return {
    served: q.filter((x) => x.status === "completed" && inRange(x.completedAt, start)).length,
    pending: q.filter((x) => x.status === "waiting" || x.status === "serving").length,
    noShow: q.filter((x) => x.status === "no_show" && inRange(x.registeredAt, start)).length,
    emergencyTotal: db.emergencies.filter(
      (x) => x.hospitalId === hospitalId && inRange(x.reportedAt, start),
    ).length,
    emergencyOpen: db.emergencies.filter(
      (x) => x.hospitalId === hospitalId && x.status !== "resolved",
    ).length,
    openErrors: 0,
    onDuty: docs.filter((d) => d.status === "available" || d.status === "serving").length,
    serving: docs.filter((d) => d.status === "serving").length,
    ...(hosp ? {} : {}),
  };
}

export function networkStats(db: DemoDB, range: Range) {
  const start = rangeStartMs(range);
  const hosp = activeHospitals(db);
  const hospIds = new Set(hosp.map((h) => h.id));
  const q = db.queue.filter((x) => hospIds.has(x.hospitalId));
  return {
    hospitals: hosp.length,
    activeHospitals: hosp.filter((h) => h.status === "active").length,
    doctors: db.doctors.filter((d) => hospIds.has(d.hospitalId) && !d.archived).length,
    served: q.filter((x) => x.status === "completed" && inRange(x.completedAt, start)).length,
    pending: q.filter((x) => x.status === "waiting" || x.status === "serving").length,
    noShow: q.filter((x) => x.status === "no_show" && inRange(x.registeredAt, start)).length,
    emergencyCases: db.emergencies.filter(
      (x) => hospIds.has(x.hospitalId) && inRange(x.reportedAt, start),
    ).length,
    openErrors: db.errors.filter((x) => x.status === "open" || x.status === "investigating").length,
  };
}

export function statusCounts(db: DemoDB, range: Range) {
  const start = rangeStartMs(range);
  const hospIds = new Set(activeHospitals(db).map((h) => h.id));
  const q = db.queue.filter((x) => hospIds.has(x.hospitalId) && inRange(x.registeredAt, start));
  return {
    waiting: q.filter((x) => x.status === "waiting").length,
    serving: q.filter((x) => x.status === "serving").length,
    completed: q.filter((x) => x.status === "completed").length,
    no_show: q.filter((x) => x.status === "no_show").length,
    cancelled: q.filter((x) => x.status === "cancelled").length,
  };
}

export function volumeByDay(
  db: DemoDB,
  days: number,
  hospitalId?: string,
): { label: string; value: number }[] {
  const hospIds = hospitalId
    ? new Set([hospitalId])
    : new Set(activeHospitals(db).map((h) => h.id));
  const out: { label: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const value = db.queue.filter((x) => {
      const t = new Date(x.registeredAt).getTime();
      return hospIds.has(x.hospitalId) && t >= dayStart.getTime() && t < dayEnd.getTime();
    }).length;
    out.push({
      label: `${dayStart.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dayStart.getMonth()]}`,
      value,
    });
  }
  return out;
}
