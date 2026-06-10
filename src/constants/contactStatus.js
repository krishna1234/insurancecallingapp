export const CONTACT_STATUS_OPTIONS = [
  { value: 'interested', label: 'Interested', color: 'success', icon: '✓' },
  { value: 'not_interested', label: 'Not Interested', color: 'danger', icon: '✕' },
  { value: 'busy', label: 'Busy', color: 'warning', icon: '⏱' },
  { value: 'wrong_number', label: 'Wrong Number', color: 'dark', icon: '☎' },
  { value: 'already_renewed', label: 'Already Renewed', color: 'info', icon: '↻' },
  { value: 'not_connecting', label: 'Not Connecting', color: 'secondary', icon: '⊘' },
  { value: 'others', label: 'Others', color: 'primary', icon: '…' },
]

export const getContactStatusOption = (value) =>
  CONTACT_STATUS_OPTIONS.find((option) => option.value === value)

export const getContactStatusLabel = (customer) => {
  if (!customer?.contactStatus) return 'Select Status'

  if (customer.contactStatus === 'others' && customer.customContactStatus) {
    return customer.customContactStatus
  }

  return getContactStatusOption(customer.contactStatus)?.label || 'Select Status'
}

export const getContactStatusColor = (value) =>
  getContactStatusOption(value)?.color || 'outline-secondary'

export const isContactStatusComplete = (customer) => {
  if (!customer?.contactStatus) return false
  if (customer.contactStatus === 'others') {
    return !!customer.customContactStatus?.trim()
  }
  return true
}
