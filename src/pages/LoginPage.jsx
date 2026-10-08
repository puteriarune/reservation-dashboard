import { formatDate, formatMoney, getUnitType } from './StatCard';

export default function ReservationTable({ rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Guest</th>
            <th>Unit</th>
            <th>Type</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Stay</th>
            <th>Currency</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.guest}-${row.checkIn}-${index}`}>
              <td>{row.guest || 'Unknown guest'}</td>
              <td>{row.unit || 'Unknown unit'}</td>
              <td>{getUnitType(row.unit)}</td>
              <td>{formatDate(row.checkIn)}</td>
              <td>{formatDate(row.checkOut)}</td>
              <td>{row.nights || 0} nights</td>
              <td>{row.currency || 'IDR'}</td>
              <td>{formatMoney(row.net, row.currency || 'IDR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
