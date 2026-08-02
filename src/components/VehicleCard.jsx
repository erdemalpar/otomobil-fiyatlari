import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Zap, CheckCircle2, Fuel, Gauge, Droplet, Cog, Thermometer, History } from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const getBrandUrl = (vehicle) => {
  if (vehicle.brand === 'Togg' && vehicle.model && vehicle.model.toLowerCase().includes('t10f')) {
    return 'https://www.togg.com.tr/t10f-price-list';
  }
  if (vehicle.brand === 'Togg' && vehicle.model && vehicle.model.toLowerCase().includes('t10x')) {
    return 'https://www.togg.com.tr/price-list';
  }
  const urls = {
    'Togg': 'https://www.togg.com.tr/price-list',
    'Tesla': 'https://www.tesla.com/tr_tr/modely/design',
    'Hyundai': 'https://www.hyundai.com/tr/tr/satis/fiyat-listesi.html',
    'Renault': 'https://www.renault.com.tr/fiyat-listeleri.html',
    'Ford': 'https://www.ford.com.tr/fiyat-listesi',
    'Fiat': 'https://otomobil.fiat.com.tr/fiyat-listesi',
    'Opel': 'https://fiyatlisteleri.opel.com.tr/binek-araclar',
    'Citroen': 'https://talep.citroen.com.tr/fiyat-listesi',
    'Honda': 'https://www.honda.com.tr/otomobil/otomobil-fiyat-listesi-2026',
    'BMW': 'https://www.bmw.com.tr/tr/fastlane/bmw-fiyat-listesi.html',
    'Volvo': 'https://www.volvocars.com/tr/l/fiyat-listesi/'
  };
  return urls[vehicle.brand] || `https://www.${vehicle.brand.toLowerCase().replace(/\s+/g, '')}.com.tr`;
};

const VehicleCard = ({ vehicle, index }) => {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [showHistory, setShowHistory] = useState(false);
  const hasDiscount = vehicle.price_campaign < vehicle.price_list;

  return (
    <motion.div
      onClick={() => window.open(getBrandUrl(vehicle), '_blank')}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
      className="glass-panel"
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer'
      }}
    >
      {/* Fiyat Geçmişi (Log) İkonu ve Popover */}
      <div 
        onMouseEnter={() => setShowHistory(true)}
        onMouseLeave={() => setShowHistory(false)}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '1rem',
          right: hasDiscount ? '8.5rem' : '1rem',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: '0.45rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 15,
          cursor: 'help',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.2s'
        }}
      >
        <History size={18} color="var(--text-secondary)" style={{ transform: showHistory ? 'rotate(-30deg)' : 'none', transition: 'all 0.3s' }} />
        
        {/* History Popup */}
        {showHistory && vehicle.prices_by_year && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '10px',
              background: 'rgba(15,15,20,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1rem',
              width: 'max-content',
              minWidth: '200px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
              zIndex: 20
            }}
          >
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>
              Fiyat Geçmişi
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(vehicle.prices_by_year).map(([year, price]) => (
                <div key={year} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{year}</span>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 'bold' }}>{formatPrice(price)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      {/* İndirim Rozeti */}
      {hasDiscount && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'linear-gradient(135deg, var(--accent-secondary), #ff4d4d)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontWeight: '700',
          fontSize: '0.875rem',
          zIndex: 10,
          boxShadow: '0 4px 15px rgba(255, 0, 60, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <Zap size={16} /> Kampanya
        </div>
      )}

      {/* Görsel Alanı */}
      <div style={{
        position: 'relative',
        height: '220px',
        overflow: 'hidden',
        background: '#1a1a24'
      }}>
        <motion.img 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
          src={vehicle.image_url} 
          alt={`${vehicle.brand} ${vehicle.model}`}
          referrerPolicy="no-referrer"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.9,
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(to top, rgba(15,15,20,1) 0%, rgba(15,15,20,0) 100%)'
        }}></div>
      </div>

      {/* İçerik Alanı */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {vehicle.brand}
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0.25rem 0' }}>
            {vehicle.model}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {vehicle.version} • {vehicle.type}
          </p>
        </div>

        {/* Yeni: Teknik Özellikler Tablosu (Specs) */}
        {vehicle.specs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            
            {vehicle.specs.fuel_type === "Elektrik" || (vehicle.type && vehicle.type.toLowerCase().includes("elektrik")) ? (
              // ELEKTRİKLİ ARAÇ (EV) GÖSTERİMİ
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Menzil</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>{vehicle.specs.range || '-'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Fuel size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Şarj Süresi</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>{vehicle.specs.charge_time || '-'}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gauge size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Güç</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>{vehicle.specs.horsepower || '-'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cog size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tork</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>{vehicle.specs.torque || '-'}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Thermometer size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Isı Pompası</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                        {vehicle.specs.heat_pump 
                          ? vehicle.specs.heat_pump 
                          : (vehicle.package_features?.some(f => f.toLowerCase().includes('ısı pompası') || f.toLowerCase().includes('heat pump') || f.toLowerCase().includes('isı pompas')) ? 'Standart' : 'Bilinmiyor / Yok')}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // İÇTEN YANMALI (ICE) GÖSTERİMİ
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Fuel size={16} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Yakıt</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>{vehicle.specs.fuel_type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Gauge size={16} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Güç</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>{vehicle.specs.horsepower}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cog size={16} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Motor</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }} title={vehicle.specs.engine}>
                      {vehicle.specs.engine !== "Yok (Elektrik Motoru)" ? vehicle.specs.engine : vehicle.specs.technology}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Droplet size={16} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Karma Tüketim</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>{vehicle.specs.consumption?.mixed || '-'}</div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}

        {/* Donanım / Paket Özellikleri */}
        {vehicle.package_features && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {vehicle.package_features.slice(0, 3).map(feature => (
              <span key={feature} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.25rem 0.6rem',
                borderRadius: '8px',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <CheckCircle2 size={12} color="var(--accent-primary)" />
                {feature}
              </span>
            ))}
            {vehicle.package_features.length > 3 && (
               <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                 +{vehicle.package_features.length - 3} donanım
               </span>
            )}
          </div>
        )}

        {/* Fiyat Alanı (3 Yıl Alt Alta) */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            
            {/* 2025 Fiyatı */}
            {vehicle.prices_by_year && vehicle.prices_by_year["2025"] && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>2025 Model:</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>{formatPrice(vehicle.prices_by_year["2025"])}</span>
              </div>
            )}

            {/* 2026 Fiyatı (Mevcut Yıl) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'rgba(0, 240, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
              <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: '600' }}>2026 Model:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                {hasDiscount && (
                  <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.75rem', marginBottom: '0.1rem' }}>
                    {formatPrice(vehicle.price_list)}
                  </span>
                )}
                <span style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                  {formatPrice(vehicle.prices_by_year && vehicle.prices_by_year["2026"] ? vehicle.prices_by_year["2026"] : (hasDiscount ? vehicle.price_campaign : vehicle.price_list))}
                </span>
              </div>
            </div>

            {/* 2027 Fiyatı */}
            {vehicle.prices_by_year && vehicle.prices_by_year["2027"] && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>2027 Model:</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>{formatPrice(vehicle.prices_by_year["2027"])}</span>
              </div>
            )}
            
          </div>
          
          {/* Resmi Siteye Yönlendirme (External Link) */}
          <button 
            onClick={(e) => { e.stopPropagation(); window.open(getBrandUrl(vehicle), '_blank'); }}
            style={{ 
              marginTop: '1rem',
              width: '100%',
              padding: '0.5rem', 
              borderRadius: '8px', 
              border: '1px solid rgba(255,255,255,0.1)', 
              background: 'rgba(255,255,255,0.03)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
          >
            Markanın Resmi Sitesine Git ↗
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
