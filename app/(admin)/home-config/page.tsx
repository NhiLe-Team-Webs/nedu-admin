"use client"

import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HomeConfigContent } from "./HomeConfigContent"

export default function HomeConfigPage() {
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
            <h1 className="text-2xl font-bold mb-4">QUẢN LÝ TRANG CHỦ</h1>

            {/* Main Content */}
            <HomeConfigContent />
        </div>
    )
}
