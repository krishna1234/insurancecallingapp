import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Tag } from 'lucide-react'
import {
  CONTACT_STATUS_OPTIONS,
  getContactStatusColor,
  getContactStatusLabel,
} from '../constants/contactStatus'

const ContactStatusDropdown = ({
  contactStatus = '',
  customContactStatus = '',
  onChange,
  size = 'lg',
  showLabel = true,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [customText, setCustomText] = useState(customContactStatus || '')
  const dropdownRef = useRef(null)

  useEffect(() => {
    setCustomText(customContactStatus || '')
  }, [customContactStatus])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (value) => {
    if (value === 'others') {
      onChange(value, customText)
    } else {
      onChange(value, '')
    }
    if (value !== 'others') {
      setIsOpen(false)
    }
  }

  const handleCustomTextChange = (text) => {
    setCustomText(text)
    onChange('others', text)
  }

  const buttonClass = size === 'lg' ? 'btn-lg' : 'btn-sm'
  const color = contactStatus ? getContactStatusColor(contactStatus) : 'outline-secondary'
  const isComplete = contactStatus && (contactStatus !== 'others' || customText.trim() || customContactStatus?.trim())
  const showRequiredHint = required && !isComplete

  const displayLabel = contactStatus
    ? getContactStatusLabel({ contactStatus, customContactStatus: customText || customContactStatus })
    : 'Select Status *'

  return (
    <div className={`contact-status-dropdown ${showRequiredHint ? 'contact-status-required' : ''}`} ref={dropdownRef}>
      {showLabel && (
        <label className="form-label fw-semibold mb-2 d-flex align-items-center">
          <Tag size={16} className="me-2 text-primary" />
          Status {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      <div className="dropdown w-100">
        <button
          className={`btn btn-${color} ${buttonClass} w-100 contact-status-btn ${isOpen ? 'show' : ''} ${showRequiredHint ? 'contact-status-btn-required' : ''}`}
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="contact-status-label">{displayLabel}</span>
          <ChevronDown size={18} className={`contact-status-chevron ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <ul className="dropdown-menu w-100 shadow-sm contact-status-menu show">
            {CONTACT_STATUS_OPTIONS.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={`dropdown-item d-flex align-items-center gap-2 ${
                    contactStatus === option.value ? 'active' : ''
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className={`badge bg-${option.color} contact-status-badge`}>
                    {option.icon}
                  </span>
                  <span>{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {contactStatus === 'others' && (
        <input
          type="text"
          className={`form-control mt-2 ${required && !customText.trim() ? 'is-invalid' : ''}`}
          placeholder="Specify other status..."
          value={customText}
          onChange={(e) => handleCustomTextChange(e.target.value)}
        />
      )}

      {showRequiredHint && (
        <small className="text-danger d-block mt-1">Status is required to proceed</small>
      )}
    </div>
  )
}

export default ContactStatusDropdown
