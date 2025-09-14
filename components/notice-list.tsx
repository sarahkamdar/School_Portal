"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppData } from "@/lib/storage"
import { Bell, Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface NoticeListProps {
  title?: string
  maxCount?: number
  showEmptyMessage?: boolean
  compact?: boolean
}

export function NoticeList({ 
  title = "Notices", 
  maxCount, 
  showEmptyMessage = true, 
  compact = false 
}: NoticeListProps) {
  const d = useAppData()
  const { data, error } = useSWR<{ ok: boolean; data: any[] }>("/api/notices", fetcher)
  const [filteredNotices, setFilteredNotices] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  
  // Initialize current time client-side to avoid hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date())
  }, [])
  
  // Filter and sort notices client-side when data or time changes
  useEffect(() => {
    if (!currentTime) {
      setFilteredNotices([])
      return
    }
    
    // Use API data if available, fall back to local data
    const apiList = data?.ok ? data.data : null
    let allNotices = apiList ?? d.notices

    // Filter out inactive notices and apply expiry date filter
    allNotices = allNotices.filter((n: any) => {
      if (!n.active) return false
      
      // Filter out expired notices (API should handle this but double-check)
      if (n.expiryDate && new Date(n.expiryDate) < currentTime) {
        return false
      }
      
      return true
    })

    // Sort by creation date (newest first)
    const sortedNotices = allNotices.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Apply max count if specified
    const list = maxCount ? sortedNotices.slice(0, maxCount) : sortedNotices
    setFilteredNotices(list)
    setTotalCount(sortedNotices.length)
  }, [data, d.notices, currentTime, maxCount])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          {title}
          {filteredNotices.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {filteredNotices.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "space-y-2" : "space-y-3"}>
        {filteredNotices.length === 0 ? (
          showEmptyMessage && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm font-medium text-green-600">All caught up!</p>
              <p className="text-xs text-muted-foreground">No active notices at the moment.</p>
            </div>
          )
        ) : (
          filteredNotices.map((n: any) => {
            const now = currentTime || new Date()
            const createdDate = new Date(n.createdAt)
            const eventDate = n.eventDate ? new Date(n.eventDate) : null
            const expiryDate = n.expiryDate ? new Date(n.expiryDate) : null
            
            // Calculate time-based indicators
            const isNew = (now.getTime() - createdDate.getTime()) < (24 * 60 * 60 * 1000) // 24 hours
            const isExpiringSoon = expiryDate && (expiryDate.getTime() - now.getTime()) <= (7 * 24 * 60 * 60 * 1000) && expiryDate > now // 7 days
            const eventDatePassed = eventDate && eventDate < now
            const isEventToday = eventDate && eventDate.toDateString() === now.toDateString()
            const isEventSoon = eventDate && !eventDatePassed && !isEventToday && (eventDate.getTime() - now.getTime()) <= (7 * 24 * 60 * 60 * 1000) // 7 days
            
            return (
              <div 
                key={n.id} 
                className={`rounded-lg border p-3 transition-colors ${
                  isExpiringSoon ? 'border-orange-200 bg-orange-50' : 
                  isEventToday ? 'border-blue-200 bg-blue-50' :
                  'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className={`font-medium ${compact ? 'text-sm' : ''}`}>
                        {n.title}
                      </h3>
                      {isNew && (
                        <Badge variant="secondary" className="h-5 text-xs">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <p className={`text-muted-foreground ${compact ? 'text-xs line-clamp-2' : 'text-sm'}`}>
                      {n.message}
                    </p>
                  </div>
                  <div className="ml-4 text-xs text-muted-foreground flex flex-col items-end">
                    <span>{createdDate.toLocaleDateString()}</span>
                    {createdDate.getTime() !== now.getTime() && (
                      <span className="text-xs opacity-75">
                        {Math.ceil((now.getTime() - createdDate.getTime()) / (24 * 60 * 60 * 1000))}d ago
                      </span>
                    )}
                  </div>
                </div>
                
                {(eventDate || expiryDate || isExpiringSoon) && (
                  <div className="flex flex-wrap gap-1 text-xs mt-2">
                    {eventDate && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                        isEventToday ? 'bg-blue-100 text-blue-800 font-medium' :
                        eventDatePassed ? 'bg-gray-100 text-gray-600' : 
                        isEventSoon ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        <Calendar className="h-3 w-3" />
                        <span>
                          {isEventToday ? 'Event Today' : 
                           eventDatePassed ? 'Past Event' :
                           `Event: ${eventDate.toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    )}
                    
                    {expiryDate && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                        isExpiringSoon ? 'bg-orange-100 text-orange-800 font-medium' :
                        'bg-green-50 text-green-700'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span>
                          {isExpiringSoon ? 
                            `Expires ${expiryDate.toLocaleDateString()}` :
                            `Valid until ${expiryDate.toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    )}
                    
                    {!expiryDate && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 text-gray-600">
                        <span>∞</span>
                        <span>Permanent</span>
                      </div>
                    )}
                    
                    {isExpiringSoon && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Expiring Soon</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
        
        {maxCount && totalCount > maxCount && (
          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">
              Showing {maxCount} of {totalCount} notices
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
