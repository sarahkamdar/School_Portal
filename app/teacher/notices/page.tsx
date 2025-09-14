"use client"

import { NoticeList } from "@/components/notice-list"

export default function TeacherNoticesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">School Notices</h1>
        <p className="text-muted-foreground">
          View all active school announcements and notices
        </p>
      </div>

      {/* All Notices */}
      <NoticeList 
        title="All Active Notices"
        showEmptyMessage={true}
        compact={false}
      />
    </div>
  )
}