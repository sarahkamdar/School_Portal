"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TimetablePage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Class Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Timetable functionality is being restored. Please check back soon.</p>
          <div className="mt-4">
            <Button disabled>
              Edit Timetable
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}