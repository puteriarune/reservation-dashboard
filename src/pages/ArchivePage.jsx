import { useMemo } from 'react';
import { formatMoney, getUnitType, useReservationData } from '../components/AppLayout';

export default function ReportsPage() {
  const { reservations } = useReservationData();

  const groupedByType = useMemo(() => {
    const map = {};
    reservations.forEach((row) => {
      const type = getUnitType(row.unit);
      map[type] = (map[type] || 0) + Number(row.net || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reservations]);

  const groupedByCurrency = useMemo(() => {
    const map = {};
    reservations.forEach((row) => {
      const currency = row.currency || 'IDR';
      map[currency] = (map[currency] || 0) + Number(row.net || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reservations]);

  const maxTypeValue = groupedByType[0]?.[1] || 1;
  const maxCurrencyValue = groupedByCurrency[0]?.[1] || 1;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Insights</p>
          <h2>Revenue reports</h2>
        </div>
      </header>

      <div className="report-grid">
        <section className="card">
          <h3>By property type</h3>
          <div className="bars">
            {groupedByType.map(([type, value]) => (
              <div key={type} className="bar-row">
                <div className="bar-meta">
                  <span>{type}</span>
                  <strong>{formatMoney(value)}</strong>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(value / maxTypeValue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3>By currency</h3>
          <div className="bars">
            {groupedByCurrency.map(([currency, value]) => (
              <div key={currency} className="bar-row">
                <div className="bar-meta">
                  <span>{currency}</span>
                  <strong>{formatMoney(value, currency)}</strong>
                </div>
                <div className="bar-track">
                  <div className="bar-fill secondary" style={{ width: `${(value / maxCurrencyValue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
