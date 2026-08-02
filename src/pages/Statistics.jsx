import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Line } from 'recharts';
import { Car, TrendingUp, TrendingDown } from 'lucide-react';
import '../index.css';

const COLORS = ['#007aff', '#ff3b30', '#34c759', '#ff9500', '#af52de', '#5856d6'];

const FUEL_COLORS = {
  'Benzin': '#ef4444', 
  'Dizel': '#22c55e', 
  'Elektrik': '#3b82f6', 
  'Hybrid': '#06b6d4', 
  'Plug-in Hybrid': '#10b981', 
  'Mild Hybrid': '#8b5cf6', 
  'Dizel Hybrid': '#6366f1',
  'Benzin + LPG': '#f59e0b', 
  'CNG': '#ea580c',
  'Benzin/Dizel': '#ef4444',
  'Bilinmiyor': '#9ca3af'
};

const FuelBadge = ({ fuel }) => {
  const color = FUEL_COLORS[fuel] || FUEL_COLORS['Bilinmiyor'];
  return (
    <span style={{ background: color, color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
      {fuel}
    </span>
  );
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price);
};

function Statistics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  const tabs = ['Genel Bakış', 'Markalar', 'Sıralamalar', 'Yakıt Analizi', 'Güç Aktarımı', 'EV Analizi', '% ÖTV Analizi', 'Model Yılı'];
  const [activeTabMenu, setActiveTabMenu] = useState('Genel Bakış');

  useEffect(() => {
    fetch('https://api.otofiyatlist.com/api/v1/latest')
      .then(res => res.json())
      .then(data => {
        let allVehicles = [];
        Object.keys(data.brands).forEach(brandKey => {
          allVehicles = [...allVehicles, ...data.brands[brandKey].vehicles];
        });

        const validVehicles = allVehicles.filter(v => v.priceNumeric > 0);
        const total = validVehicles.length;
        const brandCount = Object.keys(data.brands).length;
        
        const prices = validVehicles.map(v => v.priceNumeric).sort((a, b) => a - b);
        let avg = 0, median = 0, min = 0, max = 0;
        if (prices.length > 0) {
          avg = prices.reduce((acc, val) => acc + val, 0) / prices.length;
          median = prices[Math.floor(prices.length / 2)];
          min = prices[0];
          max = prices[prices.length - 1];
        }

        const priceRanges = [
          { name: '0-1M', min: 0, max: 1000000, count: 0 }, { name: '1-1.5M', min: 1000001, max: 1500000, count: 0 },
          { name: '1.5-2M', min: 1500001, max: 2000000, count: 0 }, { name: '2-2.5M', min: 2000001, max: 2500000, count: 0 },
          { name: '2.5-3M', min: 2500001, max: 3000000, count: 0 }, { name: '3-4M', min: 3000001, max: 4000000, count: 0 },
          { name: '4-5M', min: 4000001, max: 5000000, count: 0 }, { name: '5-7M', min: 5000001, max: 7000000, count: 0 },
          { name: '7-10M', min: 7000001, max: 10000000, count: 0 }, { name: '10M+', min: 10000001, max: Infinity, count: 0 }
        ];

        const segments = { 'Bütçe Dostu': 0, 'Orta Segment': 0, 'Premium': 0, 'Lüks': 0 };
        const fuelData = {};
        const transData = {};
        const brandFuelMap = {};
        const fuelTypesSet = new Set();
        const fuelPriceMap = {};
        const transPriceMap = {};
        
        let elecHybridCount = 0;
        const powertrainMap = { 'Elektrikli': {sum:0, count:0}, 'Plug-in Hybrid': {sum:0, count:0}, 'Mild Hybrid': {sum:0, count:0}, 'Hybrid': {sum:0, count:0}, 'Benzin/Dizel': {sum:0, count:0} };
        const drivetrainMap = { 'Önden Çekiş (FWD)': {sum:0, count:0}, '4x4 (AWD)': {sum:0, count:0}, 'Arkadan Çekiş (RWD)': {sum:0, count:0} };
        const powerMap = { '0-100 HP': 0, '100-150 HP': 0, '150-200 HP': 0, '200-300 HP': 0, '300-500 HP': 0, '500+ HP': 0 };
        let totalHp = 0, hpCount = 0;
        const hpPriceArr = [];
        const evs = [];

        // Yeni Analiz Verileri: ÖTV & Model Yılı
        const otvDataMap = {};
        const brandOtvMap = {};
        let otvCount = 0;
        let totalOtv = 0;

        const yearDataMap = {};
        let yearCount = 0;

        validVehicles.forEach(v => {
          const p = v.priceNumeric;
          
          priceRanges.forEach(range => {
            if (p >= range.min && p <= range.max) range.count++;
          });
          if (p < 1500000) segments['Bütçe Dostu']++;
          else if (p < 3000000) segments['Orta Segment']++;
          else if (p < 5000000) segments['Premium']++;
          else segments['Lüks']++;
          
          const f = v.fuel || 'Bilinmiyor';
          fuelData[f] = (fuelData[f] || 0) + 1;
          
          const t = v.transmission || 'Bilinmiyor';
          transData[t] = (transData[t] || 0) + 1;

          if (v.brand && f) {
            if (!brandFuelMap[v.brand]) brandFuelMap[v.brand] = { name: v.brand };
            brandFuelMap[v.brand][f] = (brandFuelMap[v.brand][f] || 0) + 1;
            fuelTypesSet.add(f);
          }

          if (!fuelPriceMap[f]) fuelPriceMap[f] = { sum: 0, count: 0 };
          fuelPriceMap[f].sum += p;
          fuelPriceMap[f].count++;

          if (!transPriceMap[t]) transPriceMap[t] = { sum: 0, count: 0 };
          transPriceMap[t].sum += p;
          transPriceMap[t].count++;
          
          let pwType = 'Benzin/Dizel';
          if (f === 'Elektrik') {
            pwType = 'Elektrikli';
            elecHybridCount++;
            const mockRange = v.powerHP ? Math.min(600, Math.max(300, v.powerHP * 1.5)) : 400; 
            evs.push({ ...v, mockRange });
          } else if (f.includes('Plug-in')) {
            pwType = 'Plug-in Hybrid';
            elecHybridCount++;
          } else if (f.includes('Mild')) {
            pwType = 'Mild Hybrid';
            elecHybridCount++;
          } else if (f.includes('Hybrid')) {
            pwType = 'Hybrid';
            elecHybridCount++;
          }
          powertrainMap[pwType].sum += p;
          powertrainMap[pwType].count++;

          let dtType = 'Önden Çekiş (FWD)';
          const searchStr = `${v.model} ${v.trim} ${v.engine}`.toUpperCase();
          if (searchStr.includes('AWD') || searchStr.includes('4X4') || searchStr.includes('4MATIC') || searchStr.includes('XDRIVE') || searchStr.includes('ALL4')) {
            dtType = '4x4 (AWD)';
          } else if (searchStr.includes('RWD') || searchStr.includes('ARKADAN')) {
            dtType = 'Arkadan Çekiş (RWD)';
          }
          drivetrainMap[dtType].sum += p;
          drivetrainMap[dtType].count++;

          if (v.powerHP > 0) {
            totalHp += v.powerHP;
            hpCount++;
            const hp = v.powerHP;
            if (hp <= 100) powerMap['0-100 HP']++;
            else if (hp <= 150) powerMap['100-150 HP']++;
            else if (hp <= 200) powerMap['150-200 HP']++;
            else if (hp <= 300) powerMap['200-300 HP']++;
            else if (hp <= 500) powerMap['300-500 HP']++;
            else powerMap['500+ HP']++;
            
            hpPriceArr.push({ brand: v.brand, model: v.model, hp: hp, price: p, tlPerHp: p / hp });
          }

          // ÖTV Analizi
          if (v.otvRate !== undefined && v.otvRate !== null) {
            otvCount++;
            totalOtv += v.otvRate;
            
            const rateStr = `%${v.otvRate}`;
            if (!otvDataMap[rateStr]) otvDataMap[rateStr] = { rate: v.otvRate, name: rateStr, count: 0, sum: 0 };
            otvDataMap[rateStr].count++;
            otvDataMap[rateStr].sum += p;
            
            if (v.brand) {
               if (!brandOtvMap[v.brand]) brandOtvMap[v.brand] = { name: v.brand, sum: 0, count: 0 };
               brandOtvMap[v.brand].sum += v.otvRate;
               brandOtvMap[v.brand].count++;
            }
          }
          
          // Model Yılı Analizi
          if (v.modelYear) {
            yearCount++;
            const yStr = v.modelYear.toString();
            if (!yearDataMap[yStr]) yearDataMap[yStr] = { name: yStr, count: 0, sum: 0 };
            yearDataMap[yStr].count++;
            yearDataMap[yStr].sum += p;
          }
        });

        const fuelChart = Object.keys(fuelData).map(k => ({ name: k, value: fuelData[k] }));
        const transChart = Object.keys(transData).map(k => ({ name: k, value: transData[k] }));
        const brandFuelData = Object.values(brandFuelMap).sort((a, b) => a.name.localeCompare(b.name));
        const fuelTypes = Array.from(fuelTypesSet);
        const fuelAvgPrices = Object.keys(fuelPriceMap).map(k => ({ name: k, avg: Math.round(fuelPriceMap[k].sum / fuelPriceMap[k].count) })).sort((a, b) => b.avg - a.avg);
        const transAvgPrices = Object.keys(transPriceMap).map(k => ({ name: k, avg: Math.round(transPriceMap[k].sum / transPriceMap[k].count) })).sort((a, b) => b.avg - a.avg);
        
        const sortedByPrice = [...validVehicles].sort((a, b) => a.priceNumeric - b.priceNumeric);
        const cheapest10 = sortedByPrice.slice(0, 10);
        const mostExpensive10 = sortedByPrice.slice(-10).reverse();

        const powertrainChart = Object.keys(powertrainMap).filter(k => powertrainMap[k].count > 0).map(k => ({ name: k, value: powertrainMap[k].count }));
        const powertrainAvgPrices = Object.keys(powertrainMap).filter(k => powertrainMap[k].count > 0).map(k => ({ name: k, avg: Math.round(powertrainMap[k].sum / powertrainMap[k].count) }));
        const drivetrainChart = Object.keys(drivetrainMap).filter(k => drivetrainMap[k].count > 0).map(k => ({ name: k, value: drivetrainMap[k].count }));
        const drivetrainAvgPrices = Object.keys(drivetrainMap).filter(k => drivetrainMap[k].count > 0).map(k => ({ name: k, avg: Math.round(drivetrainMap[k].sum / drivetrainMap[k].count) }));
        const powerSegmentsChart = Object.keys(powerMap).map(k => ({ name: k, count: powerMap[k] }));
        
        hpPriceArr.sort((a, b) => a.tlPerHp - b.tlPerHp);
        const bestHpValues = hpPriceArr.slice(0, 10);
        
        const evsWithRange = evs.map(e => ({ ...e, tlPerKm: e.priceNumeric / e.mockRange }));
        evsWithRange.sort((a, b) => b.mockRange - a.mockRange);
        const longestRangeEVs = evsWithRange.slice(0, 10);
        
        evsWithRange.sort((a, b) => a.tlPerKm - b.tlPerKm);
        const bestValueEVs = evsWithRange.slice(0, 10);

        // ÖTV Grafikleri
        const otvChart = Object.values(otvDataMap).sort((a,b) => a.rate - b.rate).map(d => ({
          name: d.name, count: d.count, avgPrice: Math.round(d.sum / d.count)
        }));
        const brandOtvChart = Object.values(brandOtvMap).map(d => ({
          name: d.name, avgOtv: Number((d.sum / d.count).toFixed(1))
        })).sort((a,b) => b.avgOtv - a.avgOtv);
        
        // Model Yılı Grafikleri
        const yearChart = Object.values(yearDataMap).sort((a,b) => a.name.localeCompare(b.name)).map(d => ({
          name: d.name, count: d.count, avgPrice: Math.round(d.sum / d.count)
        }));

        setStats({
          total, brandCount, avg, median, min, max,
          priceRanges, segments, fuelChart, transChart,
          cheapest10, mostExpensive10, brandFuelData, fuelTypes, fuelAvgPrices, transAvgPrices,
          elecHybridCount, powertrainChart, powertrainAvgPrices, drivetrainChart, drivetrainAvgPrices,
          powerSegmentsChart, hpCount, avgHp: Math.round(totalHp / hpCount), bestHpValues,
          evCount: evs.length, 
          evAvgRange: evs.length > 0 ? Math.round(evs.reduce((sum, e) => sum + e.mockRange, 0) / evs.length) : 0,
          evAvgPrice: evs.length > 0 ? Math.round(evs.reduce((sum, e) => sum + e.priceNumeric, 0) / evs.length) : 0,
          longestRangeEVs, bestValueEVs,
          otvCount, avgOtv: otvCount > 0 ? (totalOtv / otvCount).toFixed(1) : 0, otvChart, brandOtvChart,
          yearCount, yearUnique: yearChart.length, yearChart
        });
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatNum = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  const copyLink = () => navigator.clipboard.writeText(window.location.href);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar activeTab="stats" copyLink={copyLink} />
      
      <main className="container" style={{ paddingTop: '90px', paddingBottom: '60px', flex: 1 }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '2rem', fontWeight: 'bold' }}>İstatistikler</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Fiyat analizleri ve segment karşılaştırmaları</p>

        <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '10px' }}>
          {tabs.map((tab, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveTabMenu(tab)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                fontSize: '0.9rem', fontWeight: activeTabMenu === tab ? 'bold' : 'normal',
                color: activeTabMenu === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                paddingBottom: '0.5rem', borderBottom: activeTabMenu === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Veriler Yükleniyor...</div>
        ) : stats ? (
          <>
            {/* GENEL BAKIŞ */}
            {activeTabMenu === 'Genel Bakış' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Toplam Araç</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      <Car size={24} /> {stats.total}
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Marka Sayısı</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {stats.brandCount}
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ortalama</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {formatNum(stats.avg)}
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Medyan</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {formatNum(stats.median)}
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Minimum</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.8rem', fontWeight: 'bold', color: '#00ffa3' }}>
                      <TrendingDown size={20} /> {formatNum(stats.min)}
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Maksimum</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.8rem', fontWeight: 'bold', color: '#ff4757' }}>
                      <TrendingUp size={20} /> {formatNum(stats.max)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Fiyat Dağılımı</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.priceRanges}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} itemStyle={{ color: '#007aff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                          <Bar dataKey="count" fill="#007aff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Segment Analizi</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {Object.keys(stats.segments).map((key, idx) => {
                        const val = stats.segments[key];
                        const percent = ((val / stats.total) * 100).toFixed(1);
                        return (
                          <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{val} ({percent}%)</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${percent}%`, height: '100%', background: COLORS[idx % COLORS.length], borderRadius: '3px' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Yakıt Dağılımı</h3>
                    <div style={{ height: '250px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.fuelChart} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                            {stats.fuelChart.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Şanzıman Dağılımı</h3>
                    <div style={{ height: '250px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.transChart} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                            {stats.transChart.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SIRALAMALAR */}
            {activeTabMenu === 'Sıralamalar' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#00ffa3', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingDown size={18} /> En Uygun 10 Araç
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 0.5rem' }}>#</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Marka</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Model</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Donanım</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Yakıt</th>
                          <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Fiyat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.cheapest10.map((v, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                            <td style={{ padding: '0.75rem 0.5rem' }}>{i + 1}</td>
                            <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{v.brand}</td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>{v.model}</td>
                            <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{v.trim}</td>
                            <td style={{ padding: '0.75rem 0.5rem' }}><FuelBadge fuel={v.fuel} /></td>
                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#00ffa3' }}>{formatPrice(v.priceNumeric)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#ff4757', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={18} /> En Pahalı 10 Araç
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 0.5rem' }}>#</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Marka</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Model</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Donanım</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Yakıt</th>
                          <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Fiyat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.mostExpensive10.map((v, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                            <td style={{ padding: '0.75rem 0.5rem' }}>{i + 1}</td>
                            <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{v.brand}</td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>{v.model}</td>
                            <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{v.trim}</td>
                            <td style={{ padding: '0.75rem 0.5rem' }}><FuelBadge fuel={v.fuel} /></td>
                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#ff4757' }}>{formatPrice(v.priceNumeric)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* YAKIT ANALİZİ */}
            {activeTabMenu === 'Yakıt Analizi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Marka Bazlı Yakıt Dağılımı</h3>
                  <div style={{ height: '500px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.brandFuelData} layout="vertical" margin={{ left: 50, right: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                        <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                        <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                        {stats.fuelTypes.map(ft => (
                          <Bar key={ft} dataKey={ft} stackId="a" fill={FUEL_COLORS[ft] || '#ccc'} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Yakıt Tipine Göre Ortalama Fiyat</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.fuelAvgPrices} layout="vertical" margin={{ left: 50, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                          <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} tickFormatter={(val) => formatNum(val)} />
                          <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={11} width={80} />
                          <Tooltip formatter={(value) => formatPrice(value)} contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                          <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                            {stats.fuelAvgPrices.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={FUEL_COLORS[entry.name] || '#ccc'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Şanzıman Tipine Göre Ortalama Fiyat</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.transAvgPrices} layout="vertical" margin={{ left: 50, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                          <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} tickFormatter={(val) => formatNum(val)} />
                          <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={11} width={80} />
                          <Tooltip formatter={(value) => formatPrice(value)} contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                          <Bar dataKey="avg" fill="#af52de" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GÜÇ AKTARIMI */}
            {activeTabMenu === 'Güç Aktarımı' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Elektrikli/Hibrit Araç</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.5rem' }}>
                        {stats.elecHybridCount} / {stats.total}
                     </div>
                   </div>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Elektrifikasyon Oranı</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.5rem' }}>
                        {((stats.elecHybridCount / stats.total) * 100).toFixed(1)} %
                     </div>
                   </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Güç Aktarımı Dağılımı</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.powertrainChart} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label>
                            {stats.powertrainChart.map((entry, index) => <Cell key={`cell-${index}`} fill={FUEL_COLORS[entry.name] || '#ccc'} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Güç Aktarımına Göre Ortalama Fiyat</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.powertrainAvgPrices} layout="vertical" margin={{ left: 50, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                          <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} tickFormatter={(val) => formatNum(val)} />
                          <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={11} width={90} />
                          <Tooltip formatter={(value) => formatPrice(value)} contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                          <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                            {stats.powertrainAvgPrices.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={FUEL_COLORS[entry.name] || '#ccc'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Çekiş Tipi Dağılımı</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.drivetrainChart} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label>
                            {stats.drivetrainChart.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Çekiş Tipine Göre Ortalama Fiyat</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.drivetrainAvgPrices}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--text-secondary)" fontSize={11} tickFormatter={(val) => formatNum(val)} tickLine={false} axisLine={false} />
                          <Tooltip formatter={(value) => formatPrice(value)} contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                          <Bar dataKey="avg" fill="#007aff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Güç Verisi Olan</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.5rem' }}>{stats.hpCount} araç</div>
                   </div>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ortalama Güç</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#007aff', marginTop: '0.5rem' }}>{stats.avgHp} HP</div>
                   </div>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ortalama TL/HP</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '0.5rem' }}>
                        {stats.hpCount > 0 ? formatNum(stats.avg / stats.avgHp) : 0}
                     </div>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Güç Segmentleri</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.powerSegmentsChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                          <Bar dataKey="count" fill="#007aff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>En İyi Güç/Fiyat Değeri (TL/HP)</h3>
                    <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem 0.5rem' }}>#</th>
                            <th style={{ padding: '0.75rem 0.5rem' }}>Marka</th>
                            <th style={{ padding: '0.75rem 0.5rem' }}>Model</th>
                            <th style={{ padding: '0.75rem 0.5rem' }}>HP</th>
                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>TL/HP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.bestHpValues.map((v, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                              <td style={{ padding: '0.75rem 0.5rem' }}>{i + 1}</td>
                              <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{v.brand}</td>
                              <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{v.model}</td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>
                                <span style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{v.hp} HP</span>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{new Intl.NumberFormat('tr-TR').format(Math.round(v.tlPerHp))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EV ANALİZİ */}
            {activeTabMenu === 'EV Analizi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Elektrikli Araç</span>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.5rem' }}>
                        <Car size={24} /> {stats.evCount}
                     </div>
                   </div>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ortalama Menzil</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.5rem' }}>
                        {stats.evAvgRange} km
                     </div>
                   </div>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ortalama Fiyat</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#007aff', marginTop: '0.5rem' }}>
                        {formatNum(stats.evAvgPrice)}
                     </div>
                   </div>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ortalama TL/km</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '0.5rem' }}>
                        {stats.evAvgRange > 0 ? new Intl.NumberFormat('tr-TR').format(Math.round(stats.evAvgPrice / stats.evAvgRange)) : 0}
                     </div>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>En Uzun Menzilli Elektrikli Araçlar</h3>
                    <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem 0.5rem' }}>#</th>
                            <th style={{ padding: '0.75rem 0.5rem' }}>Marka</th>
                            <th style={{ padding: '0.75rem 0.5rem' }}>Model</th>
                            <th style={{ padding: '0.75rem 0.5rem' }}>Ortalama Menzil</th>
                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Fiyat</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.longestRangeEVs.map((v, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                              <td style={{ padding: '0.75rem 0.5rem' }}>{i + 1}</td>
                              <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{v.brand}</td>
                              <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{v.model}</td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>
                                <span style={{ color: '#10b981', border: '1px solid #10b981', padding: '2px 6px', borderRadius: '12px' }}>{v.mockRange} km</span>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#00ffa3' }}>{formatNum(v.priceNumeric)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>En İyi Değer (TL/km)</h3>
                    <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem 0.5rem' }}>#</th>
                            <th style={{ padding: '0.75rem 0.5rem' }}>Marka</th>
                            <th style={{ padding: '0.75rem 0.5rem' }}>Model</th>
                            <th style={{ padding: '0.75rem 0.5rem' }}>Menzil</th>
                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>TL/km</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.bestValueEVs.map((v, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                              <td style={{ padding: '0.75rem 0.5rem' }}>{i + 1}</td>
                              <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{v.brand}</td>
                              <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{v.model}</td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>
                                <span style={{ color: '#10b981', border: '1px solid #10b981', padding: '2px 6px', borderRadius: '12px' }}>{v.mockRange} km</span>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 3 }).format(v.tlPerKm)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OTV ANALİZİ */}
            {activeTabMenu === '% ÖTV Analizi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ÖTV Verisi Olan Araç</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                        {stats.otvCount} / {stats.total}
                     </div>
                   </div>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ortalama ÖTV Oranı</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '0.5rem' }}>
                        {stats.avgOtv} %
                     </div>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>ÖTV Oranı Dağılımı</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.otvChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                          <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>ÖTV Oranına Göre Ortalama Fiyat</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={stats.otvChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--text-secondary)" fontSize={11} tickFormatter={(val) => formatNum(val)} tickLine={false} axisLine={false} />
                          <Tooltip formatter={(value, name) => [name === 'avgPrice' ? formatPrice(value) : value, name === 'avgPrice' ? 'Ortalama Fiyat' : 'Değer']} contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                          <Bar dataKey="avgPrice" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Line type="monotone" dataKey="avgPrice" stroke="#ffffff" strokeWidth={2} dot={{ r: 4, fill: '#000', stroke: '#fff', strokeWidth: 2 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Marka Bazlı Ortalama ÖTV Oranı</h3>
                  <div style={{ height: '500px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.brandOtvChart} layout="vertical" margin={{ left: 50, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} tickFormatter={(val) => `%${val}`} />
                        <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={11} width={100} />
                        <Tooltip formatter={(value) => `%${value}`} contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                        <Bar dataKey="avgOtv" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* MODEL YILI ANALİZİ */}
            {activeTabMenu === 'Model Yılı' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Model Yılı Verisi Olan</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                        {stats.yearCount} / {stats.total}
                     </div>
                   </div>
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Farklı Model Yılı</span>
                     <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                        {stats.yearUnique}
                     </div>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Model Yılı Dağılımı</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.yearChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                          <Bar dataKey="count" fill="#111827" stroke="rgba(255,255,255,0.1)" strokeWidth={1} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Model Yılına Göre Ortalama Fiyat</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={stats.yearChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--text-secondary)" fontSize={11} tickFormatter={(val) => formatNum(val)} tickLine={false} axisLine={false} />
                          <Tooltip formatter={(value, name) => [name === 'avgPrice' ? formatPrice(value) : value, name === 'avgPrice' ? 'Ortalama Fiyat' : 'Değer']} contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                          <Bar dataKey="avgPrice" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Line type="monotone" dataKey="avgPrice" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#ef4444', strokeWidth: 2 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Model Yılı Detayları</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                          <th style={{ padding: '1rem 0.5rem' }}>Model Yılı</th>
                          <th style={{ padding: '1rem 0.5rem' }}>Araç Sayısı</th>
                          <th style={{ padding: '1rem 0.5rem' }}>Oran</th>
                          <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Ortalama Fiyat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...stats.yearChart].reverse().map((d, i) => {
                          const ratio = ((d.count / stats.yearCount) * 100).toFixed(1);
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                              <td style={{ padding: '1rem 0.5rem' }}>
                                <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{d.name}</span>
                              </td>
                              <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{d.count}</td>
                              <td style={{ padding: '1rem 0.5rem', width: '30%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${ratio}%`, height: '100%', background: '#3b82f6', borderRadius: '2px' }} />
                                  </div>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '40px' }}>%{ratio}</span>
                                </div>
                              </td>
                              <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatPrice(d.avgPrice)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}

export default Statistics;
