import React, { useState, useEffect, useContext, useRef } from 'react';
import Navbar from '../components/Navbar';
import { AppContext } from '../context/AppContext';
import { Trash2, X, Download, RefreshCw, Heart } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../index.css';

function Compare() {
  const { 
    favorites, toggleFavorite, clearFavorites, 
    compares, toggleCompare, clearCompares 
  } = useContext(AppContext);
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyDiff, setOnlyDiff] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    fetch(`/data/vehicles.json?v=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => {
        const uniqueVehicles = [];
        const seen = new Set();
        for (const v of data.vehicles) {
          const uniqueKey = `${v.brand}-${v.model}-${v.version}-${v.price_campaign || v.price_list}`;
          if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            v.id = uniqueKey;
            
            // Helper fields
            v.computedGear = (v.features || []).join(" ").toLowerCase().includes("otomatik") ? "Otomatik" : "Manuel";
            const fuelType = (v.type && v.type.toLowerCase().includes('elektrik')) ? 'Elektrik' : 
                             (v.features || []).join(" ").toLowerCase().includes('hibrit') ? 'Hibrit' : 'İçten Yanmalı';
            v.computedFuel = fuelType;
            v.isElectric = fuelType === 'Elektrik';
            v.isHybrid = fuelType === 'Hibrit';
            const fStr = (v.features || []).join(" ").toLowerCase();
            v.isMildHybrid = fStr.includes('hafif');
            v.isPHEV = fStr.includes('plug-in');
            v.category = v.type || 'Bilinmiyor';
            v.priceNumeric = v.price_campaign || v.price_list || 0;
            v.otvRate = v.otvRate || '-';
            v.drivetrain = '-';
            v.transmissionType = '-';
            if (fStr.includes('awd') || fStr.includes('4x4')) v.drivetrain = '4x4 (AWD)';
            else if (fStr.includes('rwd')) v.drivetrain = 'Arkadan Çekiş (RWD)';
            else if (fStr.includes('fwd') || fStr.includes('önden')) v.drivetrain = 'Önden Çekiş (FWD)';

            uniqueVehicles.push(v);
          }
        }
        setVehicles(uniqueVehicles);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const favoriteVehicles = vehicles.filter(v => favorites.has(v.id));
  const comparedVehicles = vehicles.filter(v => compares.has(v.id));

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price);
  };

  const generatePDF = async () => {
    if (!tableRef.current) return;
    
    try {
      const canvas = await html2canvas(tableRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Siyah/koyu tema için arka planı biraz grileştir (isteğe bağlı, beyaz da bırakılabilir)
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`arac-karsilastirma-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF oluşturulurken hata:', err);
      alert('PDF oluşturulurken bir hata oluştu.');
    }
  };

  const formatBoolean = (v) => v ? <span style={{color: '#10b981'}}>✓</span> : '-';

  const sections = [
    {
      title: 'TEMEL BİLGİLER',
      rows: [
        { key: 'brand', label: 'Marka' },
        { key: 'model', label: 'Model' },
        { key: 'version', label: 'Donanım' },
        { key: 'engine', label: 'Motor' },
        { key: 'modelYear', label: 'Model Yılı' },
      ]
    },
    {
      title: 'PERFORMANS',
      rows: [
        { key: 'powerHP', label: 'Motor Gücü', format: (v) => v ? `${v} HP` : '-' },
        { key: 'engineDisplacement', label: 'Motor Hacmi', format: (v) => v ? `${v} cc` : '-' },
      ]
    },
    {
      title: 'GÜÇ AKTARIMI',
      rows: [
        { key: 'computedFuel', label: 'Yakıt' },
        { key: 'computedGear', label: 'Şanzıman' },
        { key: 'transmissionType', label: 'Şanzıman Tipi' },
        { key: 'drivetrain', label: 'Çekiş Tipi' },
      ]
    },
    {
      title: 'ELEKTRİKLİ/HİBRİT',
      rows: [
        { key: 'isElectric', label: 'Elektrikli', format: formatBoolean },
        { key: 'isHybrid', label: 'Hibrit', format: formatBoolean },
        { key: 'isMildHybrid', label: 'Hafif Hibrit', format: formatBoolean },
        { key: 'isPHEV', label: 'Plug-in Hibrit', format: formatBoolean },
        { key: 'batteryCapacity', label: 'Batarya Kapasitesi' },
        { key: 'wltpRange', label: 'WLTP Menzil' },
        { key: 'longRange', label: 'Uzun Menzil', format: formatBoolean },
      ]
    },
    {
      title: 'FİYAT VE VERGİLER',
      rows: [
        { 
          key: 'priceNumeric', 
          label: 'Fiyat', 
          format: (val, allValues) => {
             if (!val) return '-';
             const priceStr = formatPrice(val);
             const minPrice = Math.min(...allValues.filter(v => typeof v === 'number' && v > 0));
             const isLowest = val === minPrice && val > 0;
             return (
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 'bold' }}>
                     {priceStr}
                     {isLowest && <span style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>En Iyi</span>}
                 </div>
             );
          }
        },
        { key: 'netPrice', label: 'Net Fiyat' },
        { key: 'otvRate', label: 'ÖTV Oranı', format: v => (v && v !== '-') ? `%${v}` : '-' },
        { key: 'otvAmount', label: 'ÖTV Tutarı' },
        { key: 'kdvAmount', label: 'KDV Tutarı' },
        { key: 'monthlyRent', label: 'Aylık Kiralama' }
      ]
    },
    {
      title: 'DİĞER',
      rows: [
        { key: 'origin', label: 'Menşei' },
        { key: 'emissionStandard', label: 'Emisyon Standardı' },
        { key: 'fuelConsumption', label: 'Yakıt Tüketimi' },
        { key: 'category', label: 'Araç Kategorisi' },
      ]
    }
  ];

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar activeTab="compare" />
      
      <main className="container" style={{ paddingTop: '90px', paddingBottom: '60px', flex: 1 }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '2rem', fontWeight: 'bold' }}>Karşılaştırma</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Seçili araçları detaylı karşılaştırın ve favorilerinizi yönetin.</p>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Yükleniyor...</div>
        ) : (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {/* SOL PANEL: FAVORİLER */}
            <div style={{ flex: '1 1 300px', maxWidth: '350px' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                    <Heart size={18} fill="#ff4757" color="#ff4757" /> Favorilerim ({favorites.size})
                  </h3>
                  {favorites.size > 0 && (
                    <button onClick={clearFavorites} style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Trash2 size={14} /> Temizle
                    </button>
                  )}
                </div>

                {favoriteVehicles.length === 0 ? (
                  <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Henüz favoriye eklenmiş araç yok.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
                    {favoriteVehicles.map(v => {
                      const isCompared = compares.has(v.id);
                      return (
                        <div key={v.id} style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{v.model}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v.brand} - {v.version}</span>
                            <span style={{ fontWeight: 'bold', color: '#00ffa3', marginTop: '0.25rem' }}>{formatPrice(v.price_campaign || v.price_list)}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <button 
                              onClick={() => toggleCompare(v.id)}
                              style={{ 
                                background: isCompared ? 'rgba(255,255,255,0.1)' : 'var(--text-primary)', 
                                color: isCompared ? 'white' : 'black', 
                                border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'
                              }}>
                              <RefreshCw size={12} /> {isCompared ? 'Kaldır' : 'Karşılaştır'}
                            </button>
                            <button onClick={() => toggleFavorite(v.id)} style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', padding: '4px' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SAĞ PANEL: KARŞILAŞTIRMA */}
            <div style={{ flex: '3 1 600px' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                    <RefreshCw size={18} /> Karşılaştırma Listesi ({compares.size} / 4)
                  </h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}>
                      Sadece Farklılar
                      <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} style={{ cursor: 'pointer' }} />
                    </label>

                    <button 
                      onClick={generatePDF}
                      disabled={compares.size === 0}
                      style={{ 
                        background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', borderRadius: '8px', 
                        padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', cursor: compares.size > 0 ? 'pointer' : 'not-allowed', 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: compares.size > 0 ? 1 : 0.5 
                      }}>
                      <Download size={14} /> PDF Rapor Oluştur
                    </button>
                    
                    {compares.size > 0 && (
                      <button 
                        onClick={clearCompares}
                        style={{ background: 'transparent', border: '1px solid #ff4757', color: '#ff4757', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        Tümünü Temizle
                      </button>
                    )}
                  </div>
                </div>

                {compares.size === 0 ? (
                  <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Karşılaştırmak için sol menüden veya anasayfadan araç ekleyin. (Maksimum 4 araç)
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', background: 'white' }} ref={tableRef}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px', color: '#111' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #eaeaea' }}>
                          <th style={{ padding: '1rem', width: '20%', color: '#666', fontWeight: '600' }}>Özellik</th>
                          {comparedVehicles.map(v => (
                            <th key={v.id} style={{ padding: '1rem', width: `${80 / compares.size}%`, textAlign: 'center' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                {/* PDF de buton çıkmaması için class/stiller eklenebilir ama html2canvas id ignore da kullanabiliriz, 
                                    şuan basitçe gizlemedik, isterse data-html2canvas-ignore="true" diyebiliriz */}
                                <button data-html2canvas-ignore="true" onClick={() => toggleCompare(v.id)} style={{ position: 'absolute', top: '-10px', right: 0, background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer' }}><X size={16}/></button>
                                {v.image_url && <img src={v.image_url} alt={v.model} style={{ height: '60px', objectFit: 'contain', marginBottom: '0.5rem' }} />}
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#111' }}>{v.model}</span>
                                <span style={{ color: '#666', fontSize: '0.85rem' }}>{v.brand}</span>
                                <span style={{ color: '#10b981', fontWeight: 'bold', marginTop: '0.5rem' }}>{formatPrice(v.price_campaign || v.price_list)}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sections.map((section, secIdx) => (
                          <React.Fragment key={secIdx}>
                            <tr>
                              <td colSpan={comparedVehicles.length + 1} style={{ background: '#f5f5f5', padding: '0.75rem 1rem', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #eaeaea' }}>
                                {section.title}
                              </td>
                            </tr>
                            {section.rows.map((row, rowIdx) => {
                              // Sadece farklilar mantigi
                              const rawValues = comparedVehicles.map(v => v[row.key]);
                              const allValuesFormatted = comparedVehicles.map(v => {
                                const val = v[row.key];
                                return row.format ? row.format(val, rawValues) : (val || '-');
                              });
                              // Formatlanmamis hallerini set ile check ediyoruz, formatlaninca baska react nodelari olusturabiliyor (span)
                              const uniqueRawValues = new Set(rawValues);
                              if (onlyDiff && uniqueRawValues.size === 1 && comparedVehicles.length > 1) {
                                return null; // Tüm değerler aynıysa satırı gizle
                              }

                              return (
                                <tr key={rowIdx} style={{ borderBottom: '1px solid #eaeaea' }}>
                                  <td style={{ padding: '1rem', color: '#666', fontWeight: '500' }}>{row.label}</td>
                                  {allValuesFormatted.map((val, i) => (
                                    <td key={i} style={{ padding: '1rem', textAlign: 'center', color: '#333' }}>
                                      {val}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default Compare;
