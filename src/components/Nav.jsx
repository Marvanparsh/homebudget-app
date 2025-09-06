// rrd imports
import { Form, NavLink } from "react-router-dom"
import { useState, useRef, useEffect } from "react"

// library
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
  CloudArrowUpIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/solid'

// assets
import logomark from "../assets/logomark.svg"

// components
import ThemeToggle from "./ThemeToggle"
import { syncToGoogleDrive, syncFromGoogleDrive } from '../utils/googleDriveSync'

const Nav = ({ currentUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [emailPrefs, setEmailPrefs] = useState(() => {
    const saved = localStorage.getItem('emailPreferences')
    return saved ? JSON.parse(saved) : {
      budgetAlerts: true,
      expenseNotifications: true,
      weeklyReports: false
    }
  })
  const dropdownRef = useRef(null)
  
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
  
  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink
          to={currentUser ? "/dashboard" : "/"}
          aria-label="Go to home"
          className="nav-logo"
          onClick={() => {
            setIsMenuOpen(false)
            setIsUserDropdownOpen(false)
          }}
        >
          <img src={logomark} alt="HomeBudget logo" height={30} />
          <span>HomeBudget</span>
        </NavLink>
        
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <XMarkIcon width={24} /> : <Bars3Icon width={24} />}
        </button>
        
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <ThemeToggle />
          {currentUser && (
            <div className="nav-user-section">
              {/* Desktop User Dropdown */}
              <div className="user-dropdown-container desktop-only" ref={dropdownRef}>
                <button 
                  className="user-avatar-btn"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-label="User menu"
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
                      <button className="dropdown-item profile-item" onClick={() => { setShowProfileModal(true); setIsUserDropdownOpen(false); }}>
                        <UserIcon width={18} />
                        <div className="item-content">
                          <span className="item-title">Profile Settings</span>
                          <small className="item-desc">Manage your account details</small>
                        </div>
                      </button>
                      
                      <button className="dropdown-item email-item" onClick={() => { setShowEmailModal(true); setIsUserDropdownOpen(false); }}>
                        <EnvelopeIcon width={18} />
                        <div className="item-content">
                          <span className="item-title">Email Preferences</span>
                          <small className="item-desc">Notification settings</small>
                        </div>
                      </button>
                      
                      <button className="dropdown-item password-item" onClick={() => { setShowPasswordModal(true); setIsUserDropdownOpen(false); }}>
                        <KeyIcon width={18} />
                        <div className="item-content">
                          <span className="item-title">Change Password</span>
                          <small className="item-desc">Update your security</small>
                        </div>
                      </button>
                      
                      <button className="dropdown-item sync-item" onClick={async () => {
                        setIsUserDropdownOpen(false);
                        const success = await syncToGoogleDrive();
                        alert(success ? 'Data synced to Google Drive!' : 'Sync failed. Please try again.');
                      }}>
                        <CloudArrowUpIcon width={18} />
                        <div className="item-content">
                          <span className="item-title">Sync to Drive</span>
                          <small className="item-desc">Upload data to Google Drive</small>
                        </div>
                      </button>
                      
                      <button className="dropdown-item sync-item" onClick={async () => {
                        setIsUserDropdownOpen(false);
                        const success = await syncFromGoogleDrive();
                        if (success) {
                          alert('Data restored from Google Drive!');
                          window.location.reload();
                        } else {
                          alert('No data found in Google Drive or sync failed.');
                        }
                      }}>
                        <CloudArrowDownIcon width={18} />
                        <div className="item-content">
                          <span className="item-title">Restore from Drive</span>
                          <small className="item-desc">Download data from Google Drive</small>
                        </div>
                      </button>
                      
                      <button className="dropdown-item contact-item" onClick={() => {
                        setIsUserDropdownOpen(false);
                        const subject = 'HomeBudget Support Request';
                        const body = `Hi HomeBudget Support Team,\n\nI need help with:\n\n[Please describe your issue here]\n\nUser: ${currentUser.fullName}\nEmail: ${currentUser.email}\n\nThank you!`;
                        window.open(`mailto:help.homebudget@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                      }}>
                        <ChatBubbleLeftRightIcon width={18} />
                        <div className="item-content">
                          <span className="item-title">Contact Us</span>
                          <small className="item-desc">Get help and support</small>
                        </div>
                      </button>
                      
                      <button className="dropdown-item danger" onClick={() => {
                        setIsUserDropdownOpen(false);
                        if (window.confirm('Are you sure you want to clear all budgets and expenses? This action cannot be undone.')) {
                          try {
                            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                            if (currentUser) {
                              localStorage.removeItem(`budgets_${currentUser.id}`);
                              localStorage.removeItem(`expenses_${currentUser.id}`);
                              localStorage.removeItem(`recurringExpenses_${currentUser.id}`);
                              window.location.reload();
                            }
                          } catch (error) {
                            alert('Failed to clear data');
                          }
                        }
                      }}>
                        <TrashIcon width={18} />
                        <div className="item-content">
                          <span className="item-title">Clear All Data</span>
                          <small className="item-desc">Remove all budgets & expenses</small>
                        </div>
                      </button>
                      
                      <div className="dropdown-divider"></div>
                      
                      <Form method="post" action="logout" className="dropdown-form">
                        <button type="submit" className="dropdown-item logout">
                          <ArrowRightOnRectangleIcon width={18} />
                          <span>Logout</span>
                        </button>
                      </Form>
                      
                      <Form
                        method="post"
                        action="delete-account"
                        onSubmit={(event) => {
                          if (!window.confirm("Delete account and all data? This cannot be undone!")) {
                            event.preventDefault()
                          }
                        }}
                        className="dropdown-form"
                      >
                        <button type="submit" className="dropdown-item danger">
                          <TrashIcon width={18} />
                          <span>Delete Account</span>
                        </button>
                      </Form>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile User Menu */}
              <div className="mobile-user-menu mobile-only">
                <div className="mobile-user-header">
                  <div className="user-avatar">
                    {getUserInitials(currentUser.fullName)}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{currentUser.fullName}</div>
                    <div className="user-email">{currentUser.email || 'user@example.com'}</div>
                  </div>
                </div>
                
                <div className="mobile-user-actions">
                  <button className="mobile-action-btn" onClick={() => alert('Profile settings coming soon!')}>
                    <UserIcon width={20} />
                    <span>Profile</span>
                  </button>
                  
                  <button className="mobile-action-btn" onClick={() => alert('Change password coming soon!')}>
                    <KeyIcon width={20} />
                    <span>Password</span>
                  </button>
                  
                  <Form
                    method="post"
                    action="logout"
                    onSubmit={() => setIsMenuOpen(false)}
                    className="nav-form"
                  >
                    <button type="submit" className="mobile-action-btn logout">
                      <ArrowRightOnRectangleIcon width={20} />
                      <span>Logout</span>
                    </button>
                  </Form>
                  
                  <Form
                    method="post"
                    action="delete-account"
                    onSubmit={(event) => {
                      if (!window.confirm("Delete account and all data? This cannot be undone!")) {
                        event.preventDefault()
                      }
                      setIsMenuOpen(false)
                    }}
                    className="nav-form"
                  >
                    <button type="submit" className="mobile-action-btn danger">
                      <TrashIcon width={20} />
                      <span>Delete Account</span>
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
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
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedUser = {
                ...currentUser,
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                username: formData.get('username')
              };
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              window.dispatchEvent(new Event('authChange'));
              setShowProfileModal(false);
              alert('Profile updated successfully!');
            }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" defaultValue={currentUser?.fullName} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" defaultValue={currentUser?.email} required />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input type="text" name="username" defaultValue={currentUser?.username} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--dark">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Email Preferences Modal */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Email Preferences</h3>
              <button className="modal-close" onClick={() => setShowEmailModal(false)}>
                <XMarkIcon width={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const preferences = {
                budgetAlerts: formData.has('budgetAlerts'),
                expenseNotifications: formData.has('expenseNotifications'),
                weeklyReports: formData.has('weeklyReports')
              };
              setEmailPrefs(preferences);
              localStorage.setItem('emailPreferences', JSON.stringify(preferences));
              setShowEmailModal(false);
              alert('Email preferences saved successfully!');
            }}>
              <div className="form-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <input type="checkbox" name="budgetAlerts" defaultChecked={emailPrefs.budgetAlerts} /> Budget alerts
                </label>
              </div>
              <div className="form-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <input type="checkbox" name="expenseNotifications" defaultChecked={emailPrefs.expenseNotifications} /> Expense notifications
                </label>
              </div>
              <div className="form-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <input type="checkbox" name="weeklyReports" defaultChecked={emailPrefs.weeklyReports} /> Weekly reports
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={() => setShowEmailModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--dark">Save Preferences</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                <XMarkIcon width={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const currentPassword = formData.get('currentPassword');
              const newPassword = formData.get('newPassword');
              const confirmPassword = formData.get('confirmPassword');
              
              if (currentPassword !== currentUser?.password) {
                alert('Current password is incorrect');
                return;
              }
              if (newPassword.length < 6) {
                alert('New password must be at least 6 characters');
                return;
              }
              if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
              }
              
              const updatedUser = { ...currentUser, password: newPassword };
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              window.dispatchEvent(new Event('authChange'));
              setShowPasswordModal(false);
              alert('Password updated successfully!');
            }}>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" name="currentPassword" placeholder="Enter current password" required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" name="newPassword" placeholder="Enter new password" minLength="6" required />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" placeholder="Confirm new password" minLength="6" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--dark">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  )
}
export default Nav