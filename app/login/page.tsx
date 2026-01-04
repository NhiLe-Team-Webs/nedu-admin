import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="mx-auto w-full max-w-sm">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-primary p-3">
                            <Building className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Link href="/dashboard" className="w-full">
                                <Button className="w-full" size="lg">
                                    Login with Email (Mock)
                                </Button>
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full" type="button" disabled>
                            Google
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
