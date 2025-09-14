"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { actions } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function NoticesPage() {
  // Form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  
  const { data } = useSWR<{ ok: boolean; data: any[] }>("/api/notices", fetcher)
  const { toast } = useToast()
  const list = data?.ok ? data.data : []

  // Validation
  const titleValid = title.trim().length > 0 && title.trim().length <= 200
  const descriptionValid = description.trim().length > 0 && description.trim().length <= 5000
  const canPublish = titleValid && descriptionValid

  // Reset form
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setEventDate("")
    setExpiryDate("")
  }

  const publish = async () => {
    if (!canPublish) return
    
    try {
      const noticeData = {
        title: title.trim(),
        message: description.trim(), // API expects 'message' field
        eventDate: eventDate || undefined,
        expiryDate: expiryDate || undefined,
        active: true
      }
      
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noticeData),
      })
      
      if (!res.ok) throw new Error("API error")
      
      await mutate("/api/notices")
      toast({
        title: "Success",
        description: "Notice published successfully",
      })
      
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish notice",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Notice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="noticeTitle">Title *</Label>
            <Input 
              id="noticeTitle"
              placeholder="e.g., School Holiday, Parent Meeting, Sports Day" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            {title && !titleValid && (
              <p className="text-sm text-destructive">Title must be 1-200 characters</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="noticeDescription">Description *</Label>
            <Textarea 
              id="noticeDescription"
              placeholder="Enter detailed notice description..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              rows={4}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{description && !descriptionValid && "Description must be 1-5000 characters"}</span>
              <span>{description.length}/5000</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date (Optional)</Label>
            <Input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Can't expire before today
            />
            <p className="text-xs text-muted-foreground">Notice will be hidden after this date</p>
          </div>

          <div className="flex gap-3">
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              disabled={!canPublish}
              onClick={publish}
            >
              Publish Notice
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
            >
              Clear
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>* Required fields</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Notices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No active notices</p>
          ) : (
            list.map((n) => {
              const isExpiringSoon = n.expiryDate && new Date(n.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
              const eventDatePassed = n.eventDate && new Date(n.eventDate) < new Date()
              
              return (
                <div 
                  key={n.id} 
                  className={`rounded-md border p-3 ${isExpiringSoon ? 'border-orange-200 bg-orange-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{n.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                    </div>
                    <div className="ml-4 flex flex-col items-end text-xs text-muted-foreground">
                      <span>Created: {new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {n.eventDate && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded ${eventDatePassed ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                        <span>📅</span>
                        <span>Event: {new Date(n.eventDate).toLocaleDateString()}</span>
                        {eventDatePassed && <span>(Past)</span>}
                      </div>
                    )}
                    
                    {n.expiryDate && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded ${isExpiringSoon ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        <span>⏰</span>
                        <span>Expires: {new Date(n.expiryDate).toLocaleDateString()}</span>
                        {isExpiringSoon && <span>(Soon)</span>}
                      </div>
                    )}
                    
                    {!n.expiryDate && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-600">
                        <span>∞</span>
                        <span>No expiry</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
