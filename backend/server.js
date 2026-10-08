import { useEffect, useState } from 'react';

const defaultRates = {
  USD: 17900,
  GBP: 23700,
  EUR: 21500,
  AUD: 12300,
  SGD: 13300,
};

export default function SettingsPage() {
  const [rates, setRates] = useState(defaultRates);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-rates');
    if (saved) setRates(JSON.parse(saved));
  }, []);

  const updateRate = (currency, value) => {
    setRates((current) => {
      const next = { ...current, [currency]: Number(value) || 0 };
      localStorage.setItem('dashboard-rates', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Preferences</p>
          <h2>Exchange rates</h2>
        </div>
      </header>

      <section className="card settings-card">
        <div className="rate-grid">
          {Object.entries(rates).map(([currency, value]) => (
            <label key={currency} className="rate-field">
              <span>1 {currency} = IDR</span>
              <input
                type="number"
                value={value}
                min="0"
                step="any"
                onChange={(e) => updateRate(currency, e.target.value)}
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
