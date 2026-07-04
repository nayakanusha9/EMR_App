export default function About() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>About</h2>
          <p>EMR System</p>
        </div>
      </div>
      <div className="card">
        <p style={{ marginBottom: '1rem' }}>
          EMR System is an Electronic Medical Records application for managing patient data,
          appointments, and clinical workflows.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Version 1.0.0</p>
      </div>
    </div>
  );
}
