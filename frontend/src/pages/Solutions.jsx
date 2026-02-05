const smartSolutions = [
  {
    category: "Smart Transportation",
    icon: "🚦",
    solutions: [
      "AI Traffic Management System",
      "Smart Parking Solutions",
      "Intelligent Public Transport",
      "EV Charging Infrastructure"
    ]
  },
  {
    category: "Healthcare",
    icon: "🏥",
    solutions: [
      "Remote Patient Monitoring",
      "Smart Hospital Management",
      "Emergency Response Systems",
      "Medical Equipment Tracking"
    ]
  },
  {
    category: "Education",
    icon: "🏫",
    solutions: [
      "Smart Classroom Systems",
      "Campus Security & Access",
      "Digital Learning Platforms",
      "Energy Management in Schools"
    ]
  },
  {
    category: "Agriculture",
    icon: "🌾",
    solutions: [
      "Precision Farming Sensors",
      "Automated Irrigation Systems",
      "Crop Health Monitoring",
      "Smart Greenhouses"
    ]
  },
  {
    category: "Security & Surveillance",
    icon: "👁️",
    solutions: [
      "AI Video Analytics",
      "Smart Access Control",
      "Emergency Alert Systems",
      "Crime Prediction Models"
    ]
  },
  {
    category: "Energy Management",
    icon: "⚡",
    solutions: [
      "Smart Grid Systems",
      "Renewable Energy Integration",
      "Building Energy Optimization",
      "Street Light Automation"
    ]
  },
  {
    category: "Waste Management",
    icon: "🗑️",
    solutions: [
      "Smart Bin Monitoring",
      "Route Optimization for Collection",
      "Recycling Automation",
      "Waste-to-Energy Systems"
    ]
  },
  {
    category: "Water Management",
    icon: "💧",
    solutions: [
      "Leak Detection Systems",
      "Water Quality Monitoring",
      "Smart Metering",
      "Flood Prediction & Control"
    ]
  }
];

export default function Solutions() {
  return (
    <div className="page">
      <h1 style={{marginBottom: "2rem", color: "#1a237e"}}>Smart City Solutions</h1>
      <p style={{marginBottom: "3rem", fontSize: "1.1rem"}}>
        Comprehensive IoT solutions for transforming urban infrastructure into intelligent, 
        sustainable, and efficient ecosystems.
      </p>
      
      <div className="grid">
        {smartSolutions.map((category, idx) => (
          <div key={idx} className="card">
            <div style={{display: "flex", alignItems: "center", marginBottom: "1rem"}}>
              <span style={{fontSize: "2.5rem", marginRight: "1rem"}}>{category.icon}</span>
              <h3 style={{color: "#1a237e"}}>{category.category}</h3>
            </div>
            <ul style={{listStyle: "none", padding: 0}}>
              {category.solutions.map((solution, i) => (
                <li key={i} style={{
                  padding: "0.8rem",
                  margin: "0.5rem 0",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  borderLeft: "4px solid #3d5afe"
                }}>
                  {solution}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}