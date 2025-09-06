import { Form, NavLink } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { 
  TrashIcon, 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  ChartBarIcon,
  CreditCardIcon
} from '@heroicons/react/24/solid'

import logomark from "../assets/logomark.svg"
import ThemeToggle from "./ThemeToggle"

const ResponsiveNav = ({ currentUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  
  const dropdownRef = useRef(null)
  const navRef = useRef(null)
  
  // Minimum swipe distance
  const minSwipeDistance = 50
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Handle swipe gestures for mobile menu
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
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe && isMenuOpen) {
      setIsMenuOpen(false)
    }
    if (isRightSwipe && !isMenuOpen) {
      setIsMenuOpen(true)
    }
  }
  
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
        setIsUserDropdownOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])
  
  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  
  const closeAllMenus = () => {
    setIsMenuOpen(false)
    setIsUserDropdownOpen(false)
  }
  
  const navigationItems = [
    { to: "/dashboard", icon: HomeIcon, label: "Dashboard" },
    { to: "/dashboard/budgets", icon: CreditCardIcon, label: "Budgets" },
    { to: "/dashboard/expenses", icon: ChartBarIcon, label: "Expenses" }
  ]
  
  return (
    <>
      <nav 
        className="navbar" 
        ref={navRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="nav-container">
          <NavLink
            to={currentUser ? "/dashboard" : "/"}
            aria-label="Go to home"
            className="nav-logo"
            onClick={closeAllMenus}
          >
            <img src={logomark} alt="HomeBudget logo" height={30} />
            <span className="hide-mobile">HomeBudget</span>
          </NavLink>
          
          <button 
            className="mobile-menu-btn show-mobile"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <XMarkIcon width={24} /> : <Bars3Icon width={24} />}
          </button>
          
          {/* Desktop Navigation */}
          <div className="nav-actions hide-mobile">
            {currentUser && (
              <div className="nav-links">
                {navigationItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => 
                      `nav-link ${isActive ? 'nav-link--active' : ''}`
                    }
                  >
                    <Icon width={20} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            )}
            
            <ThemeToggle />
            
            {currentUser && (
              <div className="user-dropdown-container" ref={dropdownRef}>
                <button 
                  className="user-avatar-btn"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-label="User menu"
                  aria-expanded={isUserDropdownOpen}
                >
                  <div className="user-avatar">
                    {getUserInitials(currentUser.fullName)}
                  </div>
                  <ChevronDownIcon 
                    width={16} 
                    className={`dropdown-arrow ${isUserDropdownOpen ? 'open' : ''}`} 
                  />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="user-avatar large">
                        {getUserInitials(currentUser.fullName)}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{currentUser.fullName}</div>
                        <div className="user-email">{currentUser.email || 'user@example.com'}</div>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <div className="dropdown-menu">
                      <button 
                        className="dropdown-item" 
                        onClick={() => { 
                          setShowProfileModal(true)
                          setIsUserDropdownOpen(false)
                        }}
                      >
                        <UserIcon width={18} />
                        <div className="item-content">
                          <span className="item-title">Profile Settings</span>
                          <small className="item-desc">Manage your account</small>
                        </div>
                      </button>
                      
                      <button 
                        className="dropdown-item" 
                        onClick={() => { 
                          setShowEmailModal(true)
                          setIsUserDropdownOpen(false)
                        }}
                      >
                        <EnvelopeIcon width={18} />
                        <div className="item-content">
                          <span className="item-title">Email Preferences</span>
                          <small className="item-desc">Notification settings</small>
                        </div>
                      </button>
                      
                      <button 
                        className="dropdown-item" 
                        onClick={() => { 
                          setShowPasswordModal(true)
                          setIsUserDropdownOpen(false)
                        }}
                      >
                        <KeyIcon width={18} />
                        <div className="item-content">
                          <span className="item-title">Change Password</span>
                          <small className="item-desc">Update security</small>
                        </div>
                      </button>
                      
                      <div className="dropdown-divider"></div>
                      
                      <Form method="post" action="logout" className="dropdown-form">
                        <button type="submit" className="dropdown-item logout">
                          <ArrowRightOnRectangleIcon width={18} />
                          <span>Logout</span>
                        </button>
                      </Form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay show-mobile">
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <div className="nav-logo">
                <img src={logomark} alt="HomeBudget logo" height={30} />
                <span>HomeBudget</span>
              </div>
              <button 
                className="mobile-menu-close"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <XMarkIcon width={24} />
              </button>
            </div>
            
            {currentUser && (
              <>
                <div className="mobile-user-info">
                  <div className="user-avatar large">
                    {getUserInitials(currentUser.fullName)}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{currentUser.fullName}</div>
                    <div className="user-email">{currentUser.email || 'user@example.com'}</div>
                  </div>
                </div>
                
                <nav className="mobile-nav-links">
                  {navigationItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) => 
                        `mobile-nav-link ${isActive ? 'mobile-nav-link--active' : ''}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon width={24} />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </nav>
                
                <div className="mobile-menu-actions">
                  <button 
                    className="mobile-action-btn"
                    onClick={() => {
                      setShowProfileModal(true)
                      setIsMenuOpen(false)
                    }}
                  >
                    <UserIcon width={20} />
                    <span>Profile Settings</span>
                  </button>
                  
                  <button 
                    className="mobile-action-btn"
                    onClick={() => {
                      setShowPasswordModal(true)
                      setIsMenuOpen(false)
                    }}
                  >
                    <KeyIcon width={20} />
                    <span>Change Password</span>
                  </button>
                  
                  <div className="mobile-theme-toggle">
                    <ThemeToggle />
                  </div>
                  
                  <Form
                    method="post"
                    action="logout"
                    onSubmit={() => setIsMenuOpen(false)}
                  >
                    <button type="submit" className="mobile-action-btn logout">
                      <ArrowRightOnRectangleIcon width={20} />
                      <span>Logout</span>
                    </button>
                  </Form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Modals remain the same as in original Nav component */}
      {/* Profile Settings Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Profile Settings</h3>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>
                <XMarkIcon width={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const updatedUser = {
                ...currentUser,
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                username: formData.get('username')
              }
              localStorage.setItem('currentUser', JSON.stringify(updatedUser))
              window.dispatchEvent(new Event('authChange'))
              setShowProfileModal(false)
              alert('Profile updated successfully!')
            }}>
              <div className="form-control">
                <label>Full Name</label>
                <input type="text" name="fullName" defaultValue={currentUser?.fullName} required />
              </div>
              <div className="form-control">
                <label>Email</label>
                <input type="email" name="email" defaultValue={currentUser?.email} required />
              </div>
              <div className="form-control">
                <label>Username</label>
                <input type="text" name="username" defaultValue={currentUser?.username} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={() => setShowProfileModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default ResponsiveNav