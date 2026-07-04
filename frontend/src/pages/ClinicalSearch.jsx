import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { patientsAPI } from '../services/api';
import PatientCard from '../components/PatientCard';
import {
  filterPatientsByKeyword,
  filterPatientsByDateRange,
} from '../utils/patientForm';

export default function ClinicalSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [keyword2, setKeyword2] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allPatients, setAllPatients] = useState([]);

  useEffect(() => {
    patientsAPI.list({ limit: 100 }).then((res) => setAllPatients(res.data.patients));
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && allPatients.length > 0) {
      setKeyword(q);
      runSearch(q, '', '', '');
    }
  }, [searchParams, allPatients]);

  const runSearch = (kw1, kw2, start, end) => {
    setLoading(true);
    let filtered = [...allPatients];

    if (kw1.trim()) filtered = filterPatientsByKeyword(filtered, kw1);
    if (kw2.trim()) filtered = filterPatientsByKeyword(filtered, kw2);
    if (start || end) filtered = filterPatientsByDateRange(filtered, start, end);

    setResults(filtered);
    setSearched(true);
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(keyword, keyword2, startDate, endDate);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Clinical Search</h2>
          <p>Search patients by keyword and date range</p>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Search Keywords</h3>
        <form onSubmit={handleSearch}>
          <div className="form-grid">
            <div className="form-group">
              <label>1st Keyword</label>
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Name, diagnosis, AMAX ID..." />
            </div>
            <div className="form-group">
              <label>2nd Keyword</label>
              <input value={keyword2} onChange={(e) => setKeyword2(e.target.value)} placeholder="Optional second keyword" />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <SearchIcon size={18} /> {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {searched && (
        <div className="card" style={{ marginTop: '1.25rem' }}>
          <div className="section-header">
            <h3 className="card-title" style={{ marginBottom: 0 }}>Search Output</h3>
            <span className="section-count">{results.length}</span>
          </div>
          {results.length === 0 ? (
            <div className="section-empty">No patients match your search.</div>
          ) : (
            <div className="patient-card-list">
              {results.map((p) => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  compact
                  onClick={() => navigate(`/patients/${p.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
