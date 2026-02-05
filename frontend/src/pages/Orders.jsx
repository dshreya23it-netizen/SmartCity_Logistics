// frontend/src/pages/Orders.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './orders.css'; // Now this file exists!

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = () => {
      try {
        // Get orders from localStorage
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        
        // Filter orders for current user
        const userOrders = orderHistory.filter(order => 
          order.userEmail === currentUser?.email || order.customerInfo?.email === currentUser?.email
        );
        
        setOrders(userOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Your Orders</h1>
        <p className="orders-subtitle">Track and manage your purchases</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Your order history will appear here</p>
          <button 
            className="shop-now-btn"
            onClick={() => navigate('/shop')}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.orderId || order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <h3>Order #{order.orderId}</h3>
                  <span className={`status-badge ${order.status}`}>
                    {order.status || 'pending'}
                  </span>
                </div>
                <div className="order-date">
                  {new Date(order.createdAt || order.localSavedAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="order-items-preview">
                {order.items?.slice(0, 2).map((item, index) => (
                  <div key={index} className="preview-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">x{item.quantity}</span>
                    <span className="item-price">₹{item.total}</span>
                  </div>
                ))}
                {order.items?.length > 2 && (
                  <div className="more-items">
                    +{order.items.length - 2} more items
                  </div>
                )}
              </div>
              
              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <span className="total-amount">₹{order.total}</span>
                </div>
                <button 
                  className="view-details-btn"
                  onClick={() => navigate(`/order-confirmation/${order.orderId || order.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;