import type { AppData } from "./types"

export const initialData: AppData = {
  classes: [],
  students: [],
  teachers: [],
  classTimetables: [],
  notices: [],
  exams: [],
  subjects: [],
  fees: [],
}

export const PRESET_ADMIN = { id: process.env.NEXT_PUBLIC_ADMIN_ID || "admin", password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123" }
