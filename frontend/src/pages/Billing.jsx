import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
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
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [upiProcessing, setUpiProcessing] = useState(false);
  const [upiStatus, setUpiStatus] = useState('');
  const [selectedUPIApp, setSelectedUPIApp] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  
  const upiPinInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: currentUser?.email || '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  paymentMethod: 'card',
  upiId: ''   // ✅ sender UPI
});

  // EmailJS Configuration
  const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_oy7u31c',
    TEMPLATE_ID: 'template_3t3mwdx',
    PUBLIC_KEY: 'jZG2WKhHLTrug4wGe',
  };

  // UPI Apps List with SVG icons
  const upiApps = [
    { id: 'phonepe', name: 'PhonePe', icon: '📱', color: '#5f259f' },
    { id: 'googlepay', name: 'Google Pay', icon: 'G', color: '#4285f4' },
    { id: 'paytm', name: 'Paytm', icon: 'P', color: '#00baf2' },
    { id: 'whatsapp', name: 'WhatsApp Pay', icon: '💬', color: '#25d366' },
    { id: 'amazonpay', name: 'Amazon Pay', icon: 'A', color: '#ff9900' },
    { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳', color: '#0c9d58' }
  ];

  // PayPal dummy payment configuration
  const paypalAccounts = [
    { 
      email: 'shreyadubey0504@gmail.com', 
      name: 'Smart City Business Account',
      type: 'business',
      balance: '₹25,000'
    },
    { 
      email: 'dshreya23it@student.mes.ac.in', 
      name: 'Personal Test Account',
      type: 'personal',
      balance: '₹50,000'
    }
  ];
  const BUSINESS_UPI = {
  name: "SmartCity Logistics Pvt Ltd",
  upiId: "smartcitylogistics@oksbi",
  merchantCode: "SCLOG2026"
};


  // SVG Icons
  const icons = {
    creditCard: (
      <svg className="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="currentColor"/>
      </svg>
    ),
    paypal: (
      <svg className="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 4C8.9 4 10 5.1 10 6.5C10 7.9 8.9 9 7.5 9C6.1 9 5 7.9 5 6.5C5 5.1 6.1 4 7.5 4ZM19 4H9.5C8.67 4 8 4.67 8 5.5C8 6.33 8.67 7 9.5 7H19V9H9.5C7.84 9 6.5 7.66 6.5 6C6.5 4.34 7.84 3 9.5 3H19C19.55 3 20 3.45 20 4C20 4.55 19.55 5 19 5ZM7.5 15C8.9 15 10 16.1 10 17.5C10 18.9 8.9 20 7.5 20C6.1 20 5 18.9 5 17.5C5 16.1 6.1 15 7.5 15ZM19 11H9.5C8.67 11 8 11.67 8 12.5C8 13.33 8.67 14 9.5 14H19V16H9.5C7.84 16 6.5 14.66 6.5 13C6.5 11.34 7.84 10 9.5 10H19C19.55 10 20 10.45 20 11C20 11.55 19.55 12 19 12Z" fill="currentColor"/>
      </svg>
    ),
    mobile: (
      <svg className="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org2000/svg">
        <path d="M17 1.01L7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1.01 17 1.01ZM17 19H7V5H17V19Z" fill="currentColor"/>
      </svg>
    ),
    money: (
      <svg className="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.52 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="currentColor"/>
      </svg>
    ),
    shield: (
      <svg className="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="currentColor"/>
      </svg>
    ),
    truck: (
      <svg className="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20C7.66 20 9 18.66 9 17H15C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17H23V12L20 8ZM6 18.5C5.17 18.5 4.5 17.83 4.5 17C4.5 16.17 5.17 15.5 6 15.5C6.83 15.5 7.5 16.17 7.5 17C7.5 17.83 6.83 18.5 6 18.5ZM19.5 9.5L21.46 12H17V9.5H19.5ZM18 18.5C17.17 18.5 16.5 17.83 16.5 17C16.5 16.17 17.17 15.5 18 15.5C18.83 15.5 19.5 16.17 19.5 17C19.5 17.83 18.83 18.5 18 18.5Z" fill="currentColor"/>
      </svg>
    ),
    headset: (
      <svg className="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1C7.03 1 3 5.03 3 10V17C3 18.66 4.34 20 6 20H7V12H5V10C5 6.13 8.13 3 12 3C15.87 3 19 6.13 19 10V12H17V20H18C19.66 20 21 18.66 21 17V10C21 5.03 16.97 1 12 1Z" fill="currentColor"/>
      </svg>
    ),
    lock: (
      <svg className="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" fill="currentColor"/>
      </svg>
    ),
    check: (
      <svg className="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
      </svg>
    ),
    warning: (
      <svg className="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" fill="currentColor"/>
      </svg>
    )
  };

  // Initialize EmailJS
  useEffect(() => {
    if (emailjs) {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }
  }, []);

  // Focus on PIN input when entering PIN mode
  useEffect(() => {
    if (upiStatus === 'enter_pin') {
      setTimeout(() => {
        if (upiPinInputRef.current) {
          upiPinInputRef.current.focus();
        }
      }, 100);
    }
  }, [upiStatus]);

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
    const shipping = subtotal > 50000 ? 0 : 50;
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

  // Handle card input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      formattedValue = formattedValue.slice(0, 5);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setCardDetails(prev => ({
      ...prev,
      [name]: formattedValue
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
    return `SCL-${timestamp}-${random}`;
  };

  // Generate random transaction ID
  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `UPI${timestamp}${random}`;
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

  // UPI Payment Functions
  const initiateUPIPayment = () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    // Validate billing info for UPI
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.address || !formData.city || 
        !formData.state || !formData.zipCode) {
      setError('Please fill in all billing information before proceeding with UPI');
      return;
    }

    setShowUPIModal(true);
    setUpiStatus('initiated');
    setTransactionId(generateTransactionId());
    setSelectedUPIApp('');
    setUpiPin('');
  };

  const handleUPIAppSelect = (appId) => {
    setSelectedUPIApp(appId);
    setUpiStatus('app_selected');
  };

  const simulateUPIPayment = () => {
    setUpiProcessing(true);
    setUpiStatus('processing');
    
    setTimeout(() => {
      // Simulate payment processing
      setUpiStatus('enter_pin');
      setUpiProcessing(false);
    }, 1500);
  };

  const verifyUPIPin = () => {
    if (!upiPin || upiPin.length !== 4) {
      setError('Please enter a valid 4-digit UPI PIN');
      return;
    }

    setUpiProcessing(true);
    setUpiStatus('verifying');
    
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate
      
      if (isSuccess) {
        setUpiStatus('success');
        
        // Store transaction details
        const transactionDetails = {
          transactionId,
          amount: calculateTotals().total,
          timestamp: new Date().toISOString(),
          upiApp: selectedUPIApp,
          status: 'completed'
        };
        
        localStorage.setItem(`upi_transaction_${transactionId}`, JSON.stringify(transactionDetails));
        
        setTimeout(() => {
          handleOrderSubmission('upi');
          setShowUPIModal(false);
        }, 1500);
      } else {
        setUpiStatus('failed');
        setUpiProcessing(false);
      }
    }, 2000);
  };

  const copyUPIId = () => {
    const upiId = BUSINESS_UPI.upiId;
    navigator.clipboard.writeText(upiId)
      .then(() => {
        alert('UPI ID copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
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
      
      // Validate card details for card payment
      if (paymentMethod === 'card') {
        if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardName) {
          throw new Error('Please fill all card details');
        }
        const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length !== 16) {
          throw new Error('Please enter a valid 16-digit card number');
        }
        if (cardDetails.cvv.length < 3) {
          throw new Error('Please enter a valid CVV');
        }
      }
      
      // Generate order ID
      const newOrderId = generateOrderId();
      setOrderId(newOrderId);
      
      // Get totals
      const totals = calculateTotals();
      
      // Create payment details
      let paymentDetails = {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'completed',
        amount: totals.total
      };

      // Add transaction-specific details
      if (paymentMethod === 'paypal') {
        paymentDetails.transactionId = `PAYPAL-${Date.now()}`;
        paymentDetails.paypalEmail = 'dshreya23it@business_smartcity.com';
      } else if (paymentMethod === 'upi') {
        paymentDetails.transactionId = transactionId;
        paymentDetails.upiApp = selectedUPIApp;
        paymentDetails.upiId = 'shreyadubey0504@okhdfcbank';
      } else if (paymentMethod === 'card') {
        const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
        paymentDetails.transactionId = `CARD-${Date.now()}`;
        paymentDetails.cardLast4 = cleanCardNumber.slice(-4);
        paymentDetails.cardType = cleanCardNumber.startsWith('4') ? 'Visa' : 
                                  cleanCardNumber.startsWith('5') ? 'Mastercard' : 'Other';
      }

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
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        status: 'pending',
        payment: paymentDetails,
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
    } else if (formData.paymentMethod === 'upi') {
      initiateUPIPayment();
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

  // Get card type icon
  const getCardTypeIcon = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5')) return 'mastercard';
    if (cleanNumber.startsWith('6')) return 'rupay';
    if (cleanNumber.startsWith('3')) return 'amex';
    return 'card';
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
      {/* UPI Modal */}
      {showUPIModal && (
        <div className="upi-modal-overlay">
          <div className="upi-modal">
            <div className="upi-modal-header">
              <div className="upi-logo">
                <span style={{color: '#0c9d58', fontWeight: 'bold'}}>UPI</span>
                <span> Payment</span>
              </div>
              <button 
                className="close-modal"
                onClick={() => setShowUPIModal(false)}
                disabled={upiProcessing}
              >
                ×
              </button>
            </div>

            <div className="upi-modal-content">
              {upiStatus === 'initiated' && (
                <>
                  <div className="upi-amount-display">
                    <div className="amount-label">Amount to Pay</div>
                    <div className="amount-value">₹{calculateTotals().total.toFixed(2)}</div>
                    <div className="transaction-id">Txn ID: {transactionId}</div>
                  </div>

                  <div className="upi-qr-section">
                    <h4>Scan QR Code</h4>
                    <div className="qr-container">
                      <div className="qr-code-display">
                        <div className="qr-pattern">
                          {Array(25).fill().map((_, row) => (
                            <div key={row} className="qr-row">
                              {Array(25).fill().map((_, col) => {
                                // Create a QR-like pattern
                                const isBlack = (
                                  (row < 2 && col < 2) || 
                                  (row < 2 && col > 22) ||
                                  (row > 22 && col < 2) ||
                                  (row === 12 && col % 2 === 0) ||
                                  (col === 12 && row % 2 === 0) ||
                                  Math.random() > 0.6
                                );
                                return (
                                  <div 
                                    key={col} 
                                    className={`qr-pixel ${isBlack ? 'black' : ''}`}
                                  ></div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <div className="qr-overlay-content">
                          <div className="qr-amount">₹{calculateTotals().total.toFixed(2)}</div>
                          <div className="qr-upi-id">{BUSINESS_UPI.upiId}</div>
                          <div className="qr-merchant">SmartCity Logistics</div>
                        </div>
                      </div>
                      <div className="qr-instructions">
                        <p>Scan QR code with any UPI app</p>
                        <button className="copy-upi-btn" onClick={copyUPIId}>
                          📋 Copy UPI ID: {BUSINESS_UPI.upiId}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="upi-apps-section">
                    <h4>Or Pay Directly with</h4>
                    <div className="upi-apps-grid">
                      {upiApps.map(app => (
                        <div 
                          key={app.id}
                          className={`upi-app-card ${selectedUPIApp === app.id ? 'selected' : ''}`}
                          onClick={() => handleUPIAppSelect(app.id)}
                          style={{ borderColor: app.color }}
                        >
                          <div 
                            className="app-icon"
                            style={{ backgroundColor: app.color }}
                          >
                            {app.icon}
                          </div>
                          <span className="app-name">{app.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedUPIApp && (
                    <button 
                      className="upi-pay-btn"
                      onClick={simulateUPIPayment}
                      style={{ backgroundColor: upiApps.find(a => a.id === selectedUPIApp)?.color }}
                    >
                      Pay with {upiApps.find(a => a.id === selectedUPIApp)?.name}
                    </button>
                  )}
                </>
              )}

              {upiStatus === 'app_selected' && (
                <div className="upi-app-selected">
                  <div className="selected-app-info">
                    <div 
                      className="app-icon-large"
                      style={{ backgroundColor: upiApps.find(a => a.id === selectedUPIApp)?.color }}
                    >
                      {upiApps.find(a => a.id === selectedUPIApp)?.icon}
                    </div>
                    <h3>Continue with {upiApps.find(a => a.id === selectedUPIApp)?.name}</h3>
                    <p>You will be redirected to the app</p>
                    <div className="payment-details">
                      <div className="detail-row">
                        <span>Merchant</span>
                        <span>SmartCity Logistics</span>
                      </div>
                      <div className="detail-row">
                        <span>Amount</span>
                        <span className="amount">₹{calculateTotals().total.toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span>UPI ID</span>
                        <span>{BUSINESS_UPI.upiId}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="upi-pay-btn"
                    onClick={simulateUPIPayment}
                    style={{ backgroundColor: upiApps.find(a => a.id === selectedUPIApp)?.color }}
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {upiStatus === 'processing' && (
                <div className="upi-processing">
                  <div className="processing-spinner"></div>
                  <h3>Opening {upiApps.find(a => a.id === selectedUPIApp)?.name}...</h3>
                  <p>Please complete payment in the app</p>
                </div>
              )}

              {upiStatus === 'enter_pin' && (
                <div className="upi-pin-section">
                  <div className="pin-header">
                    <div 
                      className="app-icon-small"
                      style={{ backgroundColor: upiApps.find(a => a.id === selectedUPIApp)?.color }}
                    >
                      {upiApps.find(a => a.id === selectedUPIApp)?.icon}
                    </div>
                    <h3>Enter UPI PIN</h3>
                  </div>
                  
                  <div className="payment-info">
                    <div className="merchant-name">SmartCity Logistics</div>
                    <div className="payment-amount">₹{calculateTotals().total.toFixed(2)}</div>
                  </div>

                  <div className="pin-input-container">
                    <input
                      ref={upiPinInputRef}
                      type="password"
                      className="pin-input"
                      placeholder="Enter 4-digit UPI PIN"
                      value={upiPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setUpiPin(value);
                      }}
                      maxLength="4"
                      autoFocus
                    />
                    <div className="pin-dots">
                      {[1, 2, 3, 4].map(i => (
                        <div 
                          key={i}
                          className={`pin-dot ${upiPin.length >= i ? 'filled' : ''}`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <div className="pin-actions">
                    <button 
                      className="verify-pin-btn"
                      onClick={verifyUPIPin}
                      disabled={upiPin.length !== 4 || upiProcessing}
                    >
                      {upiProcessing ? 'Verifying...' : 'Verify & Pay'}
                    </button>
                    <button 
                      className="cancel-pin-btn"
                      onClick={() => {
                        setUpiStatus('app_selected');
                        setUpiPin('');
                      }}
                      disabled={upiProcessing}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="security-note">
                    <span className="lock-icon">{icons.lock}</span>
                    Your UPI PIN is secure and encrypted
                  </div>
                </div>
              )}

              {upiStatus === 'verifying' && (
                <div className="upi-verifying">
                  <div className="verifying-spinner"></div>
                  <h3>Verifying Payment...</h3>
                  <p>Please don't close the window</p>
                </div>
              )}

              {upiStatus === 'success' && (
                <div className="upi-success">
                  <div className="success-animation">
                    <div className="checkmark-circle">✓</div>
                  </div>
                  <h3>Payment Successful!</h3>
                  <div className="success-details">
                    <div className="detail-item">
                      <span>Amount:</span>
                      <span>₹{calculateTotals().total.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Transaction ID:</span>
                      <span className="txn-id">{transactionId}</span>
                    </div>
                    <div className="detail-item">
                      <span>Status:</span>
                      <span className="status-success">Completed</span>
                    </div>
                  </div>
                  <p className="redirecting">Redirecting to order confirmation...</p>
                </div>
              )}

              {upiStatus === 'failed' && (
                <div className="upi-failed">
                  <div className="failed-icon">❌</div>
                  <h3>Payment Failed</h3>
                  <p>Your UPI payment could not be processed.</p>
                  <div className="retry-options">
                    <button 
                      className="retry-btn"
                      onClick={() => {
                        setUpiStatus('app_selected');
                        setUpiPin('');
                      }}
                    >
                      Try Again
                    </button>
                    <button 
                      className="change-method-btn"
                      onClick={() => setShowUPIModal(false)}
                    >
                      Try Another Method
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PayPal Modal */}
      {showPayPalModal && (
        <div className="paypal-modal-overlay">
          <div className="paypal-modal enhanced">
            <div className="paypal-modal-header">
              <div className="paypal-logo">
                <div className="paypal-logo-icon">P</div>
                <div className="paypal-logo-text">
                  <span style={{color: '#003087', fontWeight: 'bold'}}>Pay</span>
                  <span style={{color: '#009cde', fontWeight: 'bold'}}>Pal</span>
                </div>
              </div>
              <div className="secure-badge">
                <span className="lock-icon">{icons.lock}</span>
                Secure
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
                    <div className="paypal-welcome-icon">💳</div>
                    <div className="paypal-welcome-text">
                      <h3>Pay with PayPal</h3>
                      <div className="paypal-amount-display">
                        <span className="amount-label">Amount:</span>
                        <span className="amount-value">₹{calculateTotals().total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="paypal-accounts-section">
                    <h4>Test Payment Accounts</h4>
                    <div className="paypal-accounts-list">
                      <div className="paypal-account-card business">
                        <div className="account-type">Business Account</div>
                        <div className="account-details">
                          <div className="account-email">dshreya23it@business_smartcity.com</div>
                          <div className="account-password">Password: password123</div>
                        </div>
                        <div className="account-balance">Balance: ₹25,000</div>
                      </div>
                      
                      <div className="paypal-account-card personal">
                        <div className="account-type">Personal Account</div>
                        <div className="account-details">
                          <div className="account-email">shreyadubey0504@gmail.com</div>
                          <div className="account-password">Password: password123</div>
                        </div>
                        <div className="account-balance">Balance: ₹50,000</div>
                      </div>
                    </div>
                  </div>

                  <div className="payment-summary">
                    <h4>Payment Summary</h4>
                    <div className="summary-details">
                      <div className="summary-row">
                        <span>Order Total</span>
                        <span>₹{calculateTotals().total.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Currency</span>
                        <span>Indian Rupee (INR)</span>
                      </div>
                      <div className="summary-row">
                        <span>Exchange Rate</span>
                        <span>1 USD = ₹83.5</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="paypal-login-btn enhanced"
                    onClick={simulatePayPalLogin}
                    disabled={payPalProcessing}
                  >
                    <span className="btn-icon">→</span>
                    Continue to PayPal Login
                  </button>

                  <div className="paypal-security-note">
                    <div className="security-icons">
                      <span className="security-icon">{icons.lock}</span>
                      <span className="security-icon">{icons.shield}</span>
                      <span className="security-icon">{icons.check}</span>
                    </div>
                    <p>256-bit SSL encryption • PCI DSS compliant • Buyer protection</p>
                  </div>
                </>
              )}

              {paymentStatus === 'logging_in' && (
                <div className="paypal-processing">
                  <div className="processing-spinner"></div>
                  <h3>Logging into PayPal...</h3>
                  <p>Connecting to secure PayPal servers</p>
                </div>
              )}

              {paymentStatus === 'logged_in' && (
                <>
                  <div className="paypal-review">
                    <div className="review-header">
                      <h3>Review Your Payment</h3>
                      <div className="account-info">
                        <div className="account-avatar">SB</div>
                        <div>
                          <div className="account-name">Smart City Business Account</div>
                          <div className="account-email-small">dshreya23it@business_smartcity.com</div>
                        </div>
                      </div>
                    </div>

                    <div className="payment-details-enhanced">
                      <div className="payment-detail-card">
                        <div className="detail-header">
                          <span className="detail-title">Payment Method</span>
                          <span className="edit-btn">Edit</span>
                        </div>
                        <div className="payment-method-selected">
                          <div className="method-icon">💳</div>
                          <div>
                            <div className="method-name">PayPal Balance</div>
                            <div className="method-details">Instant transfer</div>
                          </div>
                        </div>
                      </div>

                      <div className="payment-detail-card">
                        <div className="detail-header">
                          <span className="detail-title">Payment Summary</span>
                        </div>
                        <div className="summary-items">
                          <div className="summary-item">
                            <span>Items Total</span>
                            <span>₹{calculateTotals().subtotal.toFixed(2)}</span>
                          </div>
                          <div className="summary-item">
                            <span>Shipping</span>
                            <span>₹{calculateTotals().shipping.toFixed(2)}</span>
                          </div>
                          <div className="summary-item">
                            <span>Tax</span>
                            <span>₹{calculateTotals().tax.toFixed(2)}</span>
                          </div>
                          <div className="summary-item total">
                            <span>Total Amount</span>
                            <span className="total-amount">₹{calculateTotals().total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="payment-detail-card">
                        <div className="detail-header">
                          <span className="detail-title">Billing Address</span>
                        </div>
                        <div className="billing-address">
                          {formData.firstName} {formData.lastName}<br />
                          {formData.address}<br />
                          {formData.city}, {formData.state} {formData.zipCode}<br />
                          {formData.email}<br />
                          {formData.phone}
                        </div>
                      </div>
                    </div>

                    <div className="payment-agreement">
                      <label className="agreement-checkbox">
                        <input type="checkbox" defaultChecked />
                        <span>I agree to the PayPal Terms and authorize this payment</span>
                      </label>
                    </div>

                    <button 
                      className="paypal-pay-btn enhanced"
                      onClick={simulatePayPalPayment}
                      disabled={payPalProcessing}
                    >
                      <span className="btn-text">Pay Now</span>
                      <span className="btn-amount">₹{calculateTotals().total.toFixed(2)}</span>
                    </button>
                  </div>
                </>
              )}

              {paymentStatus === 'processing' && (
                <div className="paypal-processing">
                  <div className="processing-spinner"></div>
                  <h3>Processing Payment...</h3>
                  <p>Please don't close this window</p>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="paypal-success">
                  <div className="success-icon">✅</div>
                  <h3>Payment Successful!</h3>
                  <div className="success-details">
                    <div className="detail-item">
                      <span>Amount:</span>
                      <span>₹{calculateTotals().total.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Transaction ID:</span>
                      <span>PAYPAL-{Date.now()}</span>
                    </div>
                  </div>
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
                      disabled={payPalProcessing}
                    >
                      Try Again
                    </button>
                    <button 
                      className="change-method-btn"
                      onClick={() => setShowPayPalModal(false)}
                      disabled={payPalProcessing}
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
          <span className="error-icon">{icons.warning}</span>
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
              {/* Credit/Debit Card */}
              <div
                className={`payment-method ${formData.paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('card')}
              >
                <div className="payment-icon">{icons.creditCard}</div>
                <div className="payment-details">
                  <h3>Credit/Debit Card</h3>
                  <p>Pay securely with your card</p>
                </div>
                {formData.paymentMethod === 'card' && <div className="checkmark">{icons.check}</div>}
              </div>
              
              {/* PayPal */}
              <div
                className={`payment-method ${formData.paymentMethod === 'paypal' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('paypal')}
              >
                <div className="payment-icon">{icons.paypal}</div>
                <div className="payment-details">
                  <h3>PayPal</h3>
                  <p>Pay with PayPal account</p>
                  <div className="paypal-preview-tags">
                    <span className="preview-tag">Secure</span>
                    <span className="preview-tag">Fast</span>
                  </div>
                </div>
                {formData.paymentMethod === 'paypal' && <div className="checkmark">{icons.check}</div>}
              </div>
              
              {/* UPI */}
              <div
                className={`payment-method ${formData.paymentMethod === 'upi' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('upi')}
              >
                <div className="payment-icon" style={{color: '#0c9d58'}}>{icons.mobile}</div>
                <div className="payment-details">
                  <h3>UPI</h3>
                  <p>Pay via UPI apps, QR code, or bank transfer</p>
                  <div className="upi-apps-preview">
                    <span className="upi-app-tag">PhonePe</span>
                    <span className="upi-app-tag">GPay</span>
                    <span className="upi-app-tag">Paytm</span>
                  </div>
                </div>
                {formData.paymentMethod === 'upi' && <div className="checkmark">{icons.check}</div>}
              </div>
              
              {/* Cash on Delivery */}
              <div
                className={`payment-method ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('cod')}
              >
                <div className="payment-icon">{icons.money}</div>
                <div className="payment-details">
                  <h3>Cash on Delivery</h3>
                  <p>Pay when you receive</p>
                </div>
                {formData.paymentMethod === 'cod' && <div className="checkmark">{icons.check}</div>}
              </div>
            </div>

            {formData.paymentMethod === 'card' && (
              <div className="card-details">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <div className="card-input-wrapper">
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                    {cardDetails.cardNumber && (
                      <div className="card-type-icon">
                        {getCardTypeIcon(cardDetails.cardNumber) === 'visa' && 'VISA'}
                        {getCardTypeIcon(cardDetails.cardNumber) === 'mastercard' && 'MC'}
                        {getCardTypeIcon(cardDetails.cardNumber) === 'rupay' && 'RUPAY'}
                        {getCardTypeIcon(cardDetails.cardNumber) === 'amex' && 'AMEX'}
                      </div>
                    )}
                  </div>
                  <div className="card-logos">
                    <span className="card-logo visa">VISA</span>
                    <span className="card-logo mastercard">MasterCard</span>
                    <span className="card-logo rupay">RUPAY</span>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={handleCardInputChange}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <div className="cvv-input-wrapper">
                      <input
                        type="password"
                        id="cvv"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardInputChange}
                        placeholder="123"
                        maxLength="4"
                      />
                      <span className="cvv-info" title="3-digit code on back of card">?</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cardName">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleCardInputChange}
                    placeholder="Name as on card"
                  />
                </div>

                <div className="secure-card-note">
                  <span className="lock-icon">{icons.lock}</span>
                  Your card details are secure and encrypted
                </div>
              </div>
            )}

            {formData.paymentMethod === 'paypal' && (
              <div className="paypal-info">
                <div className="paypal-preview">
                  <div className="paypal-preview-icon">
                    {icons.paypal}
                  </div>
                  <div className="paypal-preview-text">
                    <h4>Pay with PayPal</h4>
                    <p>Click "Place Order" to continue to PayPal's secure payment portal</p>
                    <div className="paypal-features">
                      <span className="feature">Buyer Protection</span>
                      <span className="feature">Instant Payment</span>
                      <span className="feature">No Card Details Shared</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'upi' && (
              <div className="upi-info">
                <div className="upi-preview">
                  <div className="upi-preview-icon" style={{background: '#0c9d58'}}>
                    {icons.mobile}
                  </div>
                  <div className="upi-preview-text">
                    <h4>Pay via UPI</h4>
                    <p>Click "Place Order" to open UPI payment options</p>
                    <div className="upi-features">
                      <span className="feature">Scan QR Code</span>
                      <span className="feature">UPI Apps</span>
                      <span className="feature">Instant Payment</span>
                    </div>
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
              ) : formData.paymentMethod === 'upi' ? (
                `Pay via UPI - ₹${total.toFixed(2)}`
              ) : (
                `Place Order - ₹${total.toFixed(2)}`
              )}
            </button>
            
            <p className="email-notice">
              <small>
                ✅ Order confirmation will be sent to <strong>{formData.email || 'your email'}</strong>
              </small>
            </p>

            <div className="security-badge">
              <span className="security-icon">{icons.lock}</span>
              <span className="security-text">Secure 256-bit SSL Encryption</span>
            </div>
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
              {shipping === 0 && <span className="free-badge">FREE</span>}
            </div>
            
            <div className="summary-row">
              <span>Tax (12%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            
            <div className="summary-total">
              <span>Total Amount</span>
              <span className="total-amount">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="order-protection">
            <div className="protection-item">
              <span className="protection-icon">{icons.shield}</span>
              <div>
                <h4>Order Protection</h4>
                <p>30-day return policy & manufacturer warranty</p>
              </div>
            </div>
            <div className="protection-item">
              <span className="protection-icon">{icons.truck}</span>
              <div>
                <h4>Fast Delivery</h4>
                <p>3-5 business days across India</p>
              </div>
            </div>
            <div className="protection-item">
              <span className="protection-icon">{icons.headset}</span>
              <div>
                <h4>24/7 Support</h4>
                <p>Call 1800-123-4567 for assistance</p>
              </div>
            </div>
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