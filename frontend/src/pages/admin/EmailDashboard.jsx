import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './EmailDashboard.css';

const EmailDashboard = () => {
  const { getSentEmails } = useAuth();
  const [emails, setEmails] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = () => {
    const sentEmails = getSentEmails();
    setEmails(sentEmails);
  };

  const filteredEmails = filter === 'all' 
    ? emails 
    : emails.filter(email => email.type === filter);

  const getEmailTypeIcon = (type) => {
    switch(type) {
      case 'otp': return '🔐';
      case 'welcome': return '👋';
      case 'payment': return '💳';
      case 'password_reset': return '🔄';
      default: return '📧';
    }
  };

  const getEmailTypeLabel = (type) => {
    switch(type) {
      case 'otp': return 'OTP Verification';
      case 'welcome': return 'Welcome Email';
      case 'payment': return 'Payment Confirmation';
      case 'password_reset': return 'Password Reset';
      default: return 'General';
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="email-dashboard">
      <div className="dashboard-header">
        <h1>📧 Email Logs</h1>
        <p className="subtitle">View all sent emails from the system</p>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{emails.length}</div>
            <div className="stat-label">Total Emails</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{emails.filter(e => e.type === 'otp').length}</div>
            <div className="stat-label">OTP Emails</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{emails.filter(e => e.type === 'welcome').length}</div>
            <div className="stat-label">Welcome Emails</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{emails.filter(e => e.type === 'payment').length}</div>
            <div className="stat-label">Payment Emails</div>
          </div>
        </div>
      </div>

      <div className="email-content">
        <div className="email-sidebar">
          <div className="filter-section">
            <h3>Filter by Type</h3>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Emails
              </button>
              <button 
                className={`filter-btn ${filter === 'otp' ? 'active' : ''}`}
                onClick={() => setFilter('otp')}
              >
                🔐 OTP
              </button>
              <button 
                className={`filter-btn ${filter === 'welcome' ? 'active' : ''}`}
                onClick={() => setFilter('welcome')}
              >
                👋 Welcome
              </button>
              <button 
                className={`filter-btn ${filter === 'payment' ? 'active' : ''}`}
                onClick={() => setFilter('payment')}
              >
                💳 Payment
              </button>
              <button 
                className={`filter-btn ${filter === 'password_reset' ? 'active' : ''}`}
                onClick={() => setFilter('password_reset')}
              >
                🔄 Password Reset
              </button>
            </div>
          </div>

          <div className="instructions">
            <h3>📝 How it Works</h3>
            <ul>
              <li>✅ All emails are logged here for testing</li>
              <li>📧 No real emails are sent (mock service)</li>
              <li>🔐 OTPs are stored in localStorage</li>
              <li>👁️ Click any email to view details</li>
              <li>🔄 Refresh to see new emails</li>
            </ul>
          </div>
        </div>

        <div className="email-main">
          {selectedEmail ? (
            <div className="email-detail-view">
              <button 
                className="back-btn"
                onClick={() => setSelectedEmail(null)}
              >
                ← Back to List
              </button>
              
              <div className="email-detail-card">
                <div className="email-header">
                  <div className="email-type-badge">
                    <span className="type-icon">{getEmailTypeIcon(selectedEmail.type)}</span>
                    <span className="type-label">{getEmailTypeLabel(selectedEmail.type)}</span>
                  </div>
                  <div className="email-meta">
                    <p><strong>To:</strong> {selectedEmail.to}</p>
                    <p><strong>Sent:</strong> {formatDate(selectedEmail.timestamp)}</p>
                    <p><strong>Subject:</strong> {selectedEmail.subject}</p>
                  </div>
                </div>

                <div className="email-body">
                  <div className="email-content-preview">
                    {selectedEmail.type === 'otp' && (
                      <>
                        <p><strong>{selectedEmail.content.greeting}</strong></p>
                        <p>{selectedEmail.content.message}</p>
                        <div className="otp-display">
                          <h4>Your OTP Code:</h4>
                          <div className="otp-code">
                            {selectedEmail.content.otp.split('').map((digit, idx) => (
                              <span key={idx} className="otp-digit">{digit}</span>
                            ))}
                          </div>
                        </div>
                        <p><em>{selectedEmail.content.note}</em></p>
                        <p className="email-footer">{selectedEmail.content.footer}</p>
                      </>
                    )}

                    {selectedEmail.type === 'welcome' && (
                      <>
                        <p><strong>{selectedEmail.content.greeting}</strong></p>
                        <p>{selectedEmail.content.message}</p>
                        <ul className="features-list">
                          {selectedEmail.content.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                        <p>{selectedEmail.content.instructions}</p>
                        <p className="email-footer">{selectedEmail.content.footer}</p>
                      </>
                    )}

                    {selectedEmail.type === 'payment' && (
                      <>
                        <p><strong>{selectedEmail.content.greeting}</strong></p>
                        <p>{selectedEmail.content.message}</p>
                        <div className="order-details">
                          <h4>Order Details:</h4>
                          <p><strong>Order ID:</strong> {selectedEmail.content.orderDetails.orderId}</p>
                          <p><strong>Date:</strong> {selectedEmail.content.orderDetails.date}</p>
                          <p><strong>Total:</strong> {selectedEmail.content.orderDetails.total}</p>
                          <p><strong>Payment Method:</strong> {selectedEmail.content.orderDetails.paymentMethod}</p>
                        </div>
                        <ul className="next-steps">
                          {selectedEmail.content.nextSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                        <p className="email-footer">{selectedEmail.content.footer}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="email-actions">
                  <button className="action-btn">📋 Copy Details</button>
                  <button className="action-btn">📤 Resend Email</button>
                  <button className="action-btn delete">🗑️ Delete</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="email-list">
              <div className="list-header">
                <h3>Sent Emails ({filteredEmails.length})</h3>
                <button className="refresh-btn" onClick={loadEmails}>
                  🔄 Refresh
                </button>
              </div>

              {filteredEmails.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📧</div>
                  <h4>No emails found</h4>
                  <p>Send an OTP or complete a payment to see emails here</p>
                </div>
              ) : (
                <div className="email-items">
                  {filteredEmails.map(email => (
                    <div 
                      key={email.id} 
                      className="email-item"
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="email-item-icon">
                        {getEmailTypeIcon(email.type)}
                      </div>
                      <div className="email-item-content">
                        <div className="email-item-header">
                          <h4>{email.subject}</h4>
                          <span className="email-time">{formatDate(email.timestamp)}</span>
                        </div>
                        <p className="email-to">
                          <strong>To:</strong> {email.to}
                        </p>
                        <div className="email-preview">
                          {email.type === 'otp' ? `OTP: ${email.content.otp}` : 
                           email.type === 'welcome' ? 'Welcome to SmartCity Logistics!' :
                           email.type === 'payment' ? `Payment for Order #${email.content.orderDetails?.orderId}` :
                           email.content.message?.substring(0, 100)}...
                        </div>
                      </div>
                      <div className="email-item-arrow">→</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDashboard;