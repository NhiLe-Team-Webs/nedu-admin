"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label" // We don't have this yet, use native label
import { Card, CardContent } from "@/components/ui/card"
import { User, MOCK_USERS } from "@/lib/mock-data"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface UserFormProps {
    initialData?: User
    isReadOnly?: boolean
}

export function UserForm({ initialData, isReadOnly = false }: UserFormProps) {
    const router = useRouter()
    const [formData, setFormData] = useState<Partial<User>>(initialData || {
        role: "user",
        status: "active"
    })
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
        router.push("/users")
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <label htmlFor="fullName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
                    <Input
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName || ""}
                        onChange={handleChange}
                        disabled={isReadOnly || isLoading}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        value={formData.email || ""}
                        onChange={handleChange}
                        disabled={isReadOnly || isLoading}
                        required
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="role" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Role</label>
                        <select
                            id="role"
                            name="role"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.role || "user"}
                            onChange={handleChange}
                            disabled={isReadOnly || isLoading}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
                        <select
                            id="status"
                            name="status"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.status || "active"}
                            onChange={handleChange}
                            disabled={isReadOnly || isLoading}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>
                </div>

                {!isReadOnly && (
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                )}
            </div>
        </form>
    )
}
