"use client"

import { StatsCard } from "@/components/admin/StatsCard"
import { MOCK_STATS } from "@/lib/mock-data"
import { Users, UserCheck, UserPlus, Clock, LucideIcon, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const iconMap: Record<string, LucideIcon> = {
    Users,
    UserCheck,
    UserPlus,
    Clock
}

export default function DashboardPage() {
    return (
        <div className="p-4">
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden mb-4">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                    <PanelLeft />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            </div>

            {/* Page Title */}
            <h1 className="text-2xl font-bold mb-4">THÔNG TIN DOANH NGHIỆP</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {MOCK_STATS.map((stat, index) => {
                    const Icon = iconMap[stat.icon] || Users
                    return (
                        <StatsCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            change={stat.change}
                            icon={Icon}
                        />
                    )
                })}
            </div>
            {/* Add more dashboard content here if needed */}
        </div>
    )
}
