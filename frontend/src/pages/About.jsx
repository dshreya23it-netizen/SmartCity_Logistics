export default function About() {
  const teamMembers = [
    { name: "Dr. Arjun Sharma", role: "Chief Technology Officer", expertise: "IoT & AI Systems", experience: "15+ years" },
    { name: "Priya Patel", role: "Urban Solutions Director", expertise: "Smart City Planning", experience: "12+ years" },
    { name: "Rohan Desai", role: "Head of R&D", expertise: "Sensor Technology", experience: "10+ years" },
    { name: "Meera Krishnan", role: "Sustainability Lead", expertise: "Green Infrastructure", experience: "8+ years" },
  ];

  const achievements = [
    { year: "2024", achievement: "National Smart City Innovation Award", details: "Recognized for excellence in urban IoT solutions" },
    { year: "2023", achievement: "Deployed 10,000+ sensors", details: "Across 25+ cities in India" },
    { year: "2022", achievement: "ISO 27001 Certified", details: "Information security management certification" },
    { year: "2021", achievement: "Sustainable Development Partner", details: "UN-recognized sustainable solutions provider" },
  ];

  return (
    <div className="page">
      {/* Hero Section */}
      <div className="hero" style={{background: "linear-gradient(rgba(26, 35, 126, 0.9), rgba(26, 35, 126, 0.8)), url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1600') center/cover"}}>
        <h1>Building Smarter Cities Together</h1>
        <p>Transforming urban landscapes through innovative IoT solutions and sustainable technologies</p>
      </div>

      {/* Mission & Vision */}
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", margin: "3rem 0"}}>
        <div className="card">
          <div style={{fontSize: "3rem", color: "#3d5afe", marginBottom: "1rem"}}>🎯</div>
          <h3 style={{color: "#1a237e"}}>Our Mission</h3>
          <p>To create intelligent, sustainable, and efficient urban ecosystems through cutting-edge IoT technology, making cities more livable, resilient, and future-ready.</p>
        </div>
        <div className="card">
          <div style={{fontSize: "3rem", color: "#00e676", marginBottom: "1rem"}}>🔭</div>
          <h3 style={{color: "#1a237e"}}>Our Vision</h3>
          <p>To be the global leader in smart city solutions, empowering municipalities with data-driven insights and automated systems for better urban management.</p>
        </div>
      </div>

      {/* Company Story */}
      <div className="card" style={{margin: "3rem 0"}}>
        <h2 style={{color: "#1a237e", marginBottom: "1.5rem"}}>Our Story</h2>
        <p style={{lineHeight: "1.8", marginBottom: "1.5rem"}}>
          Founded in 2018, SmartCity Logistics RTD began as a research initiative at IIT Delhi, 
          focusing on solving urban challenges through technology. What started as a small team 
          of engineers and urban planners has grown into a comprehensive smart city solutions provider.
        </p>
        <p style={{lineHeight: "1.8"}}>
          Today, we serve over 50 municipalities across India, deploying more than 15,000 IoT devices 
          and helping cities save 30% on energy costs, reduce traffic congestion by 25%, and improve 
          emergency response times by 40%.
        </p>
      </div>

      {/* Team Section */}
      <h2 style={{color: "#1a237e", margin: "3rem 0 1.5rem"}}>Meet Our Leadership</h2>
      <div className="grid">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="card" style={{textAlign: "center"}}>
            <div style={{
              width: "100px",
              height: "100px",
              margin: "0 auto 1rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "2.5rem",
              fontWeight: "bold"
            }}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h3 style={{marginBottom: "0.5rem"}}>{member.name}</h3>
            <p style={{color: "#3d5afe", fontWeight: "bold", marginBottom: "0.5rem"}}>{member.role}</p>
            <p style={{color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem"}}>
              <strong>Expertise:</strong> {member.expertise}
            </p>
            <p style={{color: "#666", fontSize: "0.9rem"}}>
              <strong>Experience:</strong> {member.experience}
            </p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <h2 style={{color: "#1a237e", margin: "3rem 0 1.5rem"}}>Our Achievements</h2>
      <div className="grid">
        {achievements.map((item, idx) => (
          <div key={idx} className="card">
            <div style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem"
            }}>
              <div style={{
                background: "#3d5afe",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                fontWeight: "bold",
                marginRight: "1rem"
              }}>
                {item.year}
              </div>
              <h3 style={{margin: 0}}>{item.achievement}</h3>
            </div>
            <p style={{color: "#666"}}>{item.details}</p>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="card" style={{marginTop: "3rem", textAlign: "center"}}>
        <h2 style={{color: "#1a237e", marginBottom: "2rem"}}>Our Core Values</h2>
        <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem"}}>
          {[
            { icon: "💡", title: "Innovation", desc: "Pushing boundaries with new ideas" },
            { icon: "🤝", title: "Collaboration", desc: "Working together for better cities" },
            { icon: "🌱", title: "Sustainability", desc: "Eco-friendly urban solutions" },
            { icon: "🎯", title: "Excellence", desc: "Quality in everything we do" }
          ].map((value, idx) => (
            <div key={idx}>
              <div style={{fontSize: "2.5rem", marginBottom: "0.5rem"}}>{value.icon}</div>
              <h4 style={{marginBottom: "0.5rem"}}>{value.title}</h4>
              <p style={{color: "#666", fontSize: "0.9rem"}}>{value.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}