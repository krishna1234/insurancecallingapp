import React, { useState } from 'react'
import Papa from 'papaparse'
import { Upload, FileText, AlertCircle, Trash2 } from 'lucide-react'

const CsvUploadNew = ({ onCustomersUpload, onDeleteCsv, csvFileName, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsUploading(false)
        
        if (results.errors.length > 0) {
          setError('Error parsing CSV file. Please check the file format.')
          return
        }

        const customers = results.data
          .filter(row => row.ownerName || row['Owner Name'] || row['owner name'])
          .map((row, index) => {
            // Flexible header mapping
            const customer = {
              id: index + 1,
              ownerName: row.ownerName || row['Owner Name'] || row['owner name'] || row['OWNER NAME'] || '',
              phone_number: row.phone_number || row['Phone Number'] || row['phone number'] || row['PHONE NUMBER'] || row['Phone'] || row['phone'] || '',
              vehicle_number: row.vehicle_number || row['Vehicle Number'] || row['vehicle number'] || row['VEHICLE NUMBER'] || row['Vehicle'] || row['vehicle'] || '',
              model: row.model || row['Model'] || row['MODEL'] || '',
              make: row.make || row['Make'] || row['MAKE'] || '',
              reg_date: row.reg_date || row['Reg Date'] || row['reg date'] || row['REG DATE'] || row['Registration Date'] || '',
              vehicleInsuranceUpto: row.vehicleInsuranceUpto || row['Vehicle Insurance Upto'] || row['vehicle insurance upto'] || row['VEHICLE INSURANCE UPTO'] || row['Insurance'] || row['insurance'] || '',
              status: 'pending',
              contactStatus: '',
              customContactStatus: '',
              notes: '',
              actionsCompleted: {
                called: false,
                sms: false,
                whatsapp: false
              }
            }

            return customer
          })

        if (customers.length === 0) {
          setError('No valid customer data found. Please check your CSV headers.')
          return
        }

        // Check for required fields
        const missingFields = customers.filter(customer => 
          !customer.ownerName || !customer.phone_number
        )

        if (missingFields.length > 0) {
          setError(`Missing required fields (ownerName, phone_number) in ${missingFields.length} rows.`)
          return
        }

        onCustomersUpload(customers, file.name)
        
        // Navigate to customer list after successful upload
        if (onUploadComplete) {
          setTimeout(() => onUploadComplete(), 100)
        }
      },
      error: (error) => {
        setIsUploading(false)
        setError('Error reading file. Please try again.')
      }
    })
  }

  return (
    <div className="csv-upload">
      {!csvFileName ? (
        <div className="text-center">
          <div className="upload-area border-2 border-dashed border-secondary rounded p-3 mb-3">
            <Upload className="text-muted mb-2" size={36} />
            <h6 className="mb-2">Upload Customer CSV</h6>
            <p className="text-muted small mb-3">
              Required headers: ownerName, phone_number, vehicle_number, model, make, reg_date, vehicleInsuranceUpto
            </p>
            <div className="d-grid">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="form-control"
                disabled={isUploading}
              />
            </div>
          </div>
          
          {error && (
            <div className="alert alert-danger d-flex align-items-center small py-2" role="alert">
              <AlertCircle size={16} className="me-2" />
              {error}
            </div>
          )}
          
          {isUploading && (
            <div className="alert alert-info d-flex align-items-center small py-2" role="alert">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Uploading and processing CSV...
            </div>
          )}
        </div>
      ) : (
        <div className="uploaded-file text-center">
          <div className="d-flex align-items-center justify-content-center p-3 bg-light rounded mb-3">
            <FileText className="text-primary me-2" size={20} />
            <div>
              <strong className="d-block">{csvFileName}</strong>
              <small className="text-muted">CSV file uploaded successfully</small>
            </div>
          </div>
          <div className="d-grid">
            <button
              onClick={onDeleteCsv}
              className="btn btn-outline-danger d-flex align-items-center justify-content-center mx-auto"
              title="Delete CSV"
            >
              <Trash2 size={18} className="me-2" />
              Delete CSV File
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CsvUploadNew