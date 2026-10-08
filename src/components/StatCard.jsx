import { useEffect, useState } from 'react';
import Papa from 'papaparse';

const defaultRates = {
  USD: 17900,
  GBP: 23700,
  EUR: 21500,
  AUD: 12300,
  SGD: 13300,
};

const sampleRows = [
  {
    guest: 'Sarah Mitchell',
    unit: 'Villa Sunset Canggu',
    checkIn: '2026-11-10',
    checkOut: '2026-11-14',
    nights: 4,
    net: 18400000,
    currency: 'IDR',
    booked: '2026-10-08',
    status: 'Accepted',
  },
  {
    guest: 'James Carter',
    unit: 'Apartment Seminyak 2BR',
    checkIn: '2026-10-20',
    checkOut: '2026-10-23',
    nights: 3,
    net: 310,
    currency: 'GBP',
    booked: '2026-10-08',
    status: 'Accepted',
  },
  {
    guest: 'Hans Müller',
    unit: 'Villa Ubud Rice Field',
    checkIn: '2026-12-01',
    checkOut: '2026-12-08',
    nights: 7,
    net: 1750,
    currency: 'USD',
    booked: '2026-10-07',
    status: 'Accepted',
  },
];

export function formatMoney(value, currency = 'IDR') {
  const safeValue = Number(value || 0);
  const formatted = safeValue.toLocaleString('en-US', {
    maximumFractionDigits: currency === 'IDR' ? 0 : 2,
  });

  return `${currency} ${formatted}`;
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getUnitType(unit = '', keywords = ['apartment', 'apt', 'studio', 'condo', 'suite']) {
  const lower = (unit || '').toLowerCase();
  const isApartment = keywords.some((kw) => lower.includes(kw));

  if (isApartment) return 'Apartment';
  if (lower.includes('villa')) return 'Villa';
  return 'Other';
}

export function parseCsvRows(text) {
  const results = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (results.errors?.length) {
    throw new Error(results.errors[0]?.message || 'Unable to parse file');
  }

  return results.data;
}

export function useSavedRates() {
  const [rates, setRates] = useState(() => {
    const stored = localStorage.getItem('dashboard-rates');
    return stored ? JSON.parse(stored) : defaultRates;
  });

  useEffect(() => {
    localStorage.setItem('dashboard-rates', JSON.stringify(rates));
  }, [rates]);

  return [rates, setRates];
}

export function useReservationData() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reservations', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Unable to load reservations');
      }

      const data = await response.json();
      setReservations(data);
    } catch (error) {
      setReservations(sampleRows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { reservations, loading, refresh: fetchData };
}

export function groupByMonth(rows, key = 'checkIn') {
  return rows.reduce((acc, reservation) => {
    const date = reservation[key]?.slice(0, 7) || 'unknown';
    acc[date] = acc[date] || [];
    acc[date].push(reservation);
    return acc;
  }, {});
}
