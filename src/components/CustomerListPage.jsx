import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerList from './CustomerList'
import { ArrowLeft, Upload, Users, CheckCircle, Clock } from 'lucide-react'

const CustomerListPage = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [csvFileName, setCsvFileName] = useState('')

  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers')
    const savedFileName = localStorage.getItem('csvFileName')
    
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers))
    }
    if (savedFileName) {
      setCsvFileName(savedFileName)
    }
  }, [])

  const handleCustomersUpdate = (newCustomers) => {
    setCustomers(newCustomers)
    localStorage.setItem('customers', JSON.stringify(newCustomers))
  }

  const getStats = () => {
    const total = customers.length
    const completed = customers.filter(c => c.status === 'completed').length
    const inProgress = customers.filter(c => c.status === 'called').length
    const pending = customers.filter(c => c.status === 'pending').length

    return { total, completed, inProgress, pending }
  }

  const stats = getStats()

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Header */}
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
              Customer List
            </span>
          </div>
          <div className="d-flex align-items-center">
            <div className="d-none d-md-block me-3">
              <small className="text-light">
                {csvFileName && `File: ${csvFileName}`}
              </small>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {/* Customer List Only - No Stats */}
        <CustomerList 
          customers={customers} 
          onCustomerUpdate={handleCustomersUpdate}
        />
      </div>
    </div>
  )
}

export default CustomerListPage 