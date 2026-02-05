import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        organization: "",
        subject: "",
        message: ""
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: "📧",
      title: "Email",
      details: ["support@smartcity.com", "sales@smartcity.com"],
      response: "Response within 24 hours"
    },
    {
      icon: "📞",
      title: "Phone",
      details: ["+91 1800 123 4567", "+91 98765 43210"],
      response: "Mon-Fri, 9AM-6PM IST"
    },
    {
      icon: "📍",
      title: "Office",
      details: ["SmartCity Tech Park", "Sector 62, Noida", "Uttar Pradesh 201301"],
      response: "Visit by appointment"
    }
  ];

  const departments = [
    { name: "Technical Support", email: "support@smartcity.com", phone: "Ext. 101" },
    { name: "Sales & Business", email: "sales@smartcity.com", phone: "Ext. 102" },
    { name: "Project Management", email: "projects@smartcity.com", phone: "Ext. 103" },
    { name: "Partnerships", email: "partners@smartcity.com", phone: "Ext. 104" },
    { name: "Career Opportunities", email: "careers@smartcity.com", phone: "Ext. 105" },
    { name: "Media & PR", email: "media@smartcity.com", phone: "Ext. 106" }
  ];

  return (
    <div className="page">
      {/* Hero Section */}
      <div className="hero" style={{background: "linear-gradient(rgba(26, 35, 126, 0.9), rgba(26, 35, 126, 0.8)), url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600') center/cover"}}>
        <h1>Get in Touch</h1>
        <p>We're here to help you build smarter cities. Reach out to our team for any inquiries or support.</p>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem", marginTop: "3rem"}}>
        {/* Left Column - Contact Form */}
        <div>
          <div className="card">
            <h2 style={{marginBottom: "1.5rem", color: "#1a237e"}}>Send us a Message</h2>
            
            {submitted && (
              <div style={{
                padding: "1rem",
                marginBottom: "1.5rem",
                background: "#e8f5e9",
                color: "#2e7d32",
                borderRadius: "8px",
                borderLeft: "4px solid #4caf50",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <span style={{fontSize: "1.2rem"}}>✅</span>
                <div>
                  <strong>Message Sent!</strong>
                  <p style={{margin: "0.3rem 0 0 0", fontSize: "0.9rem"}}>
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem"}}>
                <div>
                  <label style={{display: "block", marginBottom: "0.5rem", color: "#666"}}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
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
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
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

              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem"}}>
                <div>
                  <label style={{display: "block", marginBottom: "0.5rem", color: "#666"}}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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
                    Organization
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
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
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    background: "white"
                  }}
                >
                  <option value="">Select a subject</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                  <option value="career">Career Opportunity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{marginBottom: "1.5rem"}}>
                <label style={{display: "block", marginBottom: "0.5rem", color: "#666"}}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Tell us how we can help you..."
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    resize: "vertical"
                  }}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: isSubmitting ? "#666" : "linear-gradient(45deg, #3d5afe, #2979ff)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "1.1rem"
                }}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="card" style={{marginTop: "2rem"}}>
            <h3 style={{marginBottom: "1.5rem", color: "#1a237e"}}>Frequently Asked Questions</h3>
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
              {[
                {
                  q: "What is the typical response time for support requests?",
                  a: "We aim to respond to all support requests within 24 hours. Emergency technical support is available 24/7 for enterprise clients."
                },
                {
                  q: "Do you offer custom solutions for specific city requirements?",
                  a: "Yes, we specialize in custom IoT solutions tailored to unique urban challenges. Contact our solutions team for a consultation."
                },
                {
                  q: "What cities have you implemented solutions in?",
                  a: "We've deployed solutions in over 50 cities across India including Delhi, Mumbai, Bangalore, Hyderabad, and Ahmedabad."
                },
                {
                  q: "Is training provided for municipal staff?",
                  a: "Yes, comprehensive training programs are included with all enterprise implementations to ensure smooth adoption."
                }
              ].map((faq, idx) => (
                <details key={idx} style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "1rem"
                }}>
                  <summary style={{
                    fontWeight: "bold",
                    cursor: "pointer",
                    color: "#1a237e",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    {faq.q}
                    <span style={{fontSize: "1.2rem"}}>➕</span>
                  </summary>
                  <p style={{margin: "1rem 0 0 0", color: "#666", lineHeight: "1.6"}}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Contact Info */}
        <div>
          {/* Contact Information */}
          <div className="card">
            <h3 style={{marginBottom: "1.5rem", color: "#1a237e"}}>Contact Information</h3>
            <div style={{display: "flex", flexDirection: "column", gap: "2rem"}}>
              {contactInfo.map((info, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  gap: "1rem",
                  paddingBottom: "1.5rem",
                  borderBottom: idx < contactInfo.length - 1 ? "1px solid #eee" : "none"
                }}>
                  <div style={{
                    width: "50px",
                    height: "50px",
                    background: "#e3f2fd",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    color: "#1a237e"
                  }}>
                    {info.icon}
                  </div>
                  <div style={{flex: 1}}>
                    <h4 style={{margin: "0 0 0.5rem 0", color: "#333"}}>{info.title}</h4>
                    {info.details.map((detail, i) => (
                      <p key={i} style={{margin: "0.3rem 0", color: "#666"}}>{detail}</p>
                    ))}
                    <p style={{margin: "0.5rem 0 0 0", fontSize: "0.9rem", color: "#ff9800"}}>
                      <strong>{info.response}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div className="card" style={{marginTop: "1.5rem"}}>
            <h3 style={{marginBottom: "1.5rem", color: "#1a237e"}}>Contact by Department</h3>
            <div style={{maxHeight: "300px", overflowY: "auto"}}>
              {departments.map((dept, idx) => (
                <div key={idx} style={{
                  padding: "1rem",
                  marginBottom: "0.8rem",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  borderLeft: "4px solid #3d5afe"
                }}>
                  <h4 style={{margin: "0 0 0.5rem 0", color: "#333"}}>{dept.name}</h4>
                  <div style={{display: "flex", justifyContent: "space-between", fontSize: "0.9rem"}}>
                    <span style={{color: "#666"}}>{dept.email}</span>
                    <span style={{color: "#3d5afe", fontWeight: "bold"}}>{dept.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="card" style={{marginTop: "1.5rem"}}>
            <h3 style={{marginBottom: "1rem", color: "#1a237e"}}>Visit Our Office</h3>
            <div style={{
              height: "200px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1.2rem",
              marginBottom: "1rem"
            }}>
              🗺️ Interactive Map
            </div>
            <p style={{color: "#666", fontSize: "0.9rem", textAlign: "center"}}>
              Click to view directions
            </p>
          </div>

          {/* Social Media */}
          <div className="card" style={{marginTop: "1.5rem", textAlign: "center"}}>
            <h3 style={{marginBottom: "1rem", color: "#1a237e"}}>Follow Us</h3>
            <div style={{display: "flex", justifyContent: "center", gap: "1rem"}}>
              {[
                { icon: "💼", label: "LinkedIn", color: "#0077b5" },
                { icon: "🐦", label: "Twitter", color: "#1da1f2" },
                { icon: "📘", label: "Facebook", color: "#1877f2" },
                { icon: "📷", label: "Instagram", color: "#e4405f" }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textDecoration: "none",
                    color: social.color,
                    fontSize: "0.8rem"
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  <div style={{
                    width: "50px",
                    height: "50px",
                    background: `${social.color}15`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    marginBottom: "0.5rem"
                  }}>
                    {social.icon}
                  </div>
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="card" style={{marginTop: "3rem", textAlign: "center"}}>
        <h2 style={{marginBottom: "1rem", color: "#1a237e"}}>Stay Updated</h2>
        <p style={{marginBottom: "1.5rem", color: "#666", maxWidth: "600px", margin: "0 auto 1.5rem"}}>
          Subscribe to our newsletter for the latest updates on smart city technologies and innovations.
        </p>
        <div style={{display: "flex", maxWidth: "500px", margin: "0 auto"}}>
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              flex: 1,
              padding: "0.8rem",
              border: "1px solid #ddd",
              borderRight: "none",
              borderRadius: "6px 0 0 6px",
              fontSize: "1rem"
            }}
          />
          <button style={{
            padding: "0.8rem 1.5rem",
            background: "linear-gradient(45deg, #00e676, #00c853)",
            color: "white",
            border: "none",
            borderRadius: "0 6px 6px 0",
            cursor: "pointer",
            fontWeight: "bold"
          }}>
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}