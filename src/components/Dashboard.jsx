import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import CsvUpload from './CsvUpload'
import { LogOut, Upload, Users, CheckCircle, Clock } from 'lucide-react'

const Dashboard = () => {
  const { user, signOut } = useAuth()
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

  const handleCsvUpload = (newCustomers, fileName) => {
    setCustomers(newCustomers)
    setCsvFileName(fileName)
    localStorage.setItem('customers', JSON.stringify(newCustomers))
    localStorage.setItem('csvFileName', fileName)
    // Navigate to customer list after successful upload
    setTimeout(() => navigate('/customer-list'), 100) // Small delay to ensure data is saved
  }

  const handleDeleteCsv = () => {
    setCustomers([])
    setCsvFileName('')
    localStorage.removeItem('customers')
    localStorage.removeItem('csvFileName')
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
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">
            Insurance Calling App
          </span>
          
          <div className="d-flex align-items-center">
            <div className="d-none d-md-block me-3">
              <small className="text-light">
                Welcome, {user?.email}
              </small>
            </div>
            <button
              onClick={signOut}
              className="btn btn-outline-light btn-sm d-flex align-items-center"
            >
              <LogOut size={16} className="me-1" />
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* Welcome Section */}
            <div className="text-center mb-5">
              <h1 className="display-5 fw-bold mb-3">Welcome to Insurance Calling App</h1>
              <p className="lead text-muted">
                Upload your customer CSV file to start managing calls, SMS, and WhatsApp communications.
              </p>
            </div>

            {/* CSV Upload Section */}
            <div className="card shadow-lg border-0 mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <Upload size={24} className="me-2" />
                  Upload Customer CSV
                </h5>
              </div>
              <div className="card-body p-4">
                <CsvUpload 
                  onCustomersUpload={handleCsvUpload}
                  onDeleteCsv={handleDeleteCsv}
                  csvFileName={csvFileName}
                  onUploadComplete={() => navigate('/customer-list')}
                />
              </div>
            </div>

            {/* Stats Section - Only show if customers exist */}
            {customers.length > 0 && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Upload Summary</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3">
                      <div className="card border-0 bg-light h-100">
                        <div className="card-body text-center p-3">
                          <Users className="text-primary mb-2" size={24} />
                          <h4 className="mb-1">{stats.total}</h4>
                          <small className="text-muted">Total Customers</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-6 col-md-3">
                      <div className="card border-0 bg-light h-100">
                        <div className="card-body text-center p-3">
                          <Clock className="text-warning mb-2" size={24} />
                          <h4 className="mb-1">{stats.pending}</h4>
                          <small className="text-muted">Pending</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-6 col-md-3">
                      <div className="card border-0 bg-light h-100">
                        <div className="card-body text-center p-3">
                          <Clock className="text-info mb-2" size={24} />
                          <h4 className="mb-1">{stats.inProgress}</h4>
                          <small className="text-muted">In Progress</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-6 col-md-3">
                      <div className="card border-0 bg-light h-100">
                        <div className="card-body text-center p-3">
                          <CheckCircle className="text-success mb-2" size={24} />
                          <h4 className="mb-1">{stats.completed}</h4>
                          <small className="text-muted">Completed</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard