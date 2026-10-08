import { useEffect, useState } from 'react';
import { formatMoney } from '../components/AppLayout';

export default function ArchivePage() {
  const [months, setMonths] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/archive', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setMonths(data))
      .catch(() => setMonths([]));
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Saved data</p>
          <h2>Monthly archive</h2>
        </div>
      </header>

      <div className="archive-list">
        {months.length ? (
          months.map((month) => (
            <div className="archive-card" key={month.id}>
              <div>
                <p className="eyebrow">Month</p>
                <h3>{month.month}</h3>
              </div>
              <div className="archive-stats">
                <span>{month.reservations} reservations</span>
                <strong>{formatMoney(month.revenue)}</strong>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No saved months yet. Save a dashboard view from the main dashboard.</div>
        )}
      </div>
    </div>
  );
}
