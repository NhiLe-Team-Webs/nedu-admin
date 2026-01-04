import { StatsCard } from "@/components/admin/StatsCard"
import { MOCK_STATS } from "@/lib/mock-data"
import { Users, UserCheck, UserPlus, Clock, LucideIcon } from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
    Users,
    UserCheck,
    UserPlus,
    Clock
}

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
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
