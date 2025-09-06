import { useState, useEffect } from 'react'

// Breakpoint constants
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  large: 1200
}

// Device detection utilities
const getDeviceType = (width) => {
  if (width <= BREAKPOINTS.mobile) return 'mobile'
  if (width <= BREAKPOINTS.tablet) return 'tablet'
  if (width <= BREAKPOINTS.desktop) return 'desktop'
  return 'large'
}

const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

const hasHover = () => {
  return window.matchMedia('(hover: hover)').matches
}

const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const getOrientation = () => {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
}

// Main responsive hook
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })
  
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLarge: false,
    isTouch: false,
    hasHover: true,
    prefersReducedMotion: false,
    orientation: 'landscape'
  })
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const type = getDeviceType(width)
      
      setWindowSize({ width, height })
      setDeviceInfo({
        type,
        isMobile: type === 'mobile',
        isTablet: type === 'tablet',
        isDesktop: type === 'desktop',
        isLarge: type === 'large',
        isTouch: isTouchDevice(),
        hasHover: hasHover(),
        prefersReducedMotion: prefersReducedMotion(),
        orientation: getOrientation()
      })
    }
    
    // Initial call
    handleResize()
    
    // Add event listeners
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])
  
  return {
    ...windowSize,
    ...deviceInfo,
    breakpoints: BREAKPOINTS
  }
}

// Hook for specific breakpoint matching
export const useBreakpoint = (breakpoint) => {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`
    const media = window.matchMedia(query)
    
    const updateMatch = () => setMatches(media.matches)
    updateMatch()
    
    media.addEventListener('change', updateMatch)
    return () => media.removeEventListener('change', updateMatch)
  }, [breakpoint])
  
  return matches
}

// Hook for media queries
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    
    const updateMatch = () => setMatches(media.matches)
    updateMatch()
    
    media.addEventListener('change', updateMatch)
    return () => media.removeEventListener('change', updateMatch)
  }, [query])
  
  return matches
}

// Hook for viewport dimensions with debouncing
export const useViewport = (delay = 100) => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })
  
  useEffect(() => {
    let timeoutId = null
    
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setViewport({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }, delay)
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [delay])
  
  return viewport
}

// Hook for scroll position
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0
  })
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY
      })
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return scrollPosition
}

// Hook for element visibility (intersection observer)
export const useInView = (options = {}) => {
  const [ref, setRef] = useState(null)
  const [inView, setInView] = useState(false)
  
  useEffect(() => {
    if (!ref) return
    
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options
      }
    )
    
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, options])
  
  return [setRef, inView]
}

// Hook for touch gestures
export const useSwipeGesture = (onSwipe, threshold = 50) => {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  
  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > threshold
    const isRightSwipe = distance < -threshold
    
    if (isLeftSwipe) {
      onSwipe('left', distance)
    } else if (isRightSwipe) {
      onSwipe('right', Math.abs(distance))
    }
  }
  
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}

// Hook for keyboard navigation
export const useKeyboardNavigation = (handlers = {}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const handler = handlers[e.key]
      if (handler) {
        e.preventDefault()
        handler(e)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}

// Hook for focus management
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState(null)
  
  const focusElement = (selector) => {
    const element = document.querySelector(selector)
    if (element) {
      element.focus()
      setFocusedElement(element)
    }
  }
  
  const focusFirst = (container) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length > 0) {
      focusable[0].focus()
      setFocusedElement(focusable[0])
    }
  }
  
  const focusLast = (container) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus()
      setFocusedElement(focusable[focusable.length - 1])
    }
  }
  
  return {
    focusedElement,
    focusElement,
    focusFirst,
    focusLast
  }
}

// Hook for animation preferences
export const useAnimationPreferences = () => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)')
  
  return {
    prefersReducedMotion,
    prefersHighContrast,
    shouldAnimate: !prefersReducedMotion,
    animationDuration: prefersReducedMotion ? 0 : undefined
  }
}

export default useResponsive