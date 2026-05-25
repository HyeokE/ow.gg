import * as React from "react"

const MOBILE_BREAKPOINT = 768

const getIsMobile = () => window.innerWidth < MOBILE_BREAKPOINT

const getServerIsMobile = () => false

const subscribeToMobile = (callback: () => void) => {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", callback)

  return () => mql.removeEventListener("change", callback)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeToMobile,
    getIsMobile,
    getServerIsMobile
  )
}
