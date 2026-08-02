import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import { ChevronDown, Search, Download, Copy, Plus, Minus, Info, CheckCircle, Heart, ArrowLeftRight, Eye, LineChart } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import '../index.css';

function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');

  // Yardımcı Fonksiyon: Türkçe karakterleri normalize et (Örn: Işık -> isik, İbiza -> ibiza)
  const normalizeText = (text) => {
    if (!text) return '';
    return text.toLocaleLowerCase('tr-TR')
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
  };

  // Context States
  const { favorites, toggleFavorite: ctxToggleFavorite, compares, toggleCompare: ctxToggleCompare } = useContext(AppContext);

  const toggleFavorite = (id) => {
    ctxToggleFavorite(id);
    if (favorites.has(id)) showToast("Favorilerden çıkarıldı");
    else showToast("Favorilere eklendi!");
  };

  const toggleCompare = (id) => {
    if (!compares.has(id) && compares.size >= 4) {
      showToast("En fazla 4 araç karşılaştırılabilir!");
      return;
    }
    ctxToggleCompare(id);
    if (compares.has(id)) showToast("Karşılaştırmadan çıkarıldı");
    else showToast("Karşılaştırmaya eklendi!");
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Hepsi');
  const [selectedModel, setSelectedModel] = useState('Hepsi');
  const [selectedGear, setSelectedGear] = useState('Hepsi');
  const [selectedFuel, setSelectedFuel] = useState('Hepsi');
  const [sortBy, setSortBy] = useState('price_asc');

  // Expanded rows for Accordion
  const [expandedRows, setExpandedRows] = useState({});

  // Pagination / Load More
  const [visibleCount, setVisibleCount] = useState(50);

  // Parse URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dParam = params.get('d');
    const sParam = params.get('s');

    if (!dParam || !sParam) {
      const today = new Date().toISOString().split('T')[0];
      const newUrl = `${window.location.pathname}?d=${today}&s=price:asc`;
      window.history.replaceState(null, '', newUrl);
      setSortBy('price_asc');
    } else {
      setSortBy(sParam === 'price:desc' ? 'price_desc' : 'price_asc');
    }

    fetch(`/data/vehicles.json?v=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => {
        const uniqueVehicles = [];
        const seen = new Set();
        for (const v of data.vehicles) {
          const uniqueKey = `${v.brand}-${v.model}-${v.version}-${v.price_campaign || v.price_list}`;
          if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            v.id = uniqueKey; // JSON'dan gelen hatalı (duplicate) ID'leri eziyoruz
            uniqueVehicles.push(v);
          }
        }
        setVehicles(uniqueVehicles);
        setLastUpdated(new Date(data.lastUpdated).toLocaleString('tr-TR'));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Sync sort to URL
  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortBy(val);
    const params = new URLSearchParams(window.location.search);
    params.set('s', val === 'price_desc' ? 'price:desc' : 'price:asc');
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop + 150 >= document.documentElement.offsetHeight) {
        setVisibleCount(prev => prev + 20);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter Logic
  const filteredVehicles = vehicles.filter(v => {
    const brandMatch = selectedBrand === 'Hepsi' || v.brand === selectedBrand;
    const modelMatch = selectedModel === 'Hepsi' || v.model === selectedModel;
    
    const featStr = (v.features || []).join(" ").toLowerCase();
    const typeStr = (v.type || "").toLowerCase();
    
    // Gear detection
    let isAuto = featStr.includes("otomatik");
    let gearMatch = selectedGear === 'Hepsi' || 
                    (selectedGear === 'Otomatik' && isAuto) || 
                    (selectedGear === 'Manuel' && !isAuto);
                    
    // Fuel detection
    let fuelMatch = true;
    if (selectedFuel !== 'Hepsi') {
      const isElectric = featStr.includes("elektrik") || typeStr.includes("elektrik");
      const isHybrid = featStr.includes("hibrit") || featStr.includes("hybrid");
      const isDiesel = featStr.includes("dizel");
      const isPetrol = featStr.includes("benzin") || (!isElectric && !isHybrid && !isDiesel);
      
      if (selectedFuel === 'Elektrik') fuelMatch = isElectric;
      if (selectedFuel === 'Hibrit') fuelMatch = isHybrid;
      if (selectedFuel === 'Dizel') fuelMatch = isDiesel;
      if (selectedFuel === 'Benzin') fuelMatch = isPetrol;
    }

    const query = normalizeText(searchQuery).trim();
    const searchTerms = query.split(/\s+/).filter(t => t.length > 0);
    const vehicleText = normalizeText(`${v.brand || ''} ${v.model || ''} ${v.version || ''}`);
    
    const searchMatch = searchTerms.length === 0 || searchTerms.every(term => vehicleText.includes(term));

    return brandMatch && modelMatch && gearMatch && fuelMatch && searchMatch;
  });

  // Sort
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    const priceA = a.price_campaign || a.price_list || 0;
    const priceB = b.price_campaign || b.price_list || 0;
    return sortBy === 'price_asc' ? priceA - priceB : priceB - priceA;
  });

  const currentVehicles = sortedVehicles.slice(0, visibleCount);

  // Dropdown Options
  const uniqueBrands = ['Hepsi', ...new Set(vehicles.map(v => v.brand).sort())];
  const uniqueModels = ['Hepsi', ...new Set(vehicles.filter(v => selectedBrand === 'Hepsi' || v.brand === selectedBrand).map(v => v.model).sort())];

  // Exports
  const downloadCSV = () => {
    let csv = "Marka,Model,Donanim,Sanziman,Yakit,Fiyat\n";
    sortedVehicles.forEach(v => {
      const gear = (v.features || []).join(" ").toLowerCase().includes("otomatik") ? "Otomatik" : "Manuel";
      const price = v.price_campaign || v.price_list;
      csv += `"${v.brand}","${v.model}","${v.version}","${gear}","${v.type}","${price}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arac_fiyatlari_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast("CSV dosyası indirildi!");
  };

  const copyMarkdown = () => {
    let md = "| Marka | Model | Donanım | Şanzıman | Fiyat |\n|---|---|---|---|---|\n";
    sortedVehicles.slice(0, 100).forEach(v => {
      const gear = (v.features || []).join(" ").toLowerCase().includes("otomatik") ? "Otomatik" : "Manuel";
      const price = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v.price_campaign || v.price_list || 0);
      md += `| ${v.brand} | ${v.model} | ${v.version} | ${gear} | ${price} |\n`;
    });
    navigator.clipboard.writeText(md);
    showToast("Markdown tablosu kopyalandı (100 satır)!");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Filtreli sayfa linki kopyalandı!");
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar 
        filteredVehicles={filteredVehicles} 
        copyLink={copyLink}
        activeTab="home"
      />
      
      <main className="container" style={{ paddingTop: '73px', paddingBottom: '60px', flex: 1 }}>
        
        {/* STICKY FILTER & EXPORT PANEL */}
        <div className="glass-panel" style={{ 
          padding: '0.75rem 1.5rem', 
          borderRadius: '0 0 16px 16px', 
          borderTop: 'none',
          marginBottom: '1.5rem',
          position: 'sticky',
          top: '73px', 
          zIndex: 40,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}>
          
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Model, donanım..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{ width: '100%', paddingLeft: '36px', height: '38px', borderRadius: '8px' }}
            />
          </div>
          
          <select className="glass-select" style={{ flex: '1 1 120px', height: '38px', borderRadius: '8px' }} value={selectedBrand} onChange={e => { setSelectedBrand(e.target.value); setSelectedModel('Hepsi'); }}>
            {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          
          <select className="glass-select" style={{ flex: '1 1 120px', height: '38px', borderRadius: '8px' }} value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
            <option value="Hepsi">Model Seçin</option>
            {uniqueModels.filter(m => m !== 'Hepsi').map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          
          <select className="glass-select" style={{ flex: '1 1 120px', height: '38px', borderRadius: '8px' }} value={selectedGear} onChange={e => setSelectedGear(e.target.value)}>
            <option value="Hepsi">Şanzıman Seçin</option>
            <option value="Otomatik">Otomatik</option>
            <option value="Manuel">Manuel</option>
          </select>

          <select className="glass-select" style={{ flex: '1 1 120px', height: '38px', borderRadius: '8px' }} value={selectedFuel} onChange={e => setSelectedFuel(e.target.value)}>
            <option value="Hepsi">Yakıt Seçin</option>
            <option value="Benzin">Benzin</option>
            <option value="Dizel">Dizel</option>
            <option value="Hibrit">Hibrit</option>
            <option value="Elektrik">Elektrik</option>
          </select>
          
          <select className="glass-select" style={{ flex: '1 1 120px', height: '38px', borderRadius: '8px' }} value={sortBy} onChange={handleSortChange}>
            <option value="price_asc">Fiyat (Artan)</option>
            <option value="price_desc">Fiyat (Azalan)</option>
          </select>

          <div style={{ display: 'flex', gap: '0.5rem', flex: '0 0 auto', borderLeft: '1px solid var(--glass-border)', paddingLeft: '0.75rem' }}>
            <button className="glass-button" onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px', padding: '0 12px', borderRadius: '8px' }}>
              <Download size={14} /> <span className="hide-on-mobile">CSV</span>
            </button>
            <button className="glass-button" onClick={copyMarkdown} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px', padding: '0 12px', borderRadius: '8px' }}>
              <Copy size={14} /> <span className="hide-on-mobile">Markdown</span>
            </button>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="glass-panel table-container" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--glass-border)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Model</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Marka</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Donanım & Motor</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Şanzıman</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Yakıt</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Fiyat</th>
                <th style={{ padding: '1rem 1.5rem', width: '150px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Yükleniyor...</td></tr>
              ) : currentVehicles.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Araç bulunamadı.</td></tr>
              ) : (
                currentVehicles.map(v => {
                  const isExpanded = expandedRows[v.id];
                  const gear = (v.features || []).join(" ").toLowerCase().includes("otomatik") ? "Otomatik" : "Manuel";
                  const priceStr = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v.price_campaign || v.price_list || 0);
                  const fuelType = (v.type && v.type.toLowerCase().includes('elektrik')) ? 'Elektrik' : 
                                   (v.features || []).join(" ").toLowerCase().includes('hibrit') ? 'Hibrit' : 'İçten Yanmalı';
                  
                  return (
                    <React.Fragment key={v.id}>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'all 0.2s', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button 
                              onClick={() => toggleRow(v.id)}
                              style={{ 
                                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px',
                                width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s'
                              }}>
                              {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
                            </button>
                            <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{v.model}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)' }}>{v.brand}</td>
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontSize: '0.9rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v.version}>{v.version}</td>
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{gear}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ 
                            background: fuelType === 'Elektrik' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                            color: fuelType === 'Elektrik' ? 'var(--accent-primary)' : 'var(--text-primary)',
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem'
                          }}>
                            {fuelType}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--success-color, #00ffa3)', fontWeight: '700', textAlign: 'right' }}>
                          {priceStr}
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button onClick={() => toggleFavorite(v.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: favorites.has(v.id) ? '#ff4757' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                              <Heart size={18} fill={favorites.has(v.id) ? '#ff4757' : 'none'} />
                            </button>
                            <button onClick={() => toggleCompare(v.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: compares.has(v.id) ? '#00ffa3' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                              <ArrowLeftRight size={18} />
                            </button>
                            <button onClick={() => showToast("Analiz modülü yakında eklenecek!")} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                              <Eye size={18} />
                            </button>
                            <button onClick={() => showToast("Fiyat grafiği yakında eklenecek!")} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                              <LineChart size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Content Area */}
                      {isExpanded && (
                        <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <td colSpan="7" style={{ padding: 0 }}>
                            <div style={{ 
                              padding: '2rem',
                              display: 'flex',
                              gap: '2rem',
                              borderBottom: '1px solid var(--glass-border)',
                              alignItems: 'center',
                              flexWrap: 'wrap'
                            }}>
                              <div style={{ flex: '0 0 300px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                                {v.image_url ? (
                                  <img src={v.image_url} alt={v.model} style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '180px' }} />
                                ) : (
                                  <div style={{ width: '100%', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Görsel Yok</div>
                                )}
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '300px' }}>
                                <h4 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>Öne Çıkan Özellikler</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                  {(v.features || []).map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                      <Info size={14} color="var(--accent-primary)"/> {f}
                                    </div>
                                  ))}
                                  {v.specs?.horsepower && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                      <Info size={14} color="var(--accent-primary)"/> {v.specs.horsepower} HP Motor Gücü
                                    </div>
                                  )}
                                  {v.specs?.range && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                      <Info size={14} color="var(--accent-primary)"/> {v.specs.range} km Menzil
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modern Toast Notification */}
      {toastMessage && (
        <div className="glass-toast animate-toast">
          <CheckCircle size={18} color="var(--accent-primary)" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default Home;
