export type User = {
    id: string;
    email: string;
    fullName: string;
    role: "admin" | "user" | "moderator";
    status: "active" | "inactive" | "banned";
    lastLogin: string;
    createdAt: string;
    avatarUrl?: string; // Optional avatar URL
};

export const MOCK_USERS: User[] = [
    {
        id: "1",
        email: "duyphan.nlt@gmail.com",
        fullName: "Duy Phan",
        role: "admin",
        status: "active",
        lastLogin: "2024-01-04 10:30:00",
        createdAt: "2023-01-01",
        avatarUrl: "https://github.com/shadcn.png"
    },
    {
        id: "2",
        email: "user1@example.com",
        fullName: "Nguyen Van A",
        role: "user",
        status: "active",
        lastLogin: "2024-01-03 15:45:00",
        createdAt: "2023-05-15",
    },
    {
        id: "3",
        email: "user2@example.com",
        fullName: "Tran Thi B",
        role: "user",
        status: "inactive",
        lastLogin: "2023-12-20 09:00:00",
        createdAt: "2023-06-20",
    },
    {
        id: "4",
        email: "mod1@example.com",
        fullName: "Le Van C",
        role: "moderator",
        status: "active",
        lastLogin: "2024-01-04 11:00:00",
        createdAt: "2023-02-10",
    },
    {
        id: "5",
        email: "banned@example.com",
        fullName: "Pham Van D",
        role: "user",
        status: "banned",
        lastLogin: "2023-10-01 08:30:00",
        createdAt: "2023-08-05",
    }
];

export const MOCK_STATS = [
    {
        title: "Total Users",
        value: "2,345",
        change: "+12% from last month",
        icon: "Users",
    },
    {
        title: "Active Users",
        value: "1,890",
        change: "+5% from last month",
        icon: "UserCheck",
    },
    {
        title: "New Users (Today)",
        value: "45",
        change: "+2% from yesterday",
        icon: "UserPlus",
    },
    {
        title: "Pending Approvals",
        value: "12",
        change: "-3 from yesterday",
        icon: "Clock",
    },
];

export const MOCK_MENTORS = [
    {
        id: "1",
        name: "Nguyễn Văn A",
        role: "FOUNDER & CEO",
        bio: "Hơn 10 năm kinh nghiệm trong lĩnh vực khởi nghiệp và quản trị doanh nghiệp. Đã từng dẫn dắt nhiều dự án thành công.",
        cvUrl: "https://example.com/cv-nguyen-van-a.pdf",
        avatarUrl: "https://github.com/shadcn.png",
        quote: "Không có việc gì khó, chỉ sợ lòng không bền.",
        createdAt: new Date("2023-01-15"),
    },
    {
        id: "2",
        name: "Trần Thị B",
        role: "CTO",
        bio: "Chuyên gia công nghệ với nền tảng kỹ thuật vững chắc. Đam mê xây dựng các sản phẩm công nghệ tiên tiến.",
        cvUrl: "https://example.com/cv-tran-thi-b.pdf",
        avatarUrl: "https://github.com/shadcn.png",
        quote: "Công nghệ thay đổi cuộc sống.",
        createdAt: new Date("2023-02-20"),
    },
    {
        id: "3",
        name: "Lê Văn C",
        role: "MARKETING DIRECTOR",
        bio: "Sáng tạo và am hiểu thị trường. Đã thực hiện nhiều chiến dịch marketing gây tiếng vang lớn.",
        cvUrl: "https://example.com/cv-le-van-c.pdf",
        avatarUrl: "https://github.com/shadcn.png",
        quote: "Khách hàng là thượng đế.",
        createdAt: new Date("2023-03-10"),
    },
];
