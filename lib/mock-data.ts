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
    },
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

export const MOCK_MENTORS = [];

export const MOCK_COURSES = [];

export const MOCK_PROMO_CODES = [];
