"use client"

import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

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

            {/* Main Card with Tabs */}
            <Card>
                <div className="w-full p-6 md:w-auto">
                    <Tabs defaultValue="hero" className="w-full">
                        <div className="flex justify-center">
                            <TabsList>
                                <TabsTrigger value="hero">Sự kiện nổi bật</TabsTrigger>
                                <TabsTrigger value="partners">Đối tác</TabsTrigger>
                                <TabsTrigger value="testimonial-map">Đánh giá</TabsTrigger>
                                <TabsTrigger value="mentors">Mentor</TabsTrigger>
                                <TabsTrigger value="faq">Q&A</TabsTrigger>
                                <TabsTrigger value="social-media">Social Media</TabsTrigger>
                            </TabsList>
                        </div>

                        <CardContent className="p-6 pt-0">
                            <TabsContent value="hero">
                                <div className="rounded-lg border bg-card text-card-foreground shadow-sm max-w-2xl mx-auto">
                                    <div className="p-6 pt-6 relative">
                                        {/* Edit Overlay */}
                                        <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 z-10 flex items-center justify-center rounded-lg">
                                            <Button>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen mr-2 h-4 w-4">
                                                    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                                                </svg>
                                                Chỉnh sửa
                                            </Button>
                                        </div>

                                        {/* Form Content */}
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase" htmlFor="course-select">
                                                    Khóa học liên quan <span className="text-destructive">*</span>
                                                </label>
                                                <select
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    id="course-select"
                                                    disabled
                                                >
                                                    <option>LÀ CHÍNH MÌNH</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase" htmlFor="hero-title">
                                                    Tiêu đề <span className="text-destructive">*</span>
                                                </label>
                                                <input
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    id="hero-title"
                                                    placeholder="e.g. Đánh thức Phiên bản tốt nhất"
                                                    disabled
                                                    defaultValue="Chào mừng bạn đến với N-Education"
                                                    name="title"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase" htmlFor="hero-description">
                                                    Mô tả <span className="text-destructive">*</span>
                                                </label>
                                                <textarea
                                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    id="hero-description"
                                                    name="description"
                                                    placeholder="Nhập mô tả ngắn gọn về sự kiện..."
                                                    disabled
                                                    defaultValue="Tôi là Duy"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase" htmlFor="hero-quote">
                                                    Quote
                                                </label>
                                                <input
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    id="hero-quote"
                                                    placeholder="e.g. Hành trình vạn dặm bắt đầu từ một bước chân"
                                                    disabled
                                                    defaultValue='"Không có việc gì khó, chỉ sợ không làm"'
                                                    name="quote"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase" htmlFor="hero-registrations">
                                                    Số lượng đăng ký
                                                </label>
                                                <input
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    id="hero-registrations"
                                                    placeholder="e.g. 500"
                                                    disabled
                                                    type="number"
                                                    defaultValue="200"
                                                    name="registrations"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="partners">
                                <p className="text-center text-muted-foreground py-8">Đối tác section coming soon...</p>
                            </TabsContent>

                            <TabsContent value="testimonial-map">
                                <p className="text-center text-muted-foreground py-8">Đánh giá section coming soon...</p>
                            </TabsContent>

                            <TabsContent value="mentors">
                                <p className="text-center text-muted-foreground py-8">Mentor section coming soon...</p>
                            </TabsContent>

                            <TabsContent value="faq">
                                <p className="text-center text-muted-foreground py-8">Q&A section coming soon...</p>
                            </TabsContent>

                            <TabsContent value="social-media">
                                <p className="text-center text-muted-foreground py-8">Social Media section coming soon...</p>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </div>
            </Card>
        </div>
    )
}
