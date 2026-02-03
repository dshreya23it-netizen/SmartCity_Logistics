import axios from "axios";
import { useEffect, useState } from "react";

const sensorTypes = {
  'Temperature': '#FF6B6B',
  'Traffic': '#4ECDC4',
  'Air Quality': '#45B7D1',
  'Water': '#96CEB4',
  'Energy': '#FFEAA7',
  'Security': '#DDA0DD',
  'Agriculture': '#98D8C8'
};

export default function Sensors() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get("http://localhost:5000/api/sensors")
      .then(res => {
        // Add mock data for demo
        const mockSensors = [
          { _id: '1', sensorId: 'TEMP_001', location: 'Central District', type: 'Temperature', status: 'Active', value: '28°C', battery: '85%' },
          { _id: '2', sensorId: 'TRF_045', location: 'Main Intersection', type: 'Traffic', status: 'Active', value: '1200 vehicles/hr', battery: '92%' },
          { _id: '3', sensorId: 'AQ_101', location: 'Industrial Zone', type: 'Air Quality', status: 'Warning', value: 'AQI: 145', battery: '65%' },
          { _id: '4', sensorId: 'WTR_023', location: 'Reservoir', type: 'Water', status: 'Active', value: 'pH: 7.2', battery: '88%' },
          { _id: '5', sensorId: 'NRG_056', location: 'Solar Farm', type: 'Energy', status: 'Active', value: '2.4 MW', battery: '95%' },
          { _id: '6', sensorId: 'SEC_089', location: 'City Center', type: 'Security', status: 'Inactive', value: 'Offline', battery: '15%' },
          { _id: '7', sensorId: 'AGR_034', location: 'Urban Farm', type: 'Agriculture', status: 'Active', value: 'Soil: 65%', battery: '78%' },
        ];
        setSensors([...mockSensors, ...res.data]);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to mock data
        setSensors([
          { _id: '1', sensorId: 'TEMP_001', location: 'Central District', type: 'Temperature', status: 'Active', value: '28°C', battery: '85%' },
          { _id: '2', sensorId: 'TRF_045', location: 'Main Intersection', type: 'Traffic', status: 'Active', value: '1200 vehicles/hr', battery: '92%' },
          { _id: '3', sensorId: 'AQ_101', location: 'Industrial Zone', type: 'Air Quality', status: 'Warning', value: 'AQI: 145', battery: '65%' },
          { _id: '4', sensorId: 'WTR_023', location: 'Reservoir', type: 'Water', status: 'Active', value: 'pH: 7.2', battery: '88%' },
        ]);
        setLoading(false);
      });
  }, []);

  const filteredSensors = filter === 'all' 
    ? sensors 
    : sensors.filter(s => s.type === filter);

  return (
    <div className="page">
      <h1 style={{marginBottom: "1rem", color: "#1a237e"}}>📡 Live Sensor Dashboard</h1>
      <p style={{marginBottom: "2rem", color: "#666"}}>
        Real-time monitoring of IoT sensors across the city infrastructure
      </p>

      {/* Filter Buttons */}
      <div style={{display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap"}}>
        <button 
          onClick={() => setFilter('all')}
          style={{
            padding: "0.7rem 1.5rem",
            background: filter === 'all' ? '#3d5afe' : '#f0f0f0',
            color: filter === 'all' ? 'white' : '#333',
            border: "none",
            borderRadius: "25px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          All Sensors ({sensors.length})
        </button>
        {Object.keys(sensorTypes).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: "0.7rem 1.5rem",
              background: filter === type ? sensorTypes[type] : '#f0f0f0',
              color: filter === type ? 'white' : '#333',
              border: "none",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid" style={{marginBottom: "2rem"}}>
        <div className="card">
          <h3>🟢 Active Sensors</h3>
          <p style={{fontSize: "2.5rem", color: "#00e676", fontWeight: "bold"}}>
            {sensors.filter(s => s.status === 'Active').length}
          </p>
        </div>
        <div className="card">
          <h3>🟡 Warning</h3>
          <p style={{fontSize: "2.5rem", color: "#ff9800", fontWeight: "bold"}}>
            {sensors.filter(s => s.status === 'Warning').length}
          </p>
        </div>
        <div className="card">
          <h3>🔴 Inactive</h3>
          <p style={{fontSize: "2.5rem", color: "#ff5252", fontWeight: "bold"}}>
            {sensors.filter(s => s.status === 'Inactive').length}
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: "center", padding: "3rem"}}>
          <div style={{fontSize: "3rem"}}>⏳</div>
          <h3>Loading sensor data...</h3>
        </div>
      ) : (
        <div className="grid">
          {filteredSensors.map(sensor => (
            <div key={sensor._id} className="card">
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem"
              }}>
                <h3 style={{color: sensorTypes[sensor.type] || "#3d5afe"}}>
                  {sensor.sensorId}
                </h3>
                <span style={{
                  background: sensor.status === 'Active' ? '#00e676' : 
                             sensor.status === 'Warning' ? '#ff9800' : '#ff5252',
                  color: 'white',
                  padding: "0.3rem 0.8rem",
                  borderRadius: "15px",
                  fontSize: "0.9rem",
                  fontWeight: "bold"
                }}>
                  {sensor.status}
                </span>
              </div>
              
              <div style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1rem",
                padding: "0.8rem",
                background: "#f8f9fa",
                borderRadius: "8px"
              }}>
                <span style={{
                  background: sensorTypes[sensor.type] || "#3d5afe",
                  color: "white",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  marginRight: "1rem",
                  fontSize: "1.2rem"
                }}>
                  {sensor.type === 'Temperature' ? '🌡️' :
                   sensor.type === 'Traffic' ? '🚗' :
                   sensor.type === 'Air Quality' ? '🌫️' :
                   sensor.type === 'Water' ? '💧' :
                   sensor.type === 'Energy' ? '⚡' :
                   sensor.type === 'Security' ? '🔒' : '🌱'}
                </span>
                <div>
                  <p style={{fontWeight: "bold", margin: 0}}>{sensor.type} Sensor</p>
                  <p style={{color: "#666", margin: 0, fontSize: "0.9rem"}}>{sensor.location}</p>
                </div>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid #eee"
              }}>
                <div>
                  <p style={{color: "#666", fontSize: "0.9rem"}}>Current Value</p>
                  <p style={{fontWeight: "bold", fontSize: "1.2rem"}}>{sensor.value}</p>
                </div>
                <div>
                  <p style={{color: "#666", fontSize: "0.9rem"}}>Battery</p>
                  <p style={{
                    fontWeight: "bold",
                    color: parseInt(sensor.battery) > 20 ? "#00e676" : "#ff5252"
                  }}>
                    {sensor.battery}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}