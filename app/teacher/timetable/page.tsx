"use client"

import { useAuth } from "@/components/auth-provider"
import { useAppData } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, BookOpen, RefreshCw } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

type TimetableEntry = {
  day: string
  period: number
  subject: string
  teacherId: string
}

type ClassTimetable = {
  classId: string
  entries: TimetableEntry[]
}

export default function TeacherTimetablePage() {
  const { teacherId } = useAuth()
  const d = useAppData()
  const { toast } = useToast()
  
  const [timetables, setTimetables] = useState<ClassTimetable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  if (!teacherId) return null
  
  const teacher = d.teachers.find(t => t.id === teacherId)

  // Fetch all timetables and filter for this teacher
  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/timetable')
        const result = await response.json()
        
        if (result.ok && result.data) {
          setTimetables(result.data)
        } else {
          setError(result.error || 'Failed to fetch timetables')
          setTimetables([])
        }
      } catch (err) {
        console.error('Failed to fetch timetables:', err)
        setError('Failed to fetch timetables')
        setTimetables([])
      } finally {
        setLoading(false)
      }
    }

    fetchTimetables()
  }, [])

  // Extract entries for this teacher from all timetables
  const entries = useMemo(() => {
    const teacherEntries: (TimetableEntry & { classId: string })[] = []
    
    timetables.forEach(tt => {
      tt.entries.forEach(entry => {
        if (entry.teacherId === teacherId) {
          teacherEntries.push({ ...entry, classId: tt.classId })
        }
      })
    })
    
    return teacherEntries
  }, [timetables, teacherId])

  // Define days and periods for the grid
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] // Match the API format
  const periods = [1, 2, 3, 4, 5, 6] // Match the admin page periods
  
  // Day name mapping for display
  const dayDisplayNames: Record<string, string> = {
    'Mon': 'Monday',
    'Tue': 'Tuesday', 
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday'
  }
  
  // Create a timetable grid
  const timetableGrid = useMemo(() => {
    const grid: Record<string, Record<number, (TimetableEntry & { classId: string }) | null>> = {}
    
    // Initialize empty grid
    days.forEach(day => {
      grid[day] = {}
      periods.forEach(period => {
        grid[day][period] = null
      })
    })
    
    // Fill the grid with teacher's assignments
    entries.forEach(entry => {
      if (grid[entry.day]) {
        grid[entry.day][entry.period] = entry
      }
    })
    
    return grid
  }, [entries])

  // Calculate some stats
  const totalClasses = entries.length
  const uniqueSubjects = [...new Set(entries.map(e => e.subject))].length
  const uniqueClasses = [...new Set(entries.map(e => e.classId))].length

  const handleRefresh = async () => {
    const response = await fetch('/api/timetable')
    const result = await response.json()
    
    if (result.ok && result.data) {
      setTimetables(result.data)
      toast({
        title: "Refreshed",
        description: "Timetable data has been refreshed",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to refresh timetable data",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Your Weekly Timetable
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {teacher?.name} • {teacher?.subject ? `Subject: ${teacher.subject}` : 'Multi-Subject Teacher'}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading timetable...</span>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium text-destructive">Failed to Load Timetable</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content - only show when not loading and no error */}
      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                  <p className="text-2xl font-bold">{totalClasses}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                  <p className="text-2xl font-bold">{uniqueSubjects}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Classes Taught</p>
                  <p className="text-2xl font-bold">{uniqueClasses}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Content - only show when not loading and no error */}
      {!loading && !error && (
        <>
          {/* Timetable Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No Schedule Assigned</p>
                  <p className="text-sm text-muted-foreground">Your timetable will appear here once classes are assigned.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-border bg-muted/50 p-3 text-left font-semibold">
                            Day / Period
                          </th>
                          {periods.map(period => (
                            <th key={period} className="border border-border bg-muted/50 p-3 text-center font-semibold min-w-[120px]">
                              Period {period}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {days.map(day => (
                          <tr key={day}>
                            <td className="border border-border bg-muted/30 p-3 font-semibold">
                              {dayDisplayNames[day]}
                            </td>
                            {periods.map(period => {
                              const entry = timetableGrid[day][period]
                              return (
                                <td key={`${day}-${period}`} className="border border-border p-2 text-center min-h-[80px] align-top">
                                  {entry ? (
                                    <div className="space-y-1">
                                      <Badge variant="default" className="text-xs font-medium">
                                        {entry.subject}
                                      </Badge>
                                      <div className="text-xs text-muted-foreground">
                                        {(() => {
                                          const cls = d.classes.find(c => c.id === entry.classId)
                                          return cls ? `${cls.name} ${cls.section}` : entry.classId
                                        })()}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-muted-foreground text-xs">-</div>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject Summary */}
          {entries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teaching Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...new Set(entries.map(e => e.subject))].map(subject => {
                    const subjectEntries = entries.filter(e => e.subject === subject)
                    const classesForSubject = [...new Set(subjectEntries.map(e => e.classId))]
                    
                    return (
                      <div key={subject} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {subjectEntries.length} classes per week • {classesForSubject.length} different classes
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {classesForSubject.map(classId => {
                            const cls = d.classes.find(c => c.id === classId)
                            return (
                              <Badge key={classId} variant="outline" className="text-xs">
                                {cls ? `${cls.name} ${cls.section}` : classId}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
