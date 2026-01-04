import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

        // Set initial value
        setIsMobile(mql.matches)

        const onChange = () => {
            setIsMobile(mql.matches)
        }

        mql.addEventListener("change", onChange)

        // Cleanup
        return () => mql.removeEventListener("change", onChange)
    }, [])

    // Explicitly return false if undefined (during SSR or initial mount) to match expected boolean return type more closely, 
    // though managing hydration mismatch is key.
    // For this simple mock, !!isMobile works.
    return !!isMobile
}
