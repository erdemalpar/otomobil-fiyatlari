import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AppContext } from '../context/AppContext';
import { Heart, Bell, ArrowLeftRight, ArrowUp, ChevronRight, Trash2, Archive } from 'lucide-react';
import '../index.css';

function MyProfile() {
  const { favorites, toggleFavorite, compares, toggleCompare } = useContext(AppContext);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // Dashboard Kart Komponenti
  const StatCard = ({ icon, value, label, iconColor }) => (
    <div className="glass-panel" style={{ 
      flex: '1 1 200px', 
      padding: '2rem 1rem', 
      borderRadius: '16px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      background: 'rgba(255, 255, 255, 0.02)'
    }}>
      <div style={{ color: iconColor, marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</div>
    </div>
  );

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar activeTab="profile" />
      
      <main className="container" style={{ paddingTop: '90px', paddingBottom: '60px', flex: 1 }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Kisisellestirilmis arac takip paneliniz</p>
        
        {/* STAT KARTLARI */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <StatCard 
            icon={<Heart size={28} fill="#ff4757" stroke="#ff4757" />} 
            value={favorites.size} 
            label="Favoriler" 
            iconColor="#ff4757" 
          />
          <StatCard 
            icon={<Bell size={28} />} 
            value="0" 
            label="Takip Edilen" 
            iconColor="var(--text-primary)" 
          />
          <StatCard 
            icon={<ArrowLeftRight size={28} />} 
            value={compares.size} 
            label="Karsilastirmada" 
            iconColor="#0055ff" 
          />
          <StatCard 
            icon={<ArrowUp size={28} />} 
            value="0" 
            label="Fiyat Degisimi" 
            iconColor="#ff4757" 
          />
        </div>

        {/* ALT PANELLER */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* FAVORİLER PANELİ */}
          <div className="glass-panel" style={{ flex: '1 1 500px', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                <Heart size={20} fill="#ff4757" color="#ff4757" /> Favoriler 
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.85rem' }}>{favorites.size}</span>
              </h3>
              <Link to="/compare" style={{ color: '#0055ff', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}>
                Tumunu Gor <ChevronRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Yükleniyor...</div>
            ) : favoriteVehicles.length === 0 ? (
              <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Henüz favoriye eklenmiş aracınız yok.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {favoriteVehicles.slice(0, 5).map((v) => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{v.brand} {v.model}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{v.version}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <button 
                        onClick={() => toggleCompare(v.id)}
                        title="Karşılaştırmaya Ekle/Çıkar"
                        style={{ background: 'none', border: 'none', color: compares.has(v.id) ? '#00ffa3' : 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}>
                        <ArrowLeftRight size={18} />
                      </button>
                      <button 
                        onClick={() => toggleFavorite(v.id)}
                        title="Favorilerden Çıkar"
                        style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TAKİP EDİLEN PANELİ */}
          <div className="glass-panel" style={{ flex: '1 1 500px', padding: '1.5rem', borderRadius: '16px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                <Bell size={20} /> Takip Edilen 
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.85rem' }}>0</span>
              </h3>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
              <Archive size={64} strokeWidth={1} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
              <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Takip edilen arac yok
              </div>
              <button 
                onClick={() => navigate('/')}
                style={{ 
                  background: 'var(--text-primary)', color: 'var(--bg-primary)', 
                  border: 'none', borderRadius: '8px', padding: '10px 24px', 
                  fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem'
                }}>
                Fiyat Listesine Git
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default MyProfile;
