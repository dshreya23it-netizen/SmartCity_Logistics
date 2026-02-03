import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { firestore } from '../firebase';
import emailjs from '@emailjs/browser';
import './billing.css';

const BillingPage = () => {
  const { cart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [payPalProcessing, setPayPalProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'card'
  });

  // EmailJS Configuration
  const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_oy7u31c',
    TEMPLATE_ID: 'template_3t3mwdx',
    PUBLIC_KEY: 'jZG2WKhHLTrug4wGe',
  };

  // Initialize EmailJS
  useEffect(() => {
    if (emailjs) {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }
  }, []);

  // PayPal dummy payment configuration
  const paypalAccounts = [
    { email: 'sb-1234567890@business.example.com', name: 'Sandbox Business Account' },
    { email: 'personal-buyer@example.com', name: 'Personal Test Account' }
  ];

  // Update email if user logs in/out
  useEffect(() => {
    if (currentUser?.email) {
      setFormData(prev => ({
        ...prev,
        email: currentUser.email
      }));
    }
  }, [currentUser]);

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 50;
    const tax = subtotal * 0.12;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const { subtotal, shipping, tax, total } = calculateTotals();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method
    }));
  };

  // Generate order ID
  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SC-${timestamp}-${random}`;
  };

  // Format payment method for email
  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'card': return 'Credit/Debit Card';
      case 'paypal': return 'PayPal';
      case 'upi': return 'UPI';
      case 'cod': return 'Cash on Delivery';
      default: return method;
    }
  };

  // Send order confirmation email
  const sendOrderConfirmationEmail = async (orderData) => {
    setSendingEmail(true);
    setEmailError('');
    
    try {
      const customerName = `${formData.firstName} ${formData.lastName}`;
      const orderDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const templateParams = {
        to_email: formData.email,
        to_name: customerName,
        from_name: 'SmartCity LOGISTICS',
        customer_name: customerName,
        order_id: orderData.orderId,
        order_date: orderDate,
        total_amount: `₹${orderData.total.toFixed(2)}`,
        payment_method: formatPaymentMethod(orderData.paymentMethod),
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        estimated_delivery: '3-5 business days',
        message: `Your order ${orderData.orderId} has been confirmed. Thank you for your purchase!`
      };
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );
      
      console.log('✅ Email sent:', response);
      setEmailSent(true);
      return true;
      
    } catch (error) {
      console.error('❌ Email error:', error);
      setEmailError("Order placed successfully, but confirmation email failed to send.");
      return false;
    } finally {
      setSendingEmail(false);
    }
  };

  // PayPal Payment Functions
  const initiatePayPalPayment = () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    // Validate billing info for PayPal
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.address || !formData.city || 
        !formData.state || !formData.zipCode) {
      setError('Please fill in all billing information before proceeding with PayPal');
      return;
    }

    setShowPayPalModal(true);
    setPaymentStatus('initiated');
  };

  const simulatePayPalLogin = () => {
    setPayPalProcessing(true);
    setPaymentStatus('logging_in');
    
    setTimeout(() => {
      setPaymentStatus('logged_in');
      setPayPalProcessing(false);
    }, 2000);
  };

  const simulatePayPalPayment = () => {
    setPayPalProcessing(true);
    setPaymentStatus('processing');
    
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setPaymentStatus('success');
        setTimeout(() => {
          handleOrderSubmission('paypal');
          setShowPayPalModal(false);
        }, 1500);
      } else {
        setPaymentStatus('failed');
        setPayPalProcessing(false);
      }
    }, 3000);
  };

  const handleOrderSubmission = async (paymentMethod = formData.paymentMethod) => {
    setLoading(true);
    setError('');
    setEmailSent(false);
    setEmailError('');

    try {
      // Validate form
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.phone || !formData.address || !formData.city || 
          !formData.state || !formData.zipCode) {
        throw new Error('Please fill in all required fields');
      }
      
      if (cart.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // Generate order ID
      const newOrderId = generateOrderId();
      setOrderId(newOrderId);
      
      // Create order object
      const order = {
        orderId: newOrderId,
        customerInfo: formData,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        subtotal,
        shipping,
        tax,
        total,
        status: 'pending',
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'paypal' ? 'completed' : 'pending',
        paymentTransactionId: paymentMethod === 'paypal' ? `PAYPAL-${Date.now()}` : null,
        userId: currentUser?.uid || 'guest',
        userEmail: currentUser?.email || formData.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Save order to Firestore
      const ordersCollection = collection(firestore, 'orders');
      const orderRef = await addDoc(ordersCollection, order);
      
      // Send order confirmation email
      await sendOrderConfirmationEmail(order);
      
      // Update product stock (optional)
      for (const item of cart) {
        try {
          const productRef = doc(firestore, 'products', item.id);
          const productDoc = await getDoc(productRef);
          if (productDoc.exists()) {
            await updateDoc(productRef, {
              lastOrdered: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        } catch (productErr) {
          console.warn(`Could not update product ${item.id}:`, productErr);
        }
      }
      
      // Save to local storage
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      orderHistory.push({
        ...order,
        id: orderRef.id,
        createdAt: new Date().toISOString(),
        emailSent: true
      });
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
      
      // Clear cart and complete order
      clearCart();
      setOrderComplete(true);
      
    } catch (err) {
      console.error('Order failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.paymentMethod === 'paypal') {
      initiatePayPalPayment();
    } else {
      handleOrderSubmission();
    }
  };

  // Resend confirmation email
  const resendConfirmationEmail = async () => {
    setSendingEmail(true);
    setEmailError('');
    
    try {
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const lastOrder = orderHistory.find(order => order.orderId === orderId);
      
      if (lastOrder) {
        const result = await sendOrderConfirmationEmail(lastOrder);
        if (result) {
          alert(`✅ Confirmation email resent to ${formData.email}`);
        } else {
          alert("⚠️ Failed to resend email. Please try again.");
        }
      } else {
        alert("Order details not found.");
      }
    } catch (error) {
      console.error('Resend failed:', error);
      alert("Error resending email.");
    } finally {
      setSendingEmail(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-content">
          <div className="confirmation-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p className="confirmation-message">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          
          {/* Email Status */}
          {sendingEmail && (
            <div className="email-status sending">
              <span className="spinner small"></span>
              Sending confirmation email...
            </div>
          )}
          
          {emailSent && (
            <div className="email-status success">
              ✅ Order confirmation email has been sent to {formData.email}
            </div>
          )}
          
          {emailError && (
            <div className="email-status error">
              ⚠️ {emailError}
            </div>
          )}
          
          <div className="order-details">
            <div className="detail-item">
              <span className="detail-label">Order ID:</span>
              <span className="detail-value">{orderId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Amount:</span>
              <span className="detail-value">₹{total.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">
                {formData.paymentMethod === 'card' ? 'Credit/Debit Card' :
                 formData.paymentMethod === 'paypal' ? 'PayPal' :
                 formData.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Estimated Delivery:</span>
              <span className="detail-value">3-5 business days</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Confirmation Email:</span>
              <span className="detail-value">
                {emailSent ? `Sent to ${formData.email}` : 
                 sendingEmail ? 'Sending...' : 'Will be sent shortly'}
              </span>
            </div>
          </div>

          <div className="confirmation-actions">
            <button
              className="continue-shopping-btn"
              onClick={() => navigate('/shop')}
            >
              Continue Shopping
            </button>
            <button
              className="view-orders-btn"
              onClick={() => navigate('/orders')}
            >
              View Order History
            </button>
            <button
              className="dashboard-btn"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
            
            {/* Resend Email Button */}
            {emailError && (
              <button
                className="resend-email-btn"
                onClick={resendConfirmationEmail}
                disabled={sendingEmail}
              >
                {sendingEmail ? 'Resending...' : 'Resend Confirmation Email'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-container">
      {/* PayPal Modal */}
      {showPayPalModal && (
        <div className="paypal-modal-overlay">
          <div className="paypal-modal">
            <div className="paypal-modal-header">
              <div className="paypal-logo">
                <span style={{color: '#003087', fontWeight: 'bold'}}>Pay</span>
                <span style={{color: '#009cde', fontWeight: 'bold'}}>Pal</span>
              </div>
              <button 
                className="close-modal"
                onClick={() => setShowPayPalModal(false)}
                disabled={payPalProcessing}
              >
                ×
              </button>
            </div>

            <div className="paypal-modal-content">
              {paymentStatus === 'initiated' && (
                <>
                  <div className="paypal-welcome">
                    <div className="paypal-icon">💳</div>
                    <h3>Pay with PayPal</h3>
                    <p className="paypal-amount">Amount: ₹{total.toFixed(2)}</p>
                  </div>

                  <div className="paypal-accounts">
                    <h4>Test Accounts:</h4>
                    {paypalAccounts.map((account, index) => (
                      <div key={index} className="paypal-account-card">
                        <div className="account-icon">👤</div>
                        <div className="account-details">
                          <p className="account-name">{account.name}</p>
                          <p className="account-email">{account.email}</p>
                          <p className="account-password">Password: password123</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    className="paypal-login-btn"
                    onClick={simulatePayPalLogin}
                  >
                    Continue to PayPal Login
                  </button>
                </>
              )}

              {paymentStatus === 'logging_in' && (
                <div className="paypal-processing">
                  <div className="processing-spinner"></div>
                  <h3>Logging into PayPal...</h3>
                </div>
              )}

              {paymentStatus === 'logged_in' && (
                <>
                  <div className="paypal-review">
                    <h3>Review Your Payment</h3>
                    <div className="payment-summary">
                      <div className="summary-row">
                        <span>Order Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="paypal-account-info">
                      <h4>Payment Method</h4>
                      <div className="selected-account">
                        <div className="account-icon">👤</div>
                        <div>
                          <p>Sandbox Business Account</p>
                          <p>sb-1234567890@business.example.com</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      className="paypal-pay-btn"
                      onClick={simulatePayPalPayment}
                    >
                      Pay Now ₹{total.toFixed(2)}
                    </button>
                  </div>
                </>
              )}

              {paymentStatus === 'processing' && (
                <div className="paypal-processing">
                  <div className="processing-spinner"></div>
                  <h3>Processing Payment...</h3>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="paypal-success">
                  <div className="success-icon">✅</div>
                  <h3>Payment Successful!</h3>
                  <p>Your PayPal payment has been processed successfully.</p>
                  <p className="redirecting">Redirecting to order confirmation...</p>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="paypal-failed">
                  <div className="failed-icon">❌</div>
                  <h3>Payment Failed</h3>
                  <p>There was an error processing your PayPal payment.</p>
                  <div className="retry-options">
                    <button 
                      className="retry-btn"
                      onClick={simulatePayPalPayment}
                    >
                      Try Again
                    </button>
                    <button 
                      className="change-method-btn"
                      onClick={() => setShowPayPalModal(false)}
                    >
                      Change Payment Method
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="billing-header">
        <h1>Checkout & Billing</h1>
        <p className="billing-subtitle">Complete your purchase</p>
      </div>

      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="billing-content">
        <form className="billing-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Billing Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your@email.com"
                />
                <small>Order confirmation will be sent to this email</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Street Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Enter your street address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your city"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your state"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Payment Method</h2>
            
            <div className="payment-methods">
              <div
                className={`payment-method ${formData.paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('card')}
              >
                <div className="payment-icon">💳</div>
                <div className="payment-details">
                  <h3>Credit/Debit Card</h3>
                  <p>Pay securely with your card</p>
                </div>
                {formData.paymentMethod === 'card' && <div className="checkmark">✓</div>}
              </div>
              
              <div
                className={`payment-method ${formData.paymentMethod === 'paypal' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('paypal')}
              >
                <div className="payment-icon">
                  <span style={{color: '#003087', fontWeight: 'bold'}}>Pay</span>
                  <span style={{color: '#009cde', fontWeight: 'bold'}}>Pal</span>
                </div>
                <div className="payment-details">
                  <h3>PayPal</h3>
                  <p>Pay with PayPal account</p>
                </div>
                {formData.paymentMethod === 'paypal' && <div className="checkmark">✓</div>}
              </div>
              
              <div
                className={`payment-method ${formData.paymentMethod === 'upi' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('upi')}
              >
                <div className="payment-icon">📱</div>
                <div className="payment-details">
                  <h3>UPI</h3>
                  <p>Pay via UPI apps</p>
                </div>
                {formData.paymentMethod === 'upi' && <div className="checkmark">✓</div>}
              </div>
              
              <div
                className={`payment-method ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('cod')}
              >
                <div className="payment-icon">💰</div>
                <div className="payment-details">
                  <h3>Cash on Delivery</h3>
                  <p>Pay when you receive</p>
                </div>
                {formData.paymentMethod === 'cod' && <div className="checkmark">✓</div>}
              </div>
            </div>

            {formData.paymentMethod === 'card' && (
              <div className="card-details">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'paypal' && (
              <div className="paypal-info">
                <div className="paypal-preview">
                  <div className="paypal-preview-icon">
                    <span style={{color: '#003087', fontWeight: 'bold'}}>Pay</span>
                    <span style={{color: '#009cde', fontWeight: 'bold'}}>Pal</span>
                  </div>
                  <div className="paypal-preview-text">
                    <h4>Pay with PayPal</h4>
                    <p>Click "Place Order" to continue to PayPal's secure payment portal</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="place-order-btn"
              disabled={loading || cart.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : formData.paymentMethod === 'paypal' ? (
                `Pay with PayPal - ₹${total.toFixed(2)}`
              ) : (
                `Place Order - ₹${total.toFixed(2)}`
              )}
            </button>
            
            <p className="email-notice">
              <small>
                ✅ Order confirmation will be sent to <strong>{formData.email || 'your email'}</strong>
              </small>
            </p>
          </div>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="order-items">
            {cart.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                </div>
                <span className="item-price">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Tax (12%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            
            <div className="summary-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="email-preview-note">
            <p>
              📧 You will receive a detailed order confirmation email with all these items.
            </p>
          </div>
          
          {cart.length === 0 && (
            <div className="empty-cart-message">
              <p>Your cart is empty</p>
              <button 
                className="back-to-shop"
                onClick={() => navigate('/shop')}
              >
                Return to Shop
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;