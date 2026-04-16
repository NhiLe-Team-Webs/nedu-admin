import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Do not run Supabase code on static files to save resources
    // and prevent potential issues with caching.
    if (request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.includes('.')) {
        return supabaseResponse;
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                        request.nextUrl.pathname.startsWith('/auth')

    if (!user && !isAuthRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // ── email whitelist ──────────────────────────────────────────────────────
    // Allow specific emails or any @nhi.sg domain.
    // Add more emails to ALLOWED_EMAILS env var (comma-separated).
    if (user && !isAuthRoute) {
        const email = user.email ?? ""
        const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
            .split(",")
            .map(e => e.trim().toLowerCase())
            .filter(Boolean)
        const allowedDomain = process.env.ALLOWED_DOMAIN ?? "nhi.sg"

        const isAllowed =
            email.endsWith(`@${allowedDomain}`) ||
            allowedEmails.includes(email.toLowerCase())

        if (!isAllowed) {
            await supabase.auth.signOut()
            const url = request.nextUrl.clone()
            url.pathname = '/auth/auth-code-error'
            return NextResponse.redirect(url)
        }
    }

    // If user is logged in and tries to go to login, redirect to dashboard
    if (user && request.nextUrl.pathname.startsWith('/login')) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
