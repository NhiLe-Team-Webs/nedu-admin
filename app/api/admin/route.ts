import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Email validation helper
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Helper to get current user's role
async function getCurrentUserRole(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return null
    }

    const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', user.email)
        .single()

    return adminUser?.role || null
}

export async function GET(request: Request) {
    try {
        const supabase = createClient()

        // Lấy danh sách admin từ bảng admin_users
        const { data: admins, error } = await supabase
            .from('admin_users')
            .select('id, email, full_name, role, is_active, created_at, updated_at')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching admins:', error)
            return NextResponse.json(
                { error: 'Không thể lấy danh sách admin', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: admins,
            count: admins?.length || 0
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi không mong muốn' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        const { email, full_name, role = 'admin', password } = body

        // Check current user's role
        const currentUserRole = await getCurrentUserRole(supabase)

        // Only owner can create owner accounts
        if (role === 'owner' && currentUserRole !== 'owner') {
            return NextResponse.json(
                { error: 'Chỉ owner mới có thể tạo tài khoản owner' },
                { status: 403 }
            )
        }

        // Validate required fields
        if (!email) {
            return NextResponse.json(
                { error: 'Email là bắt buộc' },
                { status: 400 }
            )
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Email không hợp lệ' },
                { status: 400 }
            )
        }

        // Validate role
        if (!['admin', 'owner'].includes(role)) {
            return NextResponse.json(
                { error: 'Vai trò không hợp lệ' },
                { status: 400 }
            )
        }

        // Check if email already exists
        const { data: existingAdmin } = await supabase
            .from('admin_users')
            .select('id')
            .eq('email', email)
            .single()

        if (existingAdmin) {
            return NextResponse.json(
                { error: 'Email đã tồn tại' },
                { status: 409 }
            )
        }

        // For now, use a default password or the provided one
        // In production, you should hash the password properly
        const defaultPassword = password || 'ChangeMe123!'

        // Insert new admin
        const { data: newAdmin, error: insertError } = await supabase
            .from('admin_users')
            .insert({
                email,
                full_name: full_name || null,
                role,
                password_hash: defaultPassword, // TODO: Implement proper password hashing
                is_active: true
            })
            .select('id, email, full_name, role, is_active, created_at, updated_at')
            .single()

        if (insertError) {
            console.error('Error inserting admin:', insertError)
            return NextResponse.json(
                { error: 'Không thể tạo admin mới', details: insertError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: newAdmin,
            message: 'Đã thêm admin thành công'
        }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi không mong muốn' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = createClient()
        const body = await request.json()

        const { id, role } = body

        // Check current user's role
        const currentUserRole = await getCurrentUserRole(supabase)

        // Only owner can change roles
        if (currentUserRole !== 'owner') {
            return NextResponse.json(
                { error: 'Chỉ owner mới có quyền thay đổi vai trò' },
                { status: 403 }
            )
        }

        // Validate required fields
        if (!id || !role) {
            return NextResponse.json(
                { error: 'ID và vai trò là bắt buộc' },
                { status: 400 }
            )
        }

        // Validate role
        if (!['admin', 'owner'].includes(role)) {
            return NextResponse.json(
                { error: 'Vai trò không hợp lệ' },
                { status: 400 }
            )
        }

        // Update admin role
        const { data: updatedAdmin, error: updateError } = await supabase
            .from('admin_users')
            .update({
                role,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('id, email, full_name, role, is_active, created_at, updated_at')
            .single()

        if (updateError) {
            console.error('Error updating admin:', updateError)
            return NextResponse.json(
                { error: 'Không thể cập nhật vai trò', details: updateError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedAdmin,
            message: 'Đã cập nhật vai trò thành công'
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi không mong muốn' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        // Check current user's role
        const currentUserRole = await getCurrentUserRole(supabase)

        // Only owner can delete users
        if (currentUserRole !== 'owner') {
            return NextResponse.json(
                { error: 'Chỉ owner mới có quyền xóa người dùng' },
                { status: 403 }
            )
        }

        // Validate required fields
        if (!id) {
            return NextResponse.json(
                { error: 'ID là bắt buộc' },
                { status: 400 }
            )
        }

        // Get admin info before deleting
        const { data: adminToDelete } = await supabase
            .from('admin_users')
            .select('email, role')
            .eq('id', id)
            .single()

        // Prevent deleting yourself
        const { data: { user } } = await supabase.auth.getUser()
        if (adminToDelete?.email === user?.email) {
            return NextResponse.json(
                { error: 'Không thể xóa chính mình' },
                { status: 400 }
            )
        }

        // Delete admin
        const { error: deleteError } = await supabase
            .from('admin_users')
            .delete()
            .eq('id', id)

        if (deleteError) {
            console.error('Error deleting admin:', deleteError)
            return NextResponse.json(
                { error: 'Không thể xóa người dùng', details: deleteError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Đã xóa người dùng thành công'
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi không mong muốn' },
            { status: 500 }
        )
    }
}