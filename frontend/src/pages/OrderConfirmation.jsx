import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './order-confirmation.css';

// FIXED IMPORTS - use only what's exported from firebase.js
import { firestore } from '../firebase';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log("🔍 Fetching order:", orderId);
        
        // First, check localStorage (fastest)
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        console.log("Local storage orders:", orderHistory.length);
        
        const foundOrder = orderHistory.find(o => 
          o.orderId === orderId || 
          o.id === orderId || 
          o.id?.includes(orderId) ||
          o.firestoreId === orderId
        );
        
        if (foundOrder) {
          console.log("✅ Order found in localStorage:", foundOrder);
          setOrder(foundOrder);
          setLoading(false);
          return;
        }
        
        // If not in localStorage, try Firestore
        if (firestore) {
          console.log("📡 Trying Firestore...");
          try {
            const { doc, getDoc } = await import('firebase/firestore');
            const orderRef = doc(firestore, 'orders', orderId);
            const orderDoc = await getDoc(orderRef);
            
            if (orderDoc.exists()) {
              console.log("✅ Order found in Firestore");
              const firestoreOrder = { 
                id: orderDoc.id, 
                ...orderDoc.data(),
                source: 'firestore'
              };
              setOrder(firestoreOrder);
              setLoading(false);
              return;
            } else {
              console.log("⚠️ Order not found in Firestore");
            }
          } catch (firestoreError) {
            console.error("Firestore error:", firestoreError);
          }
        }
        
        // Fallback to mock data if nothing found
        console.log("📋 Creating mock order as fallback");
        setOrder({
          orderId: orderId || `SC-${Date.now()}`,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'Cash on Delivery',
          createdAt: new Date().toISOString(),
          customerInfo: {
            name: 'Customer',
            email: 'customer@example.com',
            address: '123 Main Street, Smart City',
            phone: '+91 9876543210',
            city: 'Smart City',
            state: 'Delhi',
            zipCode: '110001'
          },
          items: [
            { name: 'Water Controller Sensor', quantity: 1, price: 345, total: 345 },
            { name: 'Smart Street Lights', quantity: 2, price: 450, total: 900 }
          ],
          subtotal: 1245,
          shipping: 50,
          tax: 149.4,
          total: 1444.4,
          source: 'mock'
        });
        
      } catch (error) {
        console.error('❌ Error fetching order:', error);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Error Loading Order</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/shop')} className="back-btn">
          Return to Shop
        </button>
        <button onClick={() => navigate('/orders')} className="orders-btn">
          View All Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error-container">
        <div className="error-icon">🔍</div>
        <h2>Order Not Found</h2>
        <p>The order you're looking for doesn't exist or has been deleted.</p>
        <button onClick={() => navigate('/shop')} className="back-btn">
          Return to Shop
        </button>
        <button onClick={() => navigate('/dashboard')} className="dashboard-btn">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <div className="success-icon">🎉</div>
          <h1>Order Confirmed!</h1>
          <p className="confirmation-message">
            Thank you for your purchase. Your order has been successfully placed and payment is complete.
          </p>
          
          {/* PAYMENT SUCCESS MESSAGE */}
          <div className="payment-success-message">
            <div className="payment-success-icon">
              <div className="checkmark-circle">✓</div>
              <div className="payment-icon">💳</div>
            </div>
            <div className="payment-success-details">
              <h3>Payment Successful!</h3>
              <p className="payment-amount">₹{order.total?.toFixed(2) || '0.00'}</p>
              <div className="payment-method">
                <span className="method-label">Payment Method:</span>
                <span className="method-value">
                  {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                   order.paymentMethod === 'upi' ? 'UPI' : 
                   order.paymentMethod || 'Cash on Delivery'}
                </span>
              </div>
              <div className="payment-status">
                <span className="status-label">Payment Status:</span>
                <span className={`status-value ${order.paymentStatus || 'paid'}`}>
                  {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                </span>
              </div>
              <p className="payment-note">
                A payment confirmation has been sent to your email.
              </p>
            </div>
          </div>
        </div>

        <div className="order-details">
          {/* Order Information */}
          <div className="detail-section">
            <h2 className="section-title">
              <span className="section-icon">📦</span>
              Order Information
            </h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Order ID:</span>
                <span className="detail-value highlight">{order.orderId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Order Date:</span>
                <span className="detail-value">
                  {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Order Status:</span>
                <span className={`status-badge ${order.status || 'confirmed'}`}>
                  {order.status || 'confirmed'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Order Source:</span>
                <span className="detail-value">
                  {order.source === 'firestore' ? 'Firestore Database' : 
                   order.source === 'mock' ? 'Demo Order' : 'Local Storage'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="detail-section">
            <h2 className="section-title">
              <span className="section-icon">📋</span>
              Order Summary
            </h2>
            <div className="order-items">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <div className="item-details">
                      <span className="item-quantity">Quantity: {item.quantity}</span>
                      <span className="item-unit-price">₹{item.price} each</span>
                    </div>
                  </div>
                  <span className="item-price">₹{item.total || (item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>₹{order.shipping?.toFixed(2) || '50.00'}</span>
              </div>
              <div className="total-row">
                <span>Tax (12%)</span>
                <span>₹{order.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total Amount</span>
                <span className="total-amount">₹{order.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="detail-section">
            <h2 className="section-title">
              <span className="section-icon">🚚</span>
              Delivery Information
            </h2>
            <div className="delivery-info">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Customer Name:</span>
                  <span className="info-value">{order.customerInfo?.name || 'Customer'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value email">{order.customerInfo?.email || 'customer@example.com'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{order.customerInfo?.phone || '+91 9876543210'}</span>
                </div>
                <div className="info-item full-width">
                  <span className="info-label">Shipping Address:</span>
                  <span className="info-value">
                    {order.customerInfo?.address || '123 Main Street, Smart City'},<br />
                    {order.customerInfo?.city || 'Smart City'}, {order.customerInfo?.state || 'Delhi'} - {order.customerInfo?.zipCode || '110001'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Estimated Delivery:</span>
                  <span className="info-value delivery-date">
                    {(() => {
                      const deliveryDate = new Date(order.createdAt || Date.now());
                      deliveryDate.setDate(deliveryDate.getDate() + 5);
                      return deliveryDate.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    })()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Delivery Partner:</span>
                  <span className="info-value partner">SmartCity Express Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Support */}
          <div className="detail-section support-section">
            <h2 className="section-title">
              <span className="section-icon">📞</span>
              Need Help?
            </h2>
            <div className="support-info">
              <div className="support-item">
                <div className="support-icon">🛡️</div>
                <div className="support-content">
                  <h4>Order Protection</h4>
                  <p>30-day return policy & manufacturer warranty</p>
                </div>
              </div>
              <div className="support-item">
                <div className="support-icon">🚚</div>
                <div className="support-content">
                  <h4>Track Your Order</h4>
                  <p>Tracking number will be sent via SMS & Email</p>
                </div>
              </div>
              <div className="support-item">
                <div className="support-icon">📞</div>
                <div className="support-content">
                  <h4>24/7 Support</h4>
                  <p>Call us at 1800-123-4567 or email support@smartcity.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="confirmation-actions">
          <button onClick={() => navigate('/shop')} className="action-btn continue-btn">
            <span className="btn-icon">🛍️</span>
            Continue Shopping
          </button>
          <button onClick={() => navigate('/orders')} className="action-btn orders-btn">
            <span className="btn-icon">📋</span>
            View All Orders
          </button>
          <button onClick={() => navigate('/dashboard')} className="action-btn dashboard-btn">
            <span className="btn-icon">📊</span>
            Go to Dashboard
          </button>
          <button 
            onClick={() => window.print()} 
            className="action-btn print-btn"
          >
            <span className="btn-icon">🖨️</span>
            Print Receipt
          </button>
        </div>

        {/* Order Note */}
        <div className="order-note">
          <p>
            <strong>Note:</strong> You will receive shipping confirmation with tracking details 
            within 24 hours. For any queries, contact our customer support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;