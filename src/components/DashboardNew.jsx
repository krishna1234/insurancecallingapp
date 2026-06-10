import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import CsvUpload from './CsvUploadNew'
import { LogOut, Upload, Users, CheckCircle, Clock } from 'lucide-react'
import { CONTACT_STATUS_OPTIONS } from '../constants/contactStatus'

const DashboardNew = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [csvFileName, setCsvFileName] = useState('')
  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers')
    const savedFileName = localStorage.getItem('csvFileName')
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers))
    if (savedFileName) setCsvFileName(savedFileName)
  }, [])

  const handleCsvUpload = (newCustomers, fileName) => {
    setCustomers(newCustomers)
    setCsvFileName(fileName)
    localStorage.setItem('customers', JSON.stringify(newCustomers))
    localStorage.setItem('csvFileName', fileName)
    navigate(`/customer-list?filter=all`)
  }

  const handleDeleteCsv = () => {
    setCustomers([])
    setCsvFileName('')
    localStorage.removeItem('customers')
    localStorage.removeItem('csvFileName')
  }

  const total = customers.length
  const completed = customers.filter(c => c.status === 'completed').length
  const inProgress = customers.filter(c => c.status === 'called').length
  const pending = customers.filter(c => c.status === 'pending').length

  const goToFiltered = (filter) => {
    navigate(`/customer-list?filter=${filter}`)
  }

  const SHOWN_STATUSES = ['interested', 'busy', 'already_renewed', 'wrong_number']
  const callStatusItems = CONTACT_STATUS_OPTIONS
    .filter(o => SHOWN_STATUSES.includes(o.value))
    .map(option => ({
      ...option,
      count: customers.filter(c => c.contactStatus === option.value).length,
      filter: `contact_${option.value}`
    }))

  const statCard = (icon, label, count, color, filter) => (
    <div className="col-6 col-md-3">
      <div
        className="card border-0 bg-light h-100"
        onClick={() => customers.length > 0 && goToFiltered(filter)}
        style={{ cursor: customers.length > 0 ? 'pointer' : 'default', transition: 'box-shadow 0.2s' }}
        onMouseEnter={e => { if (customers.length > 0) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)' }}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div className="card-body text-center p-3">
          <div className={`text-${color} mb-2`}>{icon}</div>
          <h4 className="mb-1">{count}</h4>
          <small className="text-muted">{label}</small>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">Insurance Calling App</span>
          <div className="d-flex align-items-center">
            <small className="text-light me-3 d-none d-md-block">{user?.email}</small>
            <button onClick={signOut} className="btn btn-outline-light btn-sm d-flex align-items-center">
              <LogOut size={16} className="me-1" />
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">

            {/* Customer Statistics */}
            <div className="card shadow-sm border-0 mb-3">
              <div className="card-header">
                <h5 className="card-title mb-0">Customer Statistics</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {statCard(<Users size={24} />, 'Total', total, 'primary', 'all')}
                  {statCard(<Clock size={24} />, 'Pending', pending, 'warning', 'pending')}
                  {statCard(<Clock size={24} />, 'In Progress', inProgress, 'info', 'called')}
                  {statCard(<CheckCircle size={24} />, 'Completed', completed, 'success', 'completed')}
                </div>
              </div>
            </div>

            {/* Call Status */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Call Status</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {callStatusItems.map(option => (
                    <div className="col-6 col-md-3" key={option.value}>
                      <div
                        className="card border-0 bg-light h-100"
                        onClick={() => customers.length > 0 && goToFiltered(option.filter)}
                        style={{ cursor: customers.length > 0 ? 'pointer' : 'default', transition: 'box-shadow 0.2s' }}
                        onMouseEnter={e => { if (customers.length > 0) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)' }}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <div className="card-body text-center p-3">
                          <span className={`badge bg-${option.color} mb-2 fs-5`}>{option.icon}</span>
                          <h4 className="mb-1">{option.count}</h4>
                          <small className="text-muted">{option.label}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CSV Upload */}
            <div className="card shadow-lg border-0 mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <Upload size={20} className="me-2" />
                  Upload Customer CSV
                </h5>
              </div>
              <div className="card-body p-4">
                <CsvUpload
                  onCustomersUpload={handleCsvUpload}
                  onDeleteCsv={handleDeleteCsv}
                  csvFileName={csvFileName}
                  onUploadComplete={() => goToFiltered('all')}
                />
              </div>
            </div>

            {customers.length > 0 && (
              <div className="d-grid col-12 col-md-6 mx-auto mb-4">
                <button onClick={() => goToFiltered('all')} className="btn btn-primary btn-lg">
                  View Customer List
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardNew
