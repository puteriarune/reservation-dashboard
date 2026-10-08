import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import StatCard from '../components/StatCard';
import ReservationTable from '../components/ReservationTable';
import { formatMoney, formatDate, getUnitType, useReservationData } from '../components/AppLayout';

export default function DashboardPage() {
  const { reservations, loading, refresh } = useReservationData();
  const [month, setMonth] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');

  const filteredRows = useMemo(() => {
    return reservations.filter((row) => {
      const monthMatch = month === 'all' || (row.checkIn || '').slice(0, 7) === month;
      const typeMatch = type === 'all' || getUnitType(row.unit) === type;
      const currencyMatch = currency === 'all' || (row.currency || 'IDR') === currency;
      const query = search.toLowerCase();
      const searchMatch = !query || `${row.guest} ${row.unit}`.toLowerCase().includes(query);

      return monthMatch && typeMatch && currencyMatch && searchMatch;
    });
  }, [month, currency, search, type, reservations]);

  const months = useMemo(
    () => [...new Set((reservations || []).map((row) => (row.checkIn || '').slice(0, 7)).filter(Boolean))].sort().reverse(),
    [reservations]
  );

  const totalRevenue = filteredRows.reduce((sum, row) => sum + Number(row.net || 0), 0);
  const totalNights = filteredRows.reduce((sum, row) => sum + Number(row.nights || 0), 0);
  const avgAdr = totalNights ? totalRevenue / totalNights : 0;

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true }).data;

    if (!parsed.length) {
      alert('The CSV appears to be empty.');
      return;
    }

    const normalized = parsed.map((row) => ({
      guest: row['Guest Name'] || row['Guest'] || row['guest'] || 'Unknown guest',
      unit: row['Listing'] || row['Unit'] || row['unit'] || row['Property'] || 'Unknown unit',
      checkIn: row['Check-in'] || row['checkIn'] || row['Check in'] || '',
      checkOut: row['Check-out'] || row['checkOut'] || row['Check out'] || '',
      nights: Number(row['Nights'] || row['nights'] || 0),
      net: Number((row['Net Revenue'] || row['Net'] || row['net'] || '0').toString().replace(/[^0-9.-]/g, '')),
      currency: row['Currency'] || row['currency'] || 'IDR',
      booked: row['Booked On'] || row['Booked'] || row['booking date'] || '',
      status: row['Status'] || row['status'] || 'Accepted',
    }));

    const token = localStorage.getItem('token');
    const response = await fetch('/api/reservations/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ reservations: normalized }),
    });

    if (!response.ok) {
      alert('Could not import the uploaded file.');
      return;
    }

    await refresh();
    event.target.value = '';
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h2>Reservation breakdown dashboard</h2>
        </div>
        <label className="upload-box">
          <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} />
          <span>Import CSV</span>
        </label>
      </header>

      <section className="filters-panel">
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="all">All months</option>
          {months.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          <option value="Villa">Villa</option>
          <option value="Apartment">Apartment</option>
          <option value="Other">Other</option>
        </select>

        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="all">All currencies</option>
          {['IDR', 'USD', 'GBP', 'EUR', 'AUD', 'SGD'].map((curr) => (
            <option key={curr} value={curr}>
              {curr}
            </option>
          ))}
        </select>

        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guest or unit" />
      </section>

      <section className="stats-grid">
        <StatCard label="Reservations" value={filteredRows.length} tone="primary" />
        <StatCard label="Total nights" value={totalNights} />
        <StatCard label="Net revenue" value={formatMoney(totalRevenue)} />
        <StatCard label="ADR" value={formatMoney(avgAdr)} />
      </section>

      {loading ? (
        <div className="empty-state">Loading reservations…</div>
      ) : filteredRows.length ? (
        <ReservationTable rows={filteredRows} />
      ) : (
        <div className="empty-state">No reservations match your filters.</div>
      )}
    </div>
  );
}
