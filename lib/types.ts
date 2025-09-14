export type Gender = "Male" | "Female" | "Other"

export interface ClassRoom {
  id: string
  name: string
  section: string
  academicYear?: string
  maxStrength?: number
  classTeacherId?: string
  subjects: string[]
  fees?: {
    exam?: number
    admission?: number
    term?: number
    utilities?: number
  }
}

export type SubjectType = "Core" | "Elective" | "Co-curricular"
export interface Subject {
  id: string
  name: string
  code: string
  type: SubjectType
  classId: string
}

export type FeeType = "admission" | "education" | "exam" | "term" | "utilities" | "other"
export interface Fee {
  id: string
  classId: string
  type: FeeType
  amount: number
  applicableGender: "Male" | "Female" | "Both"
  dueDate?: string
}

export interface ClassTeacherMapping {
  classId: string
  teacherId: string
}

export interface Student {
  id: string
  name: string
  gender: Gender
  dob?: string
  admissionNo: string
  classId: string
  section?: string
  rollNo: number
  guardianName?: string
  guardianPhone?: string
  address?: string
  email?: string
  photoUrl?: string
  attendance: Record<string, boolean>
  feesPaid: Partial<Record<FeeType, boolean>>
  marks: Record<string, { total: number; subjects: Record<string, number> }>
}

export interface Teacher {
  id: string
  name: string
  gender?: Gender
  dob?: string
  qualification?: string
  expertise?: string[]
  subject?: string
  contactNumber?: string
  email?: string
  address?: string
  photoUrl?: string
  password: string
  isClassTeacher?: boolean
  classId?: string
}

export interface TimetableEntry {
  day: string
  period: number
  subject: string
  teacherId: string
}
export interface ClassTimetable {
  classId: string
  academicYear?: string
  entries: TimetableEntry[]
}

export interface Notice {
  id: string
  title: string
  message: string
  createdAt: string
  active: boolean
  audience?: "Admin" | "Teachers" | "Both"
  eventDate?: string
  expiryDate?: string
}

export interface Exam {
  id: string
  classId: string
  name: string
  startDate?: string
  endDate?: string
  totalMarks?: number
  totalPerSubject?: number
  passingMarks?: number
}

export type Role = "admin" | "teacher" | null

export interface AppData {
  classes: ClassRoom[]
  students: Student[]
  teachers: Teacher[]
  classTimetables: ClassTimetable[]
  notices: Notice[]
  exams: Exam[]
  subjects?: Subject[]
  fees?: Fee[]
  classTeacherMappings?: ClassTeacherMapping[]
}

export interface Session {
  role: Role
  teacherId?: string
}
