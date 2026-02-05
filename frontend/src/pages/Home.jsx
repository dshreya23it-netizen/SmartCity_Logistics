export default function Home() {
  return (
    <div className="page">
      {/* Hero Section */}
      <div className="hero">
        <h1>Smart City Logistics & IoT Management</h1>
        <p>
          Integrated platform for real-time monitoring, intelligent logistics, 
          and sustainable urban development through advanced IoT solutions.
        </p>
        <a href="/Solutions" className="hero-btn">Explore Smart Solutions</a>
      </div>

      {/* Features Grid */}
      <div className="grid">
        <div className="card">
          <div style={{fontSize: "3rem", marginBottom: "1rem"}}>📊</div>
          <h3>Real-Time Analytics</h3>
          <p>Live data monitoring and predictive analytics for urban infrastructure</p>
        </div>
        
        <div className="card">
          <div style={{fontSize: "3rem", marginBottom: "1rem"}}>🚚</div>
          <h3>Smart Logistics</h3>
          <p>AI-powered route optimization and supply chain automation</p>
        </div>
        
        <div className="card">
          <div style={{fontSize: "3rem", marginBottom: "1rem"}}>🌿</div>
          <h3>Sustainable Solutions</h3>
          <p>Energy-efficient systems and environmental monitoring</p>
        </div>
        
        <div className="card">
          <div style={{fontSize: "3rem", marginBottom: "1rem"}}>🔒</div>
          <h3>Secure Infrastructure</h3>
          <p>Advanced security systems and data protection protocols</p>
        </div>
      </div>

      {/* Live Stats */}
      <div style={{marginTop: "4rem", textAlign: "center"}}>
        <h2>Live City Statistics</h2>
        <div className="stats-grid" style={{marginTop: "2rem"}}>
          <div className="stat-card">
            <h3>1,250+</h3>
            <p>Active Sensors</p>
          </div>
          <div className="stat-card">
            <h3>98.7%</h3>
            <p>System Uptime</p>
          </div>
          <div className="stat-card">
            <h3>45K+</h3>
            <p>Daily Data Points</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Monitoring</p>
          </div>
        </div>
      </div>
    </div>
  );
}