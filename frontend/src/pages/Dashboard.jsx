import { useEffect, useState } from "react";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    activeSensors: 1245,
    systemHealth: 98.7,
    energySavings: 35600,
    co2Reduction: 2450,
    alerts: 12,
    completedProjects: 47
  });

  const [recentOrders, setRecentOrders] = useState([
    { id: "ORD-001", project: "Smart Traffic Lights", status: "Completed", amount: "₹2,45,000", date: "2024-01-15" },
    { id: "ORD-002", project: "Waste Management", status: "In Progress", amount: "₹1,87,500", date: "2024-01-10" },
    { id: "ORD-003", project: "Air Quality Monitors", status: "Pending", amount: "₹3,20,000", date: "2024-01-05" },
    { id: "ORD-004", project: "Smart Water Meters", status: "Completed", amount: "₹4,15,000", date: "2023-12-28" },
  ]);

  const [systemAlerts, setSystemAlerts] = useState([
    { id: 1, type: "warning", message: "Sensor TEMP_045 battery low (15%)", time: "2 hours ago" },
    { id: 2, type: "error", message: "Gateway connection lost in Zone B", time: "5 hours ago" },
    { id: 3, type: "info", message: "Monthly maintenance scheduled", time: "1 day ago" },
    { id: 4, type: "success", message: "System update completed", time: "2 days ago" },
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setDashboardData(prev => ({
        ...prev,
        activeSensors: prev.activeSensors + Math.floor(Math.random() * 3),
        systemHealth: 98.5 + Math.random() * 0.5
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const kpiCards = [
    { title: "Active Sensors", value: dashboardData.activeSensors, change: "+2.3%", icon: "📡", color: "#3d5afe" },
    { title: "System Health", value: `${dashboardData.systemHealth.toFixed(1)}%`, change: "+0.5%", icon: "💚", color: "#00e676" },
    { title: "Energy Savings", value: `${(dashboardData.energySavings / 1000).toFixed(1)}k kWh`, change: "+15%", icon: "⚡", color: "#ff9800" },
    { title: "CO₂ Reduction", value: `${dashboardData.co2Reduction} tons`, change: "+12%", icon: "🌿", color: "#4caf50" },
    { title: "Active Alerts", value: dashboardData.alerts, change: "-3", icon: "🚨", color: "#ff5252" },
    { title: "Projects", value: dashboardData.completedProjects, change: "+2", icon: "🏗️", color: "#9c27b0" },
  ];

  return (
    <div className="page">
      <h1 style={{marginBottom: "1rem", color: "#1a237e"}}>📊 Smart City Dashboard</h1>
      <p style={{marginBottom: "2rem", color: "#666"}}>
        Real-time monitoring and analytics of smart city infrastructure
      </p>

      {/* KPI Cards */}
      <div className="grid" style={{marginBottom: "2rem"}}>
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className="card" style={{position: "relative"}}>
            <div style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              fontSize: "2rem"
            }}>
              {kpi.icon}
            </div>
            <h3 style={{color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem"}}>
              {kpi.title}
            </h3>
            <div style={{display: "flex", alignItems: "baseline", gap: "0.5rem"}}>
              <span style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: kpi.color
              }}>
                {kpi.value}
              </span>
              <span style={{
                background: kpi.change.startsWith('+') ? "#e8f5e9" : "#ffebee",
                color: kpi.change.startsWith('+') ? "#2e7d32" : "#c62828",
                padding: "0.2rem 0.6rem",
                borderRadius: "12px",
                fontSize: "0.8rem",
                fontWeight: "bold"
              }}>
                {kpi.change}
              </span>
            </div>
            <div style={{
              height: "4px",
              background: "#f0f0f0",
              marginTop: "1rem",
              borderRadius: "2px"
            }}>
              <div style={{
                width: "70%",
                height: "100%",
                background: kpi.color,
                borderRadius: "2px"
              }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Recent Data */}
      <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "2rem"}}>
        {/* Main Chart Area */}
        <div className="card">
          <h3 style={{marginBottom: "1.5rem", color: "#1a237e"}}>System Performance</h3>
          <div style={{
            height: "300px",
            background: "linear-gradient(180deg, #f8f9fa 0%, white 100%)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            border: "2px dashed #e0e0e0"
          }}>
            <div style={{textAlign: "center"}}>
              <div style={{fontSize: "3rem", marginBottom: "1rem"}}>📈</div>
              <p>Real-time performance charts would appear here</p>
              <p style={{fontSize: "0.9rem"}}>Connecting to data sources...</p>
            </div>
          </div>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem"}}>
            <div style={{padding: "1rem", background: "#f3e5f5", borderRadius: "8px"}}>
              <p style={{margin: "0 0 0.5rem 0", fontSize: "0.9rem"}}>Peak Usage Time</p>
              <p style={{margin: 0, fontWeight: "bold", color: "#7b1fa2"}}>14:00 - 16:00</p>
            </div>
            <div style={{padding: "1rem", background: "#e8f5e9", borderRadius: "8px"}}>
              <p style={{margin: "0 0 0.5rem 0", fontSize: "0.9rem"}}>Optimal Efficiency</p>
              <p style={{margin: 0, fontWeight: "bold", color: "#2e7d32"}}>94.2%</p>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="card">
          <h3 style={{marginBottom: "1.5rem", color: "#1a237e"}}>System Alerts</h3>
          <div style={{maxHeight: "300px", overflowY: "auto"}}>
            {systemAlerts.map(alert => (
              <div key={alert.id} style={{
                padding: "1rem",
                marginBottom: "0.8rem",
                background: alert.type === 'error' ? "#ffebee" :
                          alert.type === 'warning' ? "#fff3e0" :
                          alert.type === 'success' ? "#e8f5e9" : "#e3f2fd",
                borderRadius: "8px",
                borderLeft: `4px solid ${
                  alert.type === 'error' ? "#f44336" :
                  alert.type === 'warning' ? "#ff9800" :
                  alert.type === 'success' ? "#4caf50" : "#2196f3"
                }`
              }}>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.3rem"}}>
                  <strong>{alert.message}</strong>
                  <span style={{
                    background: alert.type === 'error' ? "#f44336" :
                              alert.type === 'warning' ? "#ff9800" :
                              alert.type === 'success' ? "#4caf50" : "#2196f3",
                    color: "white",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontSize: "0.7rem",
                    fontWeight: "bold"
                  }}>
                    {alert.type.toUpperCase()}
                  </span>
                </div>
                <p style={{margin: 0, color: "#666", fontSize: "0.8rem"}}>{alert.time}</p>
              </div>
            ))}
          </div>
          <button style={{
            width: "100%",
            padding: "0.8rem",
            marginTop: "1rem",
            background: "#f5f5f5",
            color: "#333",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}>
            View All Alerts
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
          <h3 style={{margin: 0, color: "#1a237e"}}>Recent Projects</h3>
          <button style={{
            padding: "0.6rem 1.2rem",
            background: "#3d5afe",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}>
            New Project +
          </button>
        </div>
        
        <div style={{overflowX: "auto"}}>
          <table style={{width: "100%", borderCollapse: "collapse"}}>
            <thead>
              <tr style={{background: "#f5f5f5"}}>
                <th style={{padding: "1rem", textAlign: "left"}}>Order ID</th>
                <th style={{padding: "1rem", textAlign: "left"}}>Project</th>
                <th style={{padding: "1rem", textAlign: "left"}}>Status</th>
                <th style={{padding: "1rem", textAlign: "left"}}>Amount</th>
                <th style={{padding: "1rem", textAlign: "left"}}>Date</th>
                <th style={{padding: "1rem", textAlign: "left"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} style={{borderBottom: "1px solid #f0f0f0"}}>
                  <td style={{padding: "1rem"}}>
                    <strong style={{color: "#3d5afe"}}>{order.id}</strong>
                  </td>
                  <td style={{padding: "1rem"}}>{order.project}</td>
                  <td style={{padding: "1rem"}}>
                    <span style={{
                      padding: "0.3rem 0.8rem",
                      borderRadius: "15px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      background: order.status === 'Completed' ? "#e8f5e9" :
                                 order.status === 'In Progress' ? "#fff3e0" : "#ffebee",
                      color: order.status === 'Completed' ? "#2e7d32" :
                             order.status === 'In Progress' ? "#ff9800" : "#f44336"
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{padding: "1rem", fontWeight: "bold"}}>{order.amount}</td>
                  <td style={{padding: "1rem", color: "#666"}}>{order.date}</td>
                  <td style={{padding: "1rem"}}>
                    <button style={{
                      padding: "0.4rem 0.8rem",
                      background: "#e3f2fd",
                      color: "#1976d2",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.9rem"
                    }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid" style={{marginTop: "2rem"}}>
        {[
          { icon: "📊", title: "Generate Report", desc: "Create system performance report" },
          { icon: "🔧", title: "System Settings", desc: "Configure dashboard preferences" },
          { icon: "📧", title: "Send Updates", desc: "Notify stakeholders" },
          { icon: "📈", title: "Export Data", desc: "Download analytics data" }
        ].map((action, idx) => (
          <div key={idx} className="card" style={{textAlign: "center", cursor: "pointer"}}
               onClick={() => alert(`Opening ${action.title}`)}>
            <div style={{fontSize: "2.5rem", marginBottom: "0.5rem"}}>{action.icon}</div>
            <h4 style={{marginBottom: "0.5rem"}}>{action.title}</h4>
            <p style={{color: "#666", fontSize: "0.9rem"}}>{action.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}