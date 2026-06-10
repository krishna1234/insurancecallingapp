import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, MessageSquare, MessageCircle, FileText, CheckCircle, Clock, User, Car, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import ContactStatusDropdown from './ContactStatusDropdown';
import { CONTACT_STATUS_OPTIONS } from '../constants/contactStatus';

const FILTER_LABELS = {
  all: 'All Customers',
  pending: 'Pending',
  called: 'In Progress',
  completed: 'Completed',
  ...Object.fromEntries(CONTACT_STATUS_OPTIONS.map(o => [`contact_${o.value}`, o.label]))
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

const SingleCustomerViewNew = () => {
  const savedRaw = localStorage.getItem('customers');
  const allData = savedRaw ? JSON.parse(savedRaw).filter(c => c.ownerName && c.phone_number) : [];

  const [customers, setCustomers] = useState(allData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState('');
  const touchStartX = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const filter = new URLSearchParams(location.search).get('filter') || 'all';

  useEffect(() => { setCurrentIndex(0); }, [filter]);

  const updateCustomers = (updated) => {
    const validUpdated = updated.filter(c => c.ownerName && c.phone_number);
    setCustomers(validUpdated);
    localStorage.setItem('customers', JSON.stringify(updated));
  };

  const handleContactStatusChange = (customerId, contactStatus, customContactStatus) => {
    updateCustomers(customers.map(c =>
      c.id === customerId ? { ...c, contactStatus, customContactStatus } : c
    ));
  };

  const handleActionComplete = (customerId, actionType) => {
    updateCustomers(customers.map(c => {
      if (c.id !== customerId) return c;
      const updated = { ...c, actionsCompleted: { ...c.actionsCompleted, [actionType]: true } };
      if (updated.status === 'pending') updated.status = 'called';
      return updated;
    }));
  };

  const handleNotesChange = (customerId, notes) => {
    updateCustomers(customers.map(c => c.id === customerId ? { ...c, notes } : c));
  };

  const handleCall = (c) => { window.open(`tel:${c.phone_number}`, '_self'); handleActionComplete(c.id, 'called'); };
  const handleSMS = (c) => {
    const msg = "Hello! This is regarding your vehicle insurance renewal. Please call us back for more details.";
    window.open(`sms:${c.phone_number}?body=${encodeURIComponent(msg)}`, '_self');
    handleActionComplete(c.id, 'sms');
  };
  const handleWhatsApp = (c) => {
    const msg = "Hello! This is regarding your vehicle insurance renewal. Please call us back for more details.";
    window.open(`https://wa.me/${c.phone_number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    handleActionComplete(c.id, 'whatsapp');
  };

  const getActionStatus = (c, type) => c?.actionsCompleted?.[type] || false;
  const getStatusIcon = (s) => s === 'completed' ? <CheckCircle className="text-success" size={16} /> : <Clock className={s === 'called' ? 'text-warning' : 'text-muted'} size={16} />;
  const getStatusText = (s) => s === 'completed' ? 'Completed' : s === 'called' ? 'In Progress' : 'Pending';

  const filteredCustomers = applyFilter(customers, filter);
  const currentCustomer = filteredCustomers[currentIndex];

  const atLeastOneActionDone = currentCustomer?.actionsCompleted &&
    (currentCustomer.actionsCompleted.called || currentCustomer.actionsCompleted.sms || currentCustomer.actionsCompleted.whatsapp);

  const slideTo = (dir) => {
    if (animating) return;
    if (dir === 'next' && (currentIndex >= filteredCustomers.length - 1 || !atLeastOneActionDone)) return;
    if (dir === 'prev' && currentIndex === 0) return;
    setSlideDir(dir === 'next' ? 'left' : 'right');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(i => dir === 'next' ? i + 1 : i - 1);
      setSlideDir('');
      setAnimating(false);
    }, 250);
  };

  // Touch swipe
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) slideTo(diff > 0 ? 'next' : 'prev');
    touchStartX.current = null;
  };

  const NavBar = () => (
    <nav className="navbar navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <button onClick={() => { navigate('/dashboard') }} className="btn btn-outline-light btn-sm d-flex align-items-center me-2">
            <ArrowLeft size={16} className="me-1" /><span>Back</span>
          </button>
          <span className="navbar-brand fw-bold mb-0">{FILTER_LABELS[filter] || 'Customers'}</span>
        </div>
        <small className="text-light">{filteredCustomers.length} customers</small>
      </div>
    </nav>
  );

  if (filteredCustomers.length === 0) {
    return (
      <div className="min-vh-100 bg-light">
        <NavBar />
        <div className="container-fluid py-4 text-center text-muted">
          <p className="mt-5">No customers found for this filter.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />

      {/* Progress dots */}
      <div className="d-flex justify-content-center align-items-center py-2 gap-1 flex-wrap px-3">
        {filteredCustomers.length <= 20 && filteredCustomers.map((_, i) => (
          <div
            key={i}
            style={{ width: 8, height: 8, borderRadius: '50%', background: i === currentIndex ? '#0d6efd' : '#ccc', transition: 'background 0.2s' }}
          />
        ))}
        {filteredCustomers.length > 20 && (
          <small className="text-muted">{currentIndex + 1} / {filteredCustomers.length}</small>
        )}
      </div>

      {/* Carousel Wrapper */}
      <div
        className="container-fluid px-2"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ overflow: 'hidden' }}
      >
        <div
          style={{
            transition: animating ? 'transform 0.25s ease, opacity 0.25s ease' : 'none',
            transform: animating ? (slideDir === 'left' ? 'translateX(-30px)' : 'translateX(30px)') : 'translateX(0)',
            opacity: animating ? 0 : 1,
          }}
        >
          {currentCustomer && (
            <div className="card shadow-sm border-0 mb-3">
              <div className="card-body p-3">

                {/* Customer Info */}
                <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" style={{ width: 42, height: 42, minWidth: 42 }}>
                    <User size={20} color="white" />
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-0 h6 fw-bold">{currentCustomer.ownerName}</h5>
                    <p className="text-muted mb-0 small">{currentCustomer.phone_number}</p>
                  </div>
                  <div className="d-flex align-items-center">
                    {getStatusIcon(currentCustomer.status)}
                    <small className="ms-1 text-muted">{getStatusText(currentCustomer.status)}</small>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="row mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Vehicle No.</small>
                    <p className="mb-0 small fw-semibold">{currentCustomer.vehicle_number}</p>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Make / Model</small>
                    <p className="mb-0 small">{currentCustomer.make} {currentCustomer.model}</p>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Reg Date</small>
                    <p className="mb-0 small">{currentCustomer.reg_date}</p>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Insurance Expiry</small>
                    <p className="mb-0 small">{currentCustomer.vehicleInsuranceUpto}</p>
                  </div>
                </div>

                {/* Contact Status */}
                <div className="mb-3">
                  <ContactStatusDropdown
                    contactStatus={currentCustomer.contactStatus || ''}
                    customContactStatus={currentCustomer.customContactStatus || ''}
                    onChange={(status, custom) => handleContactStatusChange(currentCustomer.id, status, custom)}
                    size="sm"
                    showLabel={true}
                  />
                </div>

                {/* Action Buttons */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <button
                      onClick={() => handleCall(currentCustomer)}
                      className={`btn w-100 ${getActionStatus(currentCustomer, 'called') ? 'btn-success' : 'btn-outline-success'} d-flex align-items-center justify-content-center`}
                    >
                      <Phone size={16} className="me-1" /> Call
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      onClick={() => handleSMS(currentCustomer)}
                      className={`btn w-100 ${getActionStatus(currentCustomer, 'sms') ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center justify-content-center`}
                    >
                      <MessageSquare size={16} className="me-1" /> SMS
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      onClick={() => handleWhatsApp(currentCustomer)}
                      className={`btn w-100 ${getActionStatus(currentCustomer, 'whatsapp') ? 'btn-success' : 'btn-outline-success'} d-flex align-items-center justify-content-center`}
                    >
                      <MessageCircle size={16} className="me-1" /> WhatsApp
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      onClick={() => setSelectedCustomer(currentCustomer)}
                      className="btn w-100 btn-outline-secondary d-flex align-items-center justify-content-center"
                    >
                      <FileText size={16} className="me-1" /> Notes
                    </button>
                  </div>
                </div>

                {/* Action badges */}
                <div className="d-flex justify-content-center gap-2">
                  <span className={`badge ${getActionStatus(currentCustomer, 'called') ? 'bg-success' : 'bg-light text-muted'}`}>Call</span>
                  <span className={`badge ${getActionStatus(currentCustomer, 'sms') ? 'bg-primary' : 'bg-light text-muted'}`}>SMS</span>
                  <span className={`badge ${getActionStatus(currentCustomer, 'whatsapp') ? 'bg-success' : 'bg-light text-muted'}`}>WhatsApp</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prev / Next buttons */}
      <div className="d-flex justify-content-between align-items-center px-3 pb-4">
        <button
          onClick={() => slideTo('prev')}
          disabled={currentIndex === 0}
          className="btn btn-outline-secondary d-flex align-items-center"
        >
          <ChevronLeft size={20} className="me-1" /> Prev
        </button>

        {!atLeastOneActionDone
          ? <small className="text-warning fw-semibold text-center">Complete one action to go next</small>
          : <small className="text-success fw-semibold text-center">✓ Ready for next</small>
        }

        <button
          onClick={() => slideTo('next')}
          disabled={currentIndex >= filteredCustomers.length - 1 || !atLeastOneActionDone}
          className={`btn d-flex align-items-center ${atLeastOneActionDone ? 'btn-primary' : 'btn-outline-secondary'}`}
        >
          Next <ChevronRight size={20} className="ms-1" />
        </button>
      </div>

      {/* Notes Modal */}
      {selectedCustomer && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title h6">Notes: {selectedCustomer.ownerName}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedCustomer(null)}></button>
              </div>
              <div className="modal-body">
                <textarea
                  value={selectedCustomer.notes || ''}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, notes: e.target.value })}
                  className="form-control"
                  rows="4"
                  placeholder="Add notes about this customer..."
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCustomer(null)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={() => { handleNotesChange(selectedCustomer.id, selectedCustomer.notes); setSelectedCustomer(null); }}>
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
