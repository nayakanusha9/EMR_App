import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { patientsAPI } from '../services/api';
import { extractTime, displayValue } from '../utils/patientForm';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientsAPI.list({ limit: 100, sort_by: 'date', sort_order: 'desc' })
      .then((res) => setPatients(res.data.patients))
      .finally(() => setLoading(false));
  }, []);

  const patientsByDate = useMemo(() => {
    const map = {};
    for (const p of patients) {
      const d = String(p.date).slice(0, 10);
      if (!map[d]) map[d] = [];
      map[d].push(p);
      if (p.follow_up_1) {
        const fu1 = String(p.follow_up_1).slice(0, 10);
        if (!map[fu1]) map[fu1] = [];
        if (!map[fu1].find((x) => x.id === p.id)) map[fu1].push(p);
      }
      if (p.follow_up_2) {
        const fu2 = String(p.follow_up_2).slice(0, 10);
        if (!map[fu2]) map[fu2] = [];
        if (!map[fu2].find((x) => x.id === p.id)) map[fu2].push(p);
      }
    }
    return map;
  }, [patients]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const selectedAppointments = patientsByDate[selectedDate] || [];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Calendar</h2>
          <p>View appointments by date</p>
        </div>
      </div>

      <div className="card calendar-card">
        <div className="calendar-nav">
          <button type="button" className="btn btn-secondary btn-sm" onClick={prevMonth}>
            <ChevronLeft size={16} />
          </button>
          <h3>{MONTHS[month]} {year}</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={nextMonth}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="calendar-grid">
          {WEEKDAYS.map((d) => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="calendar-day empty" />;
            const iso = toISO(year, month, day);
            const hasEvents = patientsByDate[iso]?.length > 0;
            const isSelected = iso === selectedDate;
            const isToday = iso === today.toISOString().slice(0, 10);
            return (
              <button
                key={iso}
                type="button"
                className={`calendar-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}${hasEvents ? ' has-events' : ''}`}
                onClick={() => setSelectedDate(iso)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <section className="card" style={{ marginTop: '1.25rem' }}>
        <div className="section-header">
          <h3 className="card-title" style={{ marginBottom: 0 }}>
            Appointments — {selectedDate}
          </h3>
          <span className="section-count">{selectedAppointments.length}</span>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : selectedAppointments.length === 0 ? (
          <div className="section-empty">No appointments for this date.</div>
        ) : (
          <div className="schedule-list">
            {selectedAppointments.map((p) => (
              <button
                key={p.id}
                type="button"
                className="schedule-item"
                onClick={() => navigate(`/patients/${p.id}`)}
              >
                <div className="schedule-item-main">
                  <div className="schedule-item-name">{p.name}</div>
                  <div className="schedule-item-meta">
                    <span>{p.amax_id}</span>
                    <span>{extractTime(p.follow_up_1)}</span>
                    <span>{displayValue(p.status)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
