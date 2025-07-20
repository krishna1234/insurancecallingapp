import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CustomerNavigation = ({ csvFileName }) => {
  const navigate = useNavigate();
  
  return (
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
            Customer Details
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
  );
};

export default CustomerNavigation;