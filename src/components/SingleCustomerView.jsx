import React, { useState, useEffect } from 'react';
import CustomerNavigation from './CustomerNavigation';
import { Phone, MessageSquare, MessageCircle, FileText, CheckCircle, Clock, User, Car, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const SingleCustomerView = () => {
  const [customers, setCustomers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');

  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    const savedFileName = localStorage.getItem('csvFileName');
    
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
    if (savedFileName) {
      setCsvFileName(savedFileName);
    }
  }, []);

  const handleActionComplete = (customerId, actionType) => {
    const updatedCustomers = customers.map(customer => {
      if (customer.id === customerId) {
        const updatedCustomer = { ...customer };
        if (!updatedCustomer.actionsCompleted) {
          updatedCustomer.actionsCompleted = {
            called: false,
            sms: false,
            whatsapp: false
          };
        }
        updatedCustomer.actionsCompleted[actionType] = true;
        
        if (updatedCustomer.status === 'pending') {
          updatedCustomer.status = 'called';
        }
        
        return updatedCustomer;
      }
      return customer;
    });
    
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
  };

  const handleNotesChange = (customerId, newNotes) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === customerId 
        ? { ...customer, notes: newNotes }
        : customer
    );
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
  };

  const handleCall = (customer) => {
    window.open(`tel:${customer.phone_number}`, '_self');
    handleActionComplete(customer.id, 'called');
  };

  const handleSMS = (customer) => {
    const defaultMessage = "Hello! This is regarding your vehicle insurance renewal. Please call us back for more details.";
    window.open(`sms:${customer.phone_number}?body=${encodeURIComponent(defaultMessage)}`, '_self');
    handleActionComplete(customer.id, 'sms');
  };

  const handleWhatsApp = (customer) => {
    const defaultMessage = "Hello! This is regarding your vehicle insurance renewal. Please call us back for more details.";
    const whatsappUrl = `https://wa.me/${customer.phone_number.replace(/\D/g, '')}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(whatsappUrl, '_blank');
    handleActionComplete(customer.id, 'whatsapp');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-success" size={20} />;
      case 'called':
        return <Clock className="text-warning" size={20} />;
      default:
        return <Clock className="text-muted" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'called':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  const getActionStatus = (customer, actionType) => {
    if (!customer?.actionsCompleted) return false;
    return customer.actionsCompleted[actionType] || false;
  };

  const filteredCustomers = customers.filter(customer => 
    customer.ownerName && customer.phone_number
  );

  const currentCustomer = filteredCustomers[currentIndex];

  // Check if at least one action is done
  const atLeastOneActionDone = currentCustomer && currentCustomer.actionsCompleted &&
    (currentCustomer.actionsCompleted.called ||
    currentCustomer.actionsCompleted.sms ||
    currentCustomer.actionsCompleted.whatsapp);

  const goToNext = () => {
    if (currentIndex < filteredCustomers.length - 1 && atLeastOneActionDone) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (filteredCustomers.length === 0) {
    return (
      <div className="min-vh-100 bg-light">
        <CustomerNavigation csvFileName={csvFileName} />
        <div className="container-fluid py-4">
          <div className="card shadow-sm">
            <div className="card-body text-center text-muted py-5">
              <p className="mb-0">No customers loaded. Please upload a CSV file first.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCustomer) {
    return (
      <div className="min-vh-100 bg-light">
        <CustomerNavigation csvFileName={csvFileName} />
        <div className="container-fluid py-4">
          <div className="card shadow-sm">
            <div className="card-body text-center text-muted py-5">
              <p className="mb-0">Loading customer data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <CustomerNavigation csvFileName={csvFileName} />
      
      <div className="container-fluid py-4">
        <div className="card shadow-sm">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="card-title h4 mb-0">Customer Details</h2>
              {/* <span className="badge bg-primary">
                {currentIndex + 1} of {filteredCustomers.length}
              </span> */}
            </div>
          </div>
          
          <div className="card-body">
            {/* Navigation Controls */}
            <div className="d-flex justify-content-between align-items-center mb-4 position-relative">
              {!atLeastOneActionDone && (
                <div className="position-absolute top-0 start-50 translate-middle-x mt-2">
                  <div className="alert alert-warning py-1 px-3 d-inline-block shadow-sm" role="alert">
                    <small>Complete at least one action to proceed to next customer</small>
                  </div>
                </div>
              )}
              
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="btn btn-outline-secondary d-flex align-items-center"
              >
                <ChevronLeft size={20} className="me-1" />
                <span>Previous</span>
              </button>

              <button
                onClick={goToNext}
                disabled={currentIndex === filteredCustomers.length - 1 || !atLeastOneActionDone}
                className={`btn ${atLeastOneActionDone ? 'btn-primary' : 'btn-outline-secondary'} d-flex align-items-center`}
              >
                <span>Next</span>
                <ChevronRight size={20} className="ms-1" />
              </button>
            </div>

            {/* Customer Card */}
            <div className="card h-100 shadow-sm border-0 customer-card mb-4">
              <div className="card-body p-4">
                {/* Customer Info */}
                <div className="d-flex align-items-center mb-4">
                  <User className="text-primary me-3" size={24} />
                  <div className="flex-grow-1">
                    <h5 className="card-title mb-1">{currentCustomer.ownerName}</h5>
                    <p className="text-muted mb-0">{currentCustomer.phone_number}</p>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="d-flex align-items-center mb-4">
                  <Car className="text-info me-3" size={24} />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{currentCustomer.vehicle_number}</h6>
                    <p className="text-muted mb-0">{currentCustomer.make} {currentCustomer.model}</p>
                  </div>
                </div>

                {/* Registration Date */}
                <div className="d-flex align-items-center mb-4">
                  <Calendar className="text-secondary me-3" size={24} />
                  <div>
                    <small className="text-muted">Registration Date</small>
                    <p className="mb-0 fw-medium">{currentCustomer.reg_date}</p>
                  </div>
                </div>

                {/* Insurance Expiry */}
                <div className="mb-4">
                  <small className="text-muted">Insurance Expiry</small>
                  <p className="mb-0 fw-medium">{currentCustomer.vehicleInsuranceUpto}</p>
                </div>

                {/* Status */}
                <div className="d-flex align-items-center mb-4">
                  {getStatusIcon(currentCustomer.status)}
                  <span className="ms-2 fw-medium">
                    {getStatusText(currentCustomer.status)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-3">
                  <button
                    onClick={() => handleCall(currentCustomer)}
                    className={`btn ${getActionStatus(currentCustomer, 'called') ? 'btn-success' : 'btn-outline-success'} btn-lg d-flex align-items-center justify-content-center`}
                    title="Call"
                  >
                    <Phone size={20} className="me-2" />
                    <span>Call</span>
                  </button>
                  
                  <button
                    onClick={() => handleSMS(currentCustomer)}
                    className={`btn ${getActionStatus(currentCustomer, 'sms') ? 'btn-primary' : 'btn-outline-primary'} btn-lg d-flex align-items-center justify-content-center`}
                    title="SMS"
                  >
                    <MessageSquare size={20} className="me-2" />
                    <span>SMS</span>
                  </button>
                  
                  <button
                    onClick={() => handleWhatsApp(currentCustomer)}
                    className={`btn ${getActionStatus(currentCustomer, 'whatsapp') ? 'btn-success' : 'btn-outline-success'} btn-lg d-flex align-items-center justify-content-center`}
                    title="WhatsApp"
                  >
                    <MessageCircle size={20} className="me-2" />
                    <span>WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedCustomer(currentCustomer)}
                    className="btn btn-outline-secondary btn-lg d-flex align-items-center justify-content-center"
                    title="Add Notes"
                  >
                    <FileText size={20} className="me-2" />
                    <span>Notes</span>
                  </button>
                </div>

                {/* Action Status Indicators */}
                <div className="mt-4 d-flex justify-content-center gap-2">
                  <small className={`badge ${getActionStatus(currentCustomer, 'called') ? 'bg-success' : 'bg-light text-muted'}`}>
                    Call
                  </small>
                  <small className={`badge ${getActionStatus(currentCustomer, 'sms') ? 'bg-primary' : 'bg-light text-muted'}`}>
                    SMS
                  </small>
                  <small className={`badge ${getActionStatus(currentCustomer, 'whatsapp') ? 'bg-success' : 'bg-light text-muted'}`}>
                    WhatsApp
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {selectedCustomer && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Add Notes for {selectedCustomer.ownerName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedCustomer(null)}
                ></button>
              </div>
              <div className="modal-body">
                <textarea
                  value={selectedCustomer.notes || ''}
                  onChange={(e) => {
                    const updatedCustomer = { ...selectedCustomer, notes: e.target.value };
                    setSelectedCustomer(updatedCustomer);
                  }}
                  className="form-control"
                  rows="4"
                  placeholder="Add notes about this customer..."
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    handleNotesChange(selectedCustomer.id, selectedCustomer.notes);
                    setSelectedCustomer(null);
                  }}
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleCustomerView;