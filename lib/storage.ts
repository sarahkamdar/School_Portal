"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { initialData, PRESET_ADMIN } from "./data"
import type { AppData, Session, ClassRoom, Student, Teacher, TimetableEntry, Exam } from "./types"

const APP_KEY = "school_portal_app"
const SESSION_KEY = "school_portal_session"

function load(): AppData {
  if (typeof window === "undefined") return initialData
  const raw = localStorage.getItem(APP_KEY)
  if (!raw) return initialData
  try {
    return JSON.parse(raw) as AppData
  } catch {
    return initialData
  }
}
function save(data: AppData) {
  if (typeof window === "undefined") return
  localStorage.setItem(APP_KEY, JSON.stringify(data))
}
function loadSession(): Session {
  if (typeof window === "undefined") return { role: null }
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return { role: null }
  try {
    return JSON.parse(raw) as Session
  } catch {
    return { role: null }
  }
}
function saveSession(session: Session) {
  if (typeof window === "undefined") return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function useAppData() {
  const fetcher = async () => {
    if (typeof window === "undefined") return initialData
    try {
      const res = await fetch("/api/app-data")
      if (!res.ok) return load()
      const json = await res.json()
      if (!json.ok) return load()
      const d = json.data
      const normalize = (x: any) => JSON.parse(JSON.stringify(x || {}))
      const data: AppData = {
        classes: (d.classes || []).map((c: any) => ({ id: c.id ?? `c${c.name}${c.section}`, name: c.name, section: c.section, subjects: c.subjects || [], fees: c.fees || {} })),
        students: (d.students || []).map((s: any) => ({ id: s.id, name: s.name, gender: s.gender, classId: s.classId, rollNo: s.rollNo, attendance: normalize(s.attendance), feesPaid: normalize(s.feesPaid), marks: normalize(s.marks) })),
        teachers: (d.teachers || []).map((t: any) => ({ id: t.id, name: t.name, subject: t.subject, password: t.password, isClassTeacher: !!t.isClassTeacher, classId: t.classId })),
        classTimetables: (d.classTimetables || []).map((tt: any) => ({ classId: tt.classId, entries: tt.entries || [] })),
        notices: (d.notices || []).map((n: any) => ({ id: String(n._id ?? n.id), title: n.title, message: n.message, createdAt: n.createdAt, active: n.active !== false })),
        exams: (d.exams || []).map((e: any) => ({ id: e.id, classId: e.classId, name: e.name, totalMarks: e.totalMarks, date: e.date })),
        subjects: (d.subjects || []).map((s: any) => ({ id: s.id, name: s.name, code: s.code, type: s.type, classId: s.classId })),
        fees: (d.fees || []).map((f: any) => ({ id: f.id, classId: f.classId, type: f.type, amount: f.amount, applicableGender: f.applicableGender, dueDate: f.dueDate })),
      }
      // keep a local mirror for offline
      save(data)
      return data
    } catch {
      return load()
    }
  }
  // Use initialData as fallback for both server and client to ensure consistency
  const { data } = useSWR<AppData>("app-data", fetcher, { fallbackData: initialData })
  return data!
}
async function update(producer: (draft: AppData) => void) {
  const current = load()
  producer(current)
  save(current)
  await globalMutate("app-data", current, false)
}

export const actions = {
  // Auth
  loginTeacher: async (id: string, password: string) => {
    try {
      const res = await fetch(`/api/teachers/${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error("Invalid Teacher ID or password")
      const json = await res.json()
      const t = json.data
      if (!t || t.password !== password) throw new Error("Invalid Teacher ID or password")
      saveSession({ role: "teacher", teacherId: t.id })
      await globalMutate("session", loadSession(), false)
    } catch (e) {
      const d = load()
      const teacher = d.teachers.find((t) => t.id === id && t.password === password)
      if (!teacher) throw e
      saveSession({ role: "teacher", teacherId: teacher.id })
      await globalMutate("session", loadSession(), false)
    }
  },
  loginAdminPreset: async () => {
    // preset admin
    saveSession({ role: "admin" })
    await globalMutate("session", loadSession(), false)
  },
  logout: async () => {
    saveSession({ role: null })
    await globalMutate("session", loadSession(), false)
  },

  // Classes
  addClass: async (cls: { name: string; section?: string }) => {
    try {
      await fetch("/api/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cls) })
    } finally {
      await globalMutate("app-data")
    }
  },
  addSubjectToClass: async (classId: string, subject: string) => {
    try {
      await fetch(`/api/classes/${encodeURIComponent(classId)}/subjects`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject }) })
    } finally {
      await globalMutate("app-data")
    }
  },
  // Subjects API
  addSubject: async (subject: { name: string; classId: string }) => {
    try {
      await fetch("/api/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subject) })
    } finally {
      await globalMutate("app-data")
    }
  },
  setClassFees: async (classId: string, fees: ClassRoom["fees"]) => {
    try {
      await fetch(`/api/classes/${encodeURIComponent(classId)}/fees`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fees) })
    } finally {
      await globalMutate("app-data")
    }
  },
  // New fees API
  addFee: async (fee: { classId: string; type: "admission" | "education" | "exam" | "term" | "utilities" | "other"; amount: number; applicableGender: "Male" | "Female" | "Both"; dueDate?: string }) => {
    try {
      await fetch("/api/fees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fee) })
    } finally {
      await globalMutate("app-data")
    }
  },
  deleteClass: async (
    classId: string,
    opts: {
      reassignStudentsTo?: string | null
      deleteStudents?: boolean
      unassignTeachers?: boolean
      deleteTeachers?: boolean
    },
  ) => {
    try {
      await fetch(`/api/classes/${encodeURIComponent(classId)}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(opts) })
    } finally {
      await globalMutate("app-data")
    }
  },

  // Students
  addStudent: async (student: Omit<Student, "id" | "admissionNo" | "rollNo" | "attendance" | "feesPaid" | "marks">) => {
    try {
      await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(student) })
    } finally {
      await globalMutate("app-data")
    }
  },
  reassignStudent: async (studentId: string, newClassId: string) => {
    try {
      await fetch(`/api/students/${encodeURIComponent(studentId)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId: newClassId }) })
    } finally {
      await globalMutate("app-data")
    }
  },
  deleteStudentPermanent: async (studentId: string) => {
    try {
      await fetch(`/api/students/${encodeURIComponent(studentId)}`, { method: "DELETE" })
    } finally {
      await globalMutate("app-data")
    }
  },
  markFeePaid: async (studentId: string, key: keyof Student["feesPaid"]) => {
    try {
      await fetch(`/api/students/${encodeURIComponent(studentId)}/fees`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, paid: true }) })
    } finally {
      await globalMutate("app-data")
    }
  },
  markFeeUnpaid: async (studentId: string, key: keyof Student["feesPaid"]) => {
    try {
      await fetch(`/api/students/${encodeURIComponent(studentId)}/fees`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, paid: false }) })
    } finally {
      await globalMutate("app-data")
    }
  },

  // Teachers
  addTeacher: async (t: Omit<Teacher, "id" | "password" | "isClassTeacher" | "classId"> & { id?: string; password?: string; isClassTeacher?: boolean; classId?: string }) => {
    try {
      await fetch("/api/teachers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) })
    } finally {
      await globalMutate("app-data")
    }
  },
  unassignTeacher: async (teacherId: string) => {
    try {
      await fetch(`/api/teachers/${encodeURIComponent(teacherId)}/unassign`, { method: "POST" })
    } finally {
      await globalMutate("app-data")
    }
  },
  reassignTeacherSubjects: async (fromTeacherId: string, toTeacherId: string) => {
    try {
      await fetch(`/api/teachers/${encodeURIComponent(fromTeacherId)}/reassign-subjects`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toTeacherId }) })
    } finally {
      await globalMutate("app-data")
    }
  },
  deleteTeacherPermanent: async (teacherId: string) => {
    try {
      await fetch(`/api/teachers/${encodeURIComponent(teacherId)}`, { method: "DELETE" })
    } finally {
      await globalMutate("app-data")
    }
  },

  // Class-Teacher Assignments
  assignTeacherToClass: async (classId: string, teacherId: string) => {
    try {
      await fetch("/api/class-teacher", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ classId, teacherId }) 
      })
    } finally {
      await globalMutate("app-data")
    }
  },
  unassignTeacherFromClass: async (classId: string) => {
    try {
      await fetch(`/api/class-teacher?classId=${encodeURIComponent(classId)}`, { method: "DELETE" })
    } finally {
      await globalMutate("app-data")
    }
  },

  // Timetable
  setClassTimetable: async (classId: string, entries: TimetableEntry[]) => {
    try {
      await fetch(`/api/timetable/${encodeURIComponent(classId)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entries }) })
    } finally {
      await globalMutate("app-data")
    }
  },

  // Attendance (only class teachers can mark; admin views summary)
  setAttendance: async (
    classId: string,
    date: string,
    present: Record<string, boolean>,
  ) => {
    try {
      await fetch(`/api/attendance/${encodeURIComponent(classId)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, present }) })
    } finally {
      await globalMutate("app-data")
    }
  },

  // Notices
  createNotice: async (title: string, message: string) => {
    try {
      await fetch("/api/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, message, active: true }) })
    } finally {
      await globalMutate("app-data")
      await globalMutate("/api/notices")
    }
  },

  // Exams
  createExam: async (ex: { classId: string; name: string; totalMarks: number; passingMarks: number }) => {
    try {
      await fetch("/api/exams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ex) })
    } finally {
      await globalMutate("app-data")
    }
  },

  // Results
  addMarks: async (studentId: string, examId: string, subject: string, score: number, total: number) => {
    try {
      await fetch(`/api/marks/${encodeURIComponent(studentId)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ examId, subject, score, total }) })
    } finally {
      await globalMutate("app-data")
    }
  },
}

export function useSession() {
  const { data } = useSWR<Session>("session", () => Promise.resolve(loadSession()), { fallbackData: { role: null } })
  return data!
}

export function getTeacherTimetable(teacherId: string) {
  const d = load()
  const entries: (TimetableEntry & { classId: string })[] = []
  d.classTimetables.forEach((tt) => {
    tt.entries.forEach((e) => {
      if (e.teacherId === teacherId) entries.push({ ...e, classId: tt.classId })
    })
  })
  return entries
}

export function getPendingFeesFrom(d: AppData) {
  return d.students
    .map((s) => {
      const classFees = (d.fees || []).filter((f) => f.classId === s.classId && (f.applicableGender === "Both" || f.applicableGender === s.gender))
      const pending: (keyof Student["feesPaid"])[] = []
      classFees.forEach((fee) => {
        if (!s.feesPaid[fee.type]) {
          pending.push(fee.type)
        }
      })
      return { student: s, pending }
    })
    .filter(({ pending }) => pending.length > 0) // Only return students with pending fees
}

export const presetAdmin = PRESET_ADMIN
