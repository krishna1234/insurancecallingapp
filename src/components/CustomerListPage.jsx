import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import CustomerList from './CustomerList'
import { ArrowLeft } from 'lucide-react'
import { CONTACT_STATUS_OPTIONS } from '../constants/contactStatus'

const FILTER_LABELS = {
  all: 'Customer List',
  pending: 'Pending Customers',
  called: 'In Progress',
  completed: 'Completed',
  ...Object.fromEntries(CONTACT_STATUS_OPTIONS.map(o => [`contact_${o.value}`, `${o.label} Customers`]))
}

const applyFilter = (customers, filter) => {
  if (filter?.startsWith('contact_')) {
    const contactStatus = filter.replace('contact_', '')
    return customers.filter(c => c.contactStatus === contactStatus)
  }
  switch (filter) {
    case 'pending': return customers.filter(c => c.status === 'pending')
    case 'called': return customers.filter(c => c.status === 'called')
    case 'completed': return customers.filter(c => c.status === 'completed')
    default: return customers
  }
}

const CustomerListPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const filter = new URLSearchParams(location.search).get('filter') || 'all'

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('customers')
    return saved ? JSON.parse(saved) : []
  })
  const [csvFileName, setCsvFileName] = useState('')

  useEffect(() => {
    const savedFileName = localStorage.getItem('csvFileName')
    if (savedFileName) setCsvFileName(savedFileName)
  }, [])

  const handleCustomersUpdate = (newCustomers) => {
    setCustomers(newCustomers)
    localStorage.setItem('customers', JSON.stringify(newCustomers))
  }

  const filteredCustomers = applyFilter(customers, filter)

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline-light btn-sm d-flex align-items-center me-3"
            >
              <ArrowLeft size={16} className="me-1" />
              <span className="d-none d-sm-inline">Back to Dashboard</span>
            </button>
            <span className="navbar-brand fw-bold mb-0">
              {FILTER_LABELS[filter] || 'Customer List'}
            </span>
          </div>
          <div className="d-flex align-items-center">
            <small className="text-light d-none d-md-block">
              {csvFileName && `File: ${csvFileName}`}
            </small>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <CustomerList
          customers={filteredCustomers}
          onCustomerUpdate={handleCustomersUpdate}
        />
      </div>
    </div>
  )
}

export default CustomerListPage
