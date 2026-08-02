import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Zap, CheckCircle2, Fuel, Gauge, Droplet, Cog } from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const getBrandUrl = (brand) => {
  const urls = {
    'Togg': 'https://www.togg.com.tr/price-list',
    'Tesla': 'https://www.tesla.com/tr_tr/modely/design',
    'Hyundai': 'https://www.hyundai.com/tr/tr/arac-fiyat-listesi',
    'Renault': 'https://www.renault.com.tr/fiyat-listeleri.html',
    'Ford': 'https://www.ford.com.tr/fiyat-listesi',
    'Fiat': 'https://otomobil.fiat.com.tr/fiyat-listesi',
    'Opel': 'https://fiyatlisteleri.opel.com.tr/binek-araclar',
    'Citroen': 'https://talep.citroen.com.tr/fiyat-listesi',
    'Honda': 'https://www.honda.com.tr/otomobil/otomobil-fiyat-listesi-2026',
    'BMW': 'https://www.bmw.com.tr/tr/fastlane/bmw-fiyat-listesi.html'
  };
  return urls[brand] || `https://www.${brand.toLowerCase().replace(/\s+/g, '')}.com.tr`;
};

const VehicleListRow = ({ vehicle, index }) => {
  const [selectedYear, setSelectedYear] = useState("2026");
  const hasDiscount = vehicle.price_campaign < vehicle.price_list;

  return (
    <motion.div
      onClick={() => window.open(getBrandUrl(vehicle.brand), '_blank')}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      className="glass-panel"
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        border: '1px solid var(--glass-border)',
        padding: '1rem',
        gap: '1.5rem',
        width: '100%',
        cursor: 'pointer'
      }}
    >
      {/* Görsel Alanı (Thumbnail) */}
      <div style={{
        position: 'relative',
        width: '240px',
        height: '140px',
        borderRadius: '12px',
        overflow: 'hidden',
        flexShrink: 0,
        background: '#1a1a24'
      }}>
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
          src={vehicle.image_url} 
          alt={`${vehicle.brand} ${vehicle.model}`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = `https://placehold.co/800x400/1a1a24/00f0ff?text=${encodeURIComponent(vehicle.brand)}`;
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.9,
          }}
        />
        {hasDiscount && (
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'linear-gradient(135deg, var(--accent-secondary), #ff4d4d)',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Zap size={12} /> İndirim
          </div>
        )}
      </div>

      {/* Orta Kısım: Araç Bilgileri */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {vehicle.brand}
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0.1rem 0', color: 'var(--text-primary)' }}>
            {vehicle.model}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {vehicle.version}
          </p>
        </div>

        {/* Teknik Özellikler Satırı (Specs) */}
        {vehicle.specs && (
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            
            {vehicle.specs.fuel_type === "Elektrik" || (vehicle.type && vehicle.type.toLowerCase().includes("elektrik")) ? (
              // ELEKTRİKLİ ARAÇ (EV) GÖSTERİMİ
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={14} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{vehicle.specs.range || '-'} Menzil</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Fuel size={14} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{vehicle.specs.charge_time || '-'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Gauge size={14} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{vehicle.specs.horsepower || '-'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Cog size={14} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{vehicle.specs.torque || '-'}</span>
                </div>
              </>
            ) : (
              // İÇTEN YANMALI (ICE) GÖSTERİMİ
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                   <Fuel size={14} color="var(--accent-primary)" />
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{vehicle.specs.fuel_type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                   <Gauge size={14} color="var(--accent-primary)" />
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{vehicle.specs.horsepower}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                   <Cog size={14} color="var(--accent-primary)" />
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{vehicle.specs.engine !== "Yok (Elektrik Motoru)" ? vehicle.specs.engine : vehicle.specs.technology}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                   <Droplet size={14} color="var(--accent-primary)" />
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{vehicle.specs.consumption?.mixed || '-'} (Karma)</span>
                </div>
              </>
            )}
            
          </div>
        )}

        {/* Donanım / Paket Özellikleri */}
        {vehicle.package_features && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {vehicle.package_features.slice(0, 4).map(feature => (
              <span key={feature} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '0.2rem 0.6rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <CheckCircle2 size={12} color="var(--accent-primary)" />
                {feature}
              </span>
            ))}
            {vehicle.package_features.length > 4 && (
               <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                 +{vehicle.package_features.length - 4} donanım
               </span>
            )}
          </div>
        )}
      </div>

      {/* Sağ Kısım: Fiyat Alanı (3 Yıllık Gösterim) */}
      <div style={{ 
        width: '260px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        borderLeft: '1px solid var(--glass-border)',
        paddingLeft: '1.5rem',
        flexShrink: 0,
        gap: '0.5rem'
      }}>
        
        {/* 2025 Fiyatı */}
        {vehicle.prices_by_year && vehicle.prices_by_year["2025"] && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>2025 Model:</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>{formatPrice(vehicle.prices_by_year["2025"])}</span>
          </div>
        )}

        {/* 2026 Fiyatı (Mevcut Yıl) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 240, 255, 0.05)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
          <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: '600' }}>2026 Model:</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {hasDiscount && (
              <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.75rem', marginBottom: '0.1rem' }}>
                {formatPrice(vehicle.price_list)}
              </span>
            )}
            <span style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              {formatPrice(vehicle.prices_by_year && vehicle.prices_by_year["2026"] ? vehicle.prices_by_year["2026"] : (hasDiscount ? vehicle.price_campaign : vehicle.price_list))}
            </span>
          </div>
        </div>

        {/* 2027 Fiyatı */}
        {vehicle.prices_by_year && vehicle.prices_by_year["2027"] && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>2027 Model:</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>{formatPrice(vehicle.prices_by_year["2027"])}</span>
          </div>
        )}

        {/* Resmi Siteye Yönlendirme (External Link) */}
        <button 
          onClick={(e) => { e.stopPropagation(); window.open(getBrandUrl(vehicle.brand), '_blank'); }}
          style={{ 
            marginTop: '0.25rem',
            padding: '0.4rem', 
            borderRadius: '8px', 
            border: '1px solid rgba(255,255,255,0.1)', 
            background: 'rgba(255,255,255,0.03)',
            color: 'var(--text-primary)',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'background 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.4rem'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
        >
          Markanın Sitesine Git ↗
        </button>

      </div>
    </motion.div>
  );
};

export default VehicleListRow;
