import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  MessageSquare,
  MessageCircle,
  FileText,
  CheckCircle,
  Clock,
  User,
  Car,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ContactStatusDropdown from "./ContactStatusDropdown";
import { isContactStatusComplete } from "../constants/contactStatus";

const CustomerList = ({ customers, onCustomerUpdate }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isInitialMount = useRef(true);

  const handleActionComplete = (customerId, actionType) => {
    const updatedCustomers = customers.map((customer) => {
      if (customer.id === customerId) {
        const updatedCustomer = { ...customer };
        if (!updatedCustomer.actionsCompleted) {
          updatedCustomer.actionsCompleted = {
            called: false,
            sms: false,
            whatsapp: false,
          };
        }
        updatedCustomer.actionsCompleted[actionType] = true;
        const allCompleted =
          updatedCustomer.actionsCompleted.called &&
          updatedCustomer.actionsCompleted.sms &&
          updatedCustomer.actionsCompleted.whatsapp;
        if (allCompleted) {
          updatedCustomer.status = "completed";
        } else if (updatedCustomer.status === "pending") {
          updatedCustomer.status = "called";
        }
        return updatedCustomer;
      }
      return customer;
    });
    onCustomerUpdate(updatedCustomers);
  };

  const handleNotesChange = (customerId, newNotes) => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === customerId ? { ...customer, notes: newNotes } : customer,
    );
    onCustomerUpdate(updatedCustomers);
  };

  const handleContactStatusChange = (
    customerId,
    contactStatus,
    customContactStatus = "",
  ) => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === customerId
        ? { ...customer, contactStatus, customContactStatus }
        : customer,
    );
    onCustomerUpdate(updatedCustomers);

    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer((prev) => ({
        ...prev,
        contactStatus,
        customContactStatus,
      }));
    }
  };

  const handleCall = (customer) => {
    window.open(`tel:${customer.phone_number}`, "_self");
    handleActionComplete(customer.id, "called");
  };

  const getInsuranceMessage = (customer) => {
    return `Dear ${customer.ownerName}, your vehicle (${customer.make} ${customer.model}, Reg: ${customer.vehicle_number}) insurance is expiring on ${customer.vehicleInsuranceUpto}. Please contact us to renew your policy and stay protected. - Insurance Team`;
  };

  const getWhatsAppMessage = (customer) => {
    return `Dear ${customer.ownerName}, your vehicle (${customer.make} ${customer.model}, Reg: ${customer.vehicle_number}) insurance is expiring on ${customer.vehicleInsuranceUpto}. Please contact us to renew your policy and stay protected. Also, kindly share RC copy, Insurance Copy, Aadhaar card and Pan card. - Insurance Team`;
  };

  const handleSMS = (customer) => {
    const message = getInsuranceMessage(customer);
    window.open(
      `sms:${customer.phone_number}?body=${encodeURIComponent(message)}`,
      "_self",
    );
    handleActionComplete(customer.id, "sms");
  };

  const handleWhatsApp = (customer) => {
    const message = getWhatsAppMessage(customer);
    let phone = customer.phone_number.replace(/\D/g, "");
    if (!phone.startsWith("91")) {
      phone = "91" + phone;
    }
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(whatsappUrl, "_blank");
    handleActionComplete(customer.id, "whatsapp");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-success" size={20} />;
      case "called":
        return <Clock className="text-warning" size={20} />;
      default:
        return <Clock className="text-muted" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "called":
        return "In Progress";
      default:
        return "Pending";
    }
  };

  const getActionStatus = (customer, actionType) => {
    if (!customer.actionsCompleted) return false;
    return customer.actionsCompleted[actionType] || false;
  };

  const filteredCustomers = customers.filter(
    (customer) => customer.ownerName && customer.phone_number,
  );

  const hasNoAction = (customer) => {
    if (!customer.actionsCompleted) return true;
    return (
      !customer.actionsCompleted.called &&
      !customer.actionsCompleted.sms &&
      !customer.actionsCompleted.whatsapp
    );
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const firstNoActionIndex = filteredCustomers.findIndex((c) =>
        hasNoAction(c),
      );
      if (firstNoActionIndex !== -1) {
        setCurrentIndex(firstNoActionIndex);
      }
    }
  }, [filteredCustomers]);

  const currentCustomer = filteredCustomers[currentIndex];

  const atLeastOneActionDone =
    currentCustomer &&
    currentCustomer.actionsCompleted &&
    (currentCustomer.actionsCompleted.called ||
      currentCustomer.actionsCompleted.sms ||
      currentCustomer.actionsCompleted.whatsapp);

  const hasContactStatus =
    currentCustomer && isContactStatusComplete(currentCustomer);
  const canGoToNext = atLeastOneActionDone && hasContactStatus;

  const getProceedMessage = () => {
    const missing = [];
    if (!atLeastOneActionDone) missing.push("complete at least one action");
    if (!hasContactStatus) missing.push("select a status");
    return `Please ${missing.join(" and ")} to proceed to the next customer`;
  };

  const goToNext = () => {
    if (!canGoToNext) return;
    const nextNoActionIndex = filteredCustomers.findIndex(
      (c, i) => i > currentIndex && hasNoAction(c),
    );
    if (nextNoActionIndex !== -1) {
      setCurrentIndex(nextNoActionIndex);
    } else if (currentIndex < filteredCustomers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToNextNoAction = () => {
    const nextNoActionIndex = filteredCustomers.findIndex(
      (c, i) => i > currentIndex && hasNoAction(c),
    );
    if (nextNoActionIndex !== -1) {
      setCurrentIndex(nextNoActionIndex);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToPending = () => {
    const pendingIndex = filteredCustomers.findIndex(
      (customer) => customer.status === "pending",
    );
    if (pendingIndex !== -1) {
      setCurrentIndex(pendingIndex);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="card-title h4 mb-0">Customer List</h2>
            <p className="text-muted mb-0 mt-1">
              {filteredCustomers.length} customers loaded
            </p>
          </div>
          {filteredCustomers.length > 0 && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary">
                {currentIndex + 1} of {filteredCustomers.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="card-body text-center text-muted py-5">
          <p className="mb-0">
            No customers loaded. Please upload a CSV file first.
          </p>
        </div>
      ) : (
        <div className="card-body">
          {/* Navigation Controls */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {!canGoToNext && currentIndex < filteredCustomers.length - 1 && (
              <div className="position-absolute top-0 start-50 translate-middle-x mt-2 w-100 text-center px-2">
                <div
                  className="alert alert-warning py-1 px-3 d-inline-block shadow-sm"
                  role="alert"
                >
                  <small>{getProceedMessage()}</small>
                </div>
              </div>
            )}
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="btn btn-outline-secondary d-flex align-items-center"
            >
              <ChevronLeft size={20} className="me-1" />
              <span className="d-none d-sm-inline">Previous</span>
            </button>

            <div className="d-flex gap-2">
              <button
                onClick={goToPending}
                className="btn btn-outline-warning btn-sm"
                disabled={
                  !filteredCustomers.some((c) => c.status === "pending")
                }
              >
                Find Pending
              </button>
              <button
                onClick={goToNextNoAction}
                className="btn btn-outline-info btn-sm"
                disabled={
                  !filteredCustomers.some(
                    (c, i) => i > currentIndex && hasNoAction(c),
                  )
                }
              >
                Find Next
              </button>
            </div>

            <button
              onClick={goToNext}
              disabled={
                currentIndex === filteredCustomers.length - 1 || !canGoToNext
              }
              className={`btn ${
                canGoToNext ? "btn-primary" : "btn-outline-secondary"
              } d-flex align-items-center`}
            >
              <span className="d-none d-sm-inline">Next</span>
              <ChevronRight size={20} className="ms-1" />
            </button>
          </div>

          {/* Single Customer Card */}
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div
                className="card h-100 shadow-sm border-0 customer-card position-relative"
                data-customer-id={currentCustomer.id}
              >
                <div className="card-body p-4">
                  {/* Customer Info */}
                  <div className="d-flex align-items-center mb-4">
                    <User className="text-primary me-3" size={24} />
                    <div className="flex-grow-1">
                      <h5 className="card-title mb-1">
                        {currentCustomer.ownerName}
                      </h5>
                      <p className="text-muted mb-0">
                        {currentCustomer.phone_number}
                      </p>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="d-flex align-items-center mb-4">
                    <Car className="text-info me-3" size={24} />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{currentCustomer.vehicle_number}</h6>
                      <p className="text-muted mb-0">
                        {currentCustomer.make} {currentCustomer.model}
                      </p>
                    </div>
                  </div>

                  {/* Registration Date */}
                  <div className="d-flex align-items-center mb-4">
                    <Calendar className="text-secondary me-3" size={24} />
                    <div>
                      <small className="text-muted">Registration Date</small>
                      <p className="mb-0 fw-medium">
                        {currentCustomer.reg_date}
                      </p>
                    </div>
                  </div>

                  {/* Insurance Expiry */}
                  <div className="mb-4">
                    <small className="text-muted">Insurance Expiry</small>
                    <p className="mb-0 fw-medium">
                      {currentCustomer.vehicleInsuranceUpto}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="d-flex align-items-center mb-4">
                    {getStatusIcon(currentCustomer.status)}
                    <span className="ms-2 fw-medium">
                      {getStatusText(currentCustomer.status)}
                    </span>
                  </div>

                  {/* Status Dropdown - above Notes */}
                  <div className="mb-3">
                    <ContactStatusDropdown
                      contactStatus={currentCustomer.contactStatus || ""}
                      customContactStatus={
                        currentCustomer.customContactStatus || ""
                      }
                      onChange={(status, customStatus) =>
                        handleContactStatusChange(
                          currentCustomer.id,
                          status,
                          customStatus,
                        )
                      }
                      required
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="d-grid gap-3">
                    <button
                      onClick={() => handleCall(currentCustomer)}
                      className={`btn ${
                        getActionStatus(currentCustomer, "called")
                          ? "btn-success"
                          : "btn-outline-success"
                      } btn-lg d-flex align-items-center justify-content-center`}
                      title="Call"
                    >
                      <Phone size={20} className="me-2" />
                      <span>Call</span>
                    </button>

                    <button
                      onClick={() => handleSMS(currentCustomer)}
                      className={`btn ${
                        getActionStatus(currentCustomer, "sms")
                          ? "btn-primary"
                          : "btn-outline-primary"
                      } btn-lg d-flex align-items-center justify-content-center`}
                      title="SMS"
                    >
                      <MessageSquare size={20} className="me-2" />
                      <span>SMS</span>
                    </button>

                    <button
                      onClick={() => handleWhatsApp(currentCustomer)}
                      className={`btn ${
                        getActionStatus(currentCustomer, "whatsapp")
                          ? "btn-success"
                          : "btn-outline-success"
                      } btn-lg d-flex align-items-center justify-content-center`}
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
                    <small
                      className={`badge ${
                        getActionStatus(currentCustomer, "called")
                          ? "bg-success"
                          : "bg-light text-muted"
                      }`}
                    >
                      Call
                    </small>
                    <small
                      className={`badge ${
                        getActionStatus(currentCustomer, "sms")
                          ? "bg-primary"
                          : "bg-light text-muted"
                      }`}
                    >
                      SMS
                    </small>
                    <small
                      className={`badge ${
                        getActionStatus(currentCustomer, "whatsapp")
                          ? "bg-success"
                          : "bg-light text-muted"
                      }`}
                    >
                      WhatsApp
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {selectedCustomer && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Status & Notes for {selectedCustomer.ownerName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedCustomer(null)}
                ></button>
              </div>
              <div className="modal-body">
                <ContactStatusDropdown
                  contactStatus={selectedCustomer.contactStatus || ""}
                  customContactStatus={
                    selectedCustomer.customContactStatus || ""
                  }
                  onChange={(status, customStatus) => {
                    const updatedCustomer = {
                      ...selectedCustomer,
                      contactStatus: status,
                      customContactStatus: customStatus,
                    };
                    setSelectedCustomer(updatedCustomer);
                    handleContactStatusChange(
                      selectedCustomer.id,
                      status,
                      customStatus,
                    );
                  }}
                  size="sm"
                />

                <div className="mt-3">
                  <label className="form-label fw-semibold">Notes</label>
                  <textarea
                    value={selectedCustomer.notes || ""}
                    onChange={(e) => {
                      const updatedCustomer = {
                        ...selectedCustomer,
                        notes: e.target.value,
                      };
                      setSelectedCustomer(updatedCustomer);
                    }}
                    className="form-control"
                    rows="4"
                    placeholder="Add notes about this customer..."
                  />
                </div>
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
                    handleNotesChange(
                      selectedCustomer.id,
                      selectedCustomer.notes,
                    );
                    setSelectedCustomer(null);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
