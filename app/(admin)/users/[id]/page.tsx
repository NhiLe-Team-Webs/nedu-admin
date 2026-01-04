import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/admin/UserForm"
import { MOCK_USERS } from "@/lib/mock-data"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function UserDetailPage({ params }: { params: { id: string } }) {
    const { id } = params

    const isNew = id === 'new'
    const user = isNew ? undefined : MOCK_USERS.find(u => u.id === id)

    if (!isNew && !user) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/users">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">
                    {isNew ? "Create User" : "Edit User"}
                </h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>{isNew ? "New User Details" : "User Details"}</CardTitle>
                    <CardDescription>
                        {isNew ? "Add a new user to the system." : `Manage details for ${user?.fullName}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserForm initialData={user} />
                </CardContent>
            </Card>
        </div>
    )
}
