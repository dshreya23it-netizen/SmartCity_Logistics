// src/pages/Payment.jsx
// src/pages/Payment.jsx - FIXED IMPORTS
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { useEffect, useState } from "react"; // Removed useContext
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; // ✅ Import useCart hook
import { firestore } from "../firebase";

export default function Payment() {
  const navigate = useNavigate();
  const { cart, clearCart, cartTotal } = useCart();  // ✅ Use useCart hook
  const { currentUser } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [firestoreCart, setFirestoreCart] = useState([]);
  const [orderDetails, setOrderDetails] = useState({
    billingName: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: ""
  });

  // Fetch cart from Firestore
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const cartRef = collection(firestore, "users", currentUser.uid, "cart");
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const cartItems = [];
      snapshot.forEach((doc) => {
        cartItems.push({ 
          id: doc.id, 
          ...doc.data()
        });
      });
      setFirestoreCart(cartItems);
    });

    // Get billing info from localStorage or default
    const savedBilling = JSON.parse(localStorage.getItem("billingInfo")) || {
      billingName: "John Doe",
      company: "SmartCity Municipal Corporation",
      address: "123 Urban Tech Park, Sector 45",
      city: "Delhi",
      state: "Delhi",
      zip: "110045",
      phone: "+91 98765 43210",
      email: currentUser?.email || "user@example.com"
    };
    setOrderDetails(savedBilling);

    return () => unsubscribe();
  }, [currentUser, navigate]);

  // Calculate totals
  const calculateTotals = () => {
    const items = firestoreCart.length > 0 ? firestoreCart : cart;
    const subtotal = items.reduce((sum, item) => 
      sum + (item.price * (item.quantity || 1)), 0
    );
    const shipping = subtotal > 50000 ? 0 : 500; // Free shipping above ₹50,000
    const tax = subtotal * 0.18;
    const discount = subtotal > 100000 ? subtotal * 0.15 : subtotal * 0.10; // 15% above 1L, 10% below
    const grandTotal = subtotal + shipping + tax - discount;
    
    return { subtotal, shipping, tax, discount, grandTotal, items };
  };

  const { subtotal, shipping, tax, discount, grandTotal, items } = calculateTotals();

  // Generate order ID
  const generateOrderId = () => {
    return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (!currentUser) {
      alert("Please login to complete payment");
      navigate("/login");
      return;
    }

    // Validate card details for card payment
    if (paymentMethod === "card") {
      if (!cardNumber || !expiry || !cvv || !name) {
        alert("Please fill all card details");
        return;
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        alert("Please enter a valid 16-digit card number");
        return;
      }
      if (cvv.length !== 3) {
        alert("Please enter a valid 3-digit CVV");
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      // Generate order data
      const orderId = generateOrderId();
      const orderData = {
        orderId,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        items: items.map(item => ({
          productId: item.productId || item.id,
          name: item.name,
          type: item.type,
          price: item.price,
          quantity: item.quantity || 1,
          total: item.price * (item.quantity || 1)
        })),
        billingDetails: orderDetails,
        paymentDetails: {
          method: paymentMethod,
          amount: grandTotal,
          status: "completed",
          transactionId: `TXN${Date.now()}`
        },
        totals: {
          subtotal,
          shipping,
          tax,
          discount,
          grandTotal
        },
        status: "confirmed",
        orderDate: serverTimestamp(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        trackingNumber: `TRACK${Date.now()}`
      };

      // 1. Save order to Firestore
      const ordersRef = collection(firestore, "users", currentUser.uid, "orders");
      await addDoc(ordersRef, orderData);

      // 2. Clear cart from Firestore
      const cartRef = collection(firestore, "users", currentUser.uid, "cart");
      const cartSnapshot = await getDocs(cartRef);
      const batch = writeBatch(firestore);
      
      cartSnapshot.docs.forEach((cartDoc) => {
        batch.delete(cartDoc.ref);
      });
      await batch.commit();

      // 3. Clear local cart
      clearCart();

      // 4. Save order summary to localStorage for receipt
      localStorage.setItem("lastOrder", JSON.stringify(orderData));

      // 5. Show success and redirect
      setIsProcessing(false);
      
      alert(`
        ✅ Payment Successful!
        
        Order ID: ${orderId}
        Amount: ₹${grandTotal.toLocaleString()}
        Status: Confirmed
        
        You will receive an email confirmation shortly.
        Track your order with ID: ${orderData.trackingNumber}
      `);
      
      // Redirect to order confirmation or dashboard
      navigate("/dashboard");

    } catch (error) {
      setIsProcessing(false);
      console.error("Payment processing error:", error);
      alert("Payment failed: " + error.message);
    }
  };

  // Handle UPI payment
  const handleUPIPayment = () => {
    const upiId = "smartcity@upi";
    alert(`
      UPI Payment Instructions:
      
      1. Open your UPI app
      2. Send ₹${grandTotal.toLocaleString()} to:
         UPI ID: ${upiId}
      
      3. Enter order ID in remarks: ORD${Date.now()}
      4. Complete payment in your UPI app
      
      Your order will be confirmed automatically.
    `);
    
    // Simulate UPI payment
    setIsProcessing(true);
    setTimeout(() => {
      handlePayment();
    }, 3000);
  };

  // Handle Net Banking
  const handleNetBanking = () => {
    alert(`
      Redirecting to Net Banking...
      
      Please complete payment on your bank's secure portal.
      Amount: ₹${grandTotal.toLocaleString()}
    `);
    
    setIsProcessing(true);
    setTimeout(() => {
      handlePayment();
    }, 4000);
  };

  // Handle payment based on method
  const handlePaymentSubmit = () => {
    if (paymentMethod === "card") {
      handlePayment();
    } else if (paymentMethod === "upi") {
      handleUPIPayment();
    } else if (paymentMethod === "netbanking") {
      handleNetBanking();
    } else {
      handlePayment(); // For wallet/other methods
    }
  };

  if (!currentUser) {
    return (
      <div className="page" style={{ textAlign: "center", padding: "4rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h3>Please Login to Continue</h3>
        <p>You need to be logged in to make a payment</p>
        <button 
          onClick={() => navigate("/login")}
          style={{
            marginTop: "1rem",
            padding: "0.8rem 1.5rem",
            background: "#3d5afe",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 style={{marginBottom: "1rem", color: "#1a237e"}}>💳 Secure Payment</h1>
      <p style={{marginBottom: "2rem", color: "#666"}}>
        Complete your purchase with secure payment
      </p>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem"}}>
        {/* Left Column - Payment Form */}
        <div>
          <div className="card" style={{marginBottom: "1.5rem"}}>
            <h3 style={{marginBottom: "1.5rem", color: "#1a237e"}}>Payment Details</h3>
            
            {/* Payment Method Selection */}
            <div style={{marginBottom: "2rem"}}>
              <div style={{display: "flex", gap: "1rem", marginBottom: "1rem"}}>
                {[
                  { id: "card", label: "Card", icon: "💳" },
                  { id: "upi", label: "UPI", icon: "📱" },
                  { id: "netbanking", label: "Net Banking", icon: "🏦" },
                  { id: "wallet", label: "Wallet", icon: "👛" }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    style={{
                      flex: 1,
                      padding: "1rem",
                      background: paymentMethod === method.id ? "#3d5afe" : "#f0f0f0",
                      color: paymentMethod === method.id ? "white" : "#333",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <span style={{fontSize: "1.5rem"}}>{method.icon}</span>
                    <span style={{fontSize: "0.8rem"}}>{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Form */}
            {paymentMethod === "card" && (
              <div>
                <div style={{marginBottom: "1.5rem"}}>
                  <label style={{display: "block", marginBottom: "0.5rem", color: "#666"}}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "1rem",
                      letterSpacing: "1px"
                    }}
                  />
                  <div style={{display: "flex", gap: "0.5rem", marginTop: "0.5rem"}}>
                    {["visa", "mastercard", "amex", "rupay"].map(brand => (
                      <div key={brand} style={{
                        padding: "0.3rem 0.8rem",
                        background: "#f0f0f0",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        opacity: cardNumber.startsWith(brand === "amex" ? "3" : brand === "visa" ? "4" : brand === "mastercard" ? "5" : "6") ? 1 : 0.5
                      }}>
                        {brand.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem"}}>
                  <div>
                    <label style={{display: "block", marginBottom: "0.5rem", color: "#666"}}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setExpiry(value.slice(0, 5));
                      }}
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "1rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{display: "block", marginBottom: "0.5rem", color: "#666"}}>
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "1rem"
                      }}
                    />
                  </div>
                </div>

                <div style={{marginBottom: "1.5rem"}}>
                  <label style={{display: "block", marginBottom: "0.5rem", color: "#666"}}>
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "1rem"
                    }}
                  />
                </div>

                <label style={{display: "flex", alignItems: "center", marginBottom: "1.5rem"}}>
                  <input type="checkbox" style={{marginRight: "0.5rem"}} />
                  <span>Save card for future payments</span>
                </label>
              </div>
            )}

            {/* UPI Form */}
            {paymentMethod === "upi" && (
              <div style={{textAlign: "center", padding: "2rem 0"}}>
                <div style={{fontSize: "3rem", marginBottom: "1rem"}}>📱</div>
                <h4 style={{marginBottom: "1rem"}}>Pay via UPI</h4>
                <p style={{marginBottom: "1.5rem", color: "#666"}}>
                  Scan the QR code or use UPI ID below
                </p>
                <div style={{
                  width: "200px",
                  height: "200px",
                  margin: "0 auto 1.5rem",
                  background: "white",
                  border: "2px dashed #3d5afe",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  padding: "1rem"
                }}>
                  <div style={{textAlign: "center"}}>
                    <div style={{fontSize: "3rem", marginBottom: "0.5rem"}}>📲</div>
                    <div style={{fontSize: "0.9rem", color: "#666"}}>UPI QR Code</div>
                  </div>
                </div>
                <div style={{
                  background: "#f8f9fa",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{fontSize: "0.9rem", color: "#666", marginBottom: "0.3rem"}}>
                    UPI ID
                  </div>
                  <div style={{
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: "#1a237e",
                    wordBreak: "break-all"
                  }}>
                    smartcity.orders@okicici
                  </div>
                </div>
                <button
                  onClick={handleUPIPayment}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    background: "linear-gradient(45deg, #8e24aa, #ab47bc)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1rem"
                  }}
                >
                  I have paid via UPI
                </button>
              </div>
            )}

            {/* Net Banking Form */}
            {paymentMethod === "netbanking" && (
              <div style={{padding: "1rem 0"}}>
                <h4 style={{marginBottom: "1rem", color: "#1a237e"}}>Select Your Bank</h4>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  marginBottom: "1.5rem"
                }}>
                  {["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Bank", "Yes Bank"].map(bank => (
                    <button
                      key={bank}
                      style={{
                        padding: "1rem",
                        background: "#f0f0f0",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        textAlign: "center",
                        fontWeight: "bold"
                      }}
                      onClick={() => {
                        alert(`Redirecting to ${bank} Net Banking...`);
                        handleNetBanking();
                      }}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wallet Form */}
            {paymentMethod === "wallet" && (
              <div style={{textAlign: "center", padding: "2rem 0"}}>
                <div style={{fontSize: "3rem", marginBottom: "1rem"}}>👛</div>
                <h4 style={{marginBottom: "1rem"}}>Digital Wallet Payment</h4>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem"
                }}>
                  {["Paytm", "Google Pay", "PhonePe", "Amazon Pay"].map(wallet => (
                    <button
                      key={wallet}
                      style={{
                        padding: "1rem",
                        background: "#f0f0f0",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                      onClick={() => {
                        alert(`Opening ${wallet}...`);
                        handlePayment();
                      }}
                    >
                      <span style={{fontSize: "1.5rem"}}>👛</span>
                      <span>{wallet}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Security Badge */}
            <div style={{
              padding: "1rem",
              background: "#e8f5e9",
              borderRadius: "8px",
              textAlign: "center",
              marginTop: "1.5rem"
            }}>
              <div style={{fontSize: "1.5rem", marginBottom: "0.5rem"}}>🛡️</div>
              <p style={{margin: 0, fontSize: "0.9rem", color: "#2e7d32"}}>
                <strong>Secure Payment:</strong> 256-bit SSL encryption | PCI DSS Compliant
              </p>
            </div>
          </div>

          {/* Contact Support */}
          <div className="card" style={{textAlign: "center"}}>
            <h4 style={{marginBottom: "0.5rem", color: "#1a237e"}}>Having Trouble?</h4>
            <p style={{margin: "0 0 1rem 0", color: "#666", fontSize: "0.9rem"}}>
              Our support team is here to help
            </p>
            <button style={{
              padding: "0.8rem 1.5rem",
              background: "#f0f0f0",
              color: "#333",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}>
              📞 Contact Support: 1800-123-4567
            </button>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="card" style={{position: "sticky", top: "2rem"}}>
            <h3 style={{marginBottom: "1.5rem", color: "#1a237e"}}>Order Summary</h3>
            
            {/* Order Items */}
            <div style={{marginBottom: "1.5rem", maxHeight: "300px", overflowY: "auto"}}>
              {items.length === 0 ? (
                <div style={{textAlign: "center", padding: "1rem", color: "#666"}}>
                  <div style={{fontSize: "2rem", marginBottom: "0.5rem"}}>🛒</div>
                  <p>No items in cart</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.8rem",
                    paddingBottom: "0.8rem",
                    borderBottom: "1px solid #eee"
                  }}>
                    <div style={{flex: 1}}>
                      <p style={{margin: "0 0 0.3rem 0", fontWeight: "bold", fontSize: "0.95rem"}}>
                        {item.name}
                      </p>
                      <p style={{margin: 0, color: "#666", fontSize: "0.8rem"}}>
                        Qty: {item.quantity || 1} × ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <p style={{margin: 0, fontWeight: "bold", color: "#1a237e", whiteSpace: "nowrap"}}>
                      ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Price Breakdown */}
            <div style={{marginBottom: "1.5rem"}}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                fontSize: "0.9rem"
              }}>
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                fontSize: "0.9rem"
              }}>
                <span>Shipping</span>
                <span style={{color: shipping === 0 ? "#00e676" : "#666"}}>
                  {shipping === 0 ? "FREE" : `₹${shipping.toLocaleString()}`}
                </span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                fontSize: "0.9rem"
              }}>
                <span>Tax (18%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid #eee",
                fontSize: "0.9rem"
              }}>
                <span>
                  Discount
                  <span style={{color: "#00e676", marginLeft: "0.5rem"}}>
                    ({discount/subtotal*100}%)
                  </span>
                </span>
                <span style={{color: "#00e676", fontWeight: "bold"}}>
                  -₹{discount.toLocaleString()}
                </span>
              </div>
              
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "1rem 0",
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
                fontSize: "1.2rem",
                fontWeight: "bold"
              }}>
                <span>Total</span>
                <span style={{color: "#1a237e", fontSize: "1.5rem"}}>
                  ₹{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePaymentSubmit}
              disabled={isProcessing || items.length === 0}
              style={{
                width: "100%",
                padding: "1rem",
                background: isProcessing ? "#666" : items.length === 0 ? "#ccc" : "linear-gradient(45deg, #00e676, #00c853)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: items.length === 0 ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "1.1rem",
                marginBottom: "1rem",
                transition: "all 0.3s"
              }}
            >
              {isProcessing ? (
                <>
                  <span style={{marginRight: "0.5rem"}}>⏳</span>
                  Processing {paymentMethod === "card" ? "Card Payment..." : paymentMethod === "upi" ? "UPI Payment..." : "Payment..."}
                </>
              ) : items.length === 0 ? (
                "Cart is Empty"
              ) : (
                `Pay ₹${grandTotal.toLocaleString()} Now`
              )}
            </button>

            <button
              onClick={() => navigate("/billing")}
              style={{
                width: "100%",
                padding: "1rem",
                background: "transparent",
                color: "#3d5afe",
                border: "2px solid #3d5afe",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem"
              }}
            >
              Back to Billing
            </button>

            {/* Secure Payment Info */}
            <div style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "#fff3e0",
              borderRadius: "8px",
              fontSize: "0.85rem"
            }}>
              <p style={{margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem"}}>
                <span>🔒</span>
                <strong>SSL Secured Payment</strong>
              </p>
              <p style={{margin: 0, color: "#666", lineHeight: "1.4"}}>
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="card" style={{marginTop: "1.5rem"}}>
            <h4 style={{marginBottom: "1rem", color: "#1a237e"}}>🎁 Order Benefits</h4>
            <ul style={{
              margin: 0,
              paddingLeft: "1.2rem",
              color: "#666",
              fontSize: "0.9rem",
              lineHeight: "1.6"
            }}>
              <li>Free installation service (worth ₹15,000)</li>
              <li>6 months comprehensive warranty</li>
              <li>24/7 priority technical support</li>
              <li>Free software updates for 1 year</li>
              <li>Dedicated account manager</li>
              <li>Express shipping (3-5 business days)</li>
            </ul>
          </div>

          {/* Order Info */}
          <div className="card" style={{marginTop: "1.5rem", fontSize: "0.85rem"}}>
            <h4 style={{marginBottom: "0.8rem", color: "#1a237e", fontSize: "1rem"}}>📋 Order Information</h4>
            <div style={{color: "#666"}}>
              <p style={{margin: "0 0 0.5rem 0"}}>
                <strong>Order ID:</strong> Will be generated after payment
              </p>
              <p style={{margin: "0 0 0.5rem 0"}}>
                <strong>Estimated Delivery:</strong> 5-7 business days
              </p>
              <p style={{margin: 0}}>
                <strong>Return Policy:</strong> 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
