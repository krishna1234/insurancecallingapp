import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, MessageCircle, FileText, CheckCircle, Clock, User, Car, Calendar, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

const SingleCustomerViewNew = () => {
  const [customers, setCustomers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const navigate = useNavigate();

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

  // Mobile-friendly navigation bar
  const NavBar = () => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline-light btn-sm d-flex align-items-center me-2"
          >
            <ArrowLeft size={16} className="me-1" />
            <span>Back</span>
          </button>
          <span className="navbar-brand fw-bold mb-0">
            Customer Details
          </span>
        </div>
        
        <div className="d-flex align-items-center">
          <div className="me-2">
            <small className="text-light">
              {csvFileName && `${csvFileName.substring(0, 15)}${csvFileName.length > 15 ? '...' : ''}`}
            </small>
          </div>
        </div>
      </div>
    </nav>
  );

  if (filteredCustomers.length === 0) {
    return (
      <div className="min-vh-100 bg-light">
        <NavBar />
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
        <NavBar />
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
      <NavBar />
      
      <div className="container-fluid py-3">
        <div className="card shadow-sm">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="card-title h5 mb-0">Customer Details</h2>
              <span className="badge bg-primary">
                {currentIndex + 1} of {filteredCustomers.length}
              </span>
            </div>
          </div>
          
          <div className="card-body">
            {/* Navigation Controls */}
            <div className="d-flex justify-content-between align-items-center mb-4 position-relative">
              {!atLeastOneActionDone && (
                <div className="position-absolute top-0 start-50 translate-middle-x mt-2 w-100 text-center">
                  <div className="alert alert-warning py-1 px-2 d-inline-block shadow-sm small" role="alert">
                    Complete at least one action to proceed
                  </div>
                </div>
              )}
              
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="btn btn-sm btn-outline-secondary d-flex align-items-center"
              >
                <ChevronLeft size={18} className="me-1" />
                <span>Prev</span>
              </button>

              <button
                onClick={goToNext}
                disabled={currentIndex === filteredCustomers.length - 1 || !atLeastOneActionDone}
                className={`btn btn-sm ${atLeastOneActionDone ? 'btn-primary' : 'btn-outline-secondary'} d-flex align-items-center`}
              >
                <span>Next</span>
                <ChevronRight size={18} className="ms-1" />
              </button>
            </div>

            {/* Customer Card */}
            <div className="card h-100 shadow-sm border-0 customer-card mb-3">
              <div className="card-body p-3">
                {/* Customer Info */}
                <div className="d-flex align-items-center mb-3">
                  <User className="text-primary me-2" size={20} />
                  <div className="flex-grow-1">
                    <h5 className="card-title mb-0 h6">{currentCustomer.ownerName}</h5>
                    <p className="text-muted mb-0 small">{currentCustomer.phone_number}</p>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="d-flex align-items-center mb-3">
                  <Car className="text-info me-2" size={20} />
                  <div className="flex-grow-1">
                    <h6 className="mb-0 small fw-bold">{currentCustomer.vehicle_number}</h6>
                    <p className="text-muted mb-0 small">{currentCustomer.make} {currentCustomer.model}</p>
                  </div>
                </div>

                <div className="row mb-3">
                  {/* Registration Date */}
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <Calendar className="text-secondary me-2" size={16} />
                      <div>
                        <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>Registration Date</small>
                        <p className="mb-0 small">{currentCustomer.reg_date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Expiry */}
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <Calendar className="text-danger me-2" size={16} />
                      <div>
                        <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>Insurance Expiry</small>
                        <p className="mb-0 small">{currentCustomer.vehicleInsuranceUpto}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="d-flex align-items-center mb-3">
                  {getStatusIcon(currentCustomer.status)}
                  <span className="ms-2 small fw-medium">
                    {getStatusText(currentCustomer.status)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <button
                    onClick={() => handleCall(currentCustomer)}
                    className={`btn ${getActionStatus(currentCustomer, 'called') ? 'btn-success' : 'btn-outline-success'} d-flex align-items-center justify-content-center`}
                    title="Call"
                  >
                    <Phone size={18} className="me-2" />
                    <span>Call</span>
                  </button>
                  
                  <button
                    onClick={() => handleSMS(currentCustomer)}
                    className={`btn ${getActionStatus(currentCustomer, 'sms') ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center justify-content-center`}
                    title="SMS"
                  >
                    <MessageSquare size={18} className="me-2" />
                    <span>SMS</span>
                  </button>
                  
                  <button
                    onClick={() => handleWhatsApp(currentCustomer)}
                    className={`btn ${getActionStatus(currentCustomer, 'whatsapp') ? 'btn-success' : 'btn-outline-success'} d-flex align-items-center justify-content-center`}
                    title="WhatsApp"
                  >
                    <MessageCircle size={18} className="me-2" />
                    <span>WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedCustomer(currentCustomer)}
                    className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                    title="Add Notes"
                  >
                    <FileText size={18} className="me-2" />
                    <span>Notes</span>
                  </button>
                </div>

                {/* Action Status Indicators */}
                <div className="mt-3 d-flex justify-content-center gap-2">
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
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title h6">
                  Notes: {selectedCustomer.ownerName}
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
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
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

export default SingleCustomerViewNew;