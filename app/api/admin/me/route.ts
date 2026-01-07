import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = createClient()

        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user?.email) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        // Get admin user info
        const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('role, email, full_name')
            .eq('email', user.email)
            .single()

        if (error) {
            console.error('Error fetching current user:', error)
            return NextResponse.json(
                { error: 'Không thể lấy thông tin người dùng' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: adminUser
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi không mong muốn' },
            { status: 500 }
        )
    }
}