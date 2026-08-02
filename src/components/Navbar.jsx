import { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Copy, Check, X, Home, List, BarChart2, ArrowLeftRight, Lightbulb, User, Zap, Bell, Settings, Heart, Target, Crosshair, Tag, Network, Clock, Calculator } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Navbar = ({ filteredVehicles, copyLink, activeTab = 'list' }) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIntelOpen, setIsIntelOpen] = useState(false);
  const intelRef = useRef(null);

  const { favorites, compares } = useContext(AppContext);
  const favoritesCount = favorites.size;
  const comparesCount = compares.size;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (intelRef.current && !intelRef.current.contains(event.target)) {
        setIsIntelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uniqueList = filteredVehicles 
    ? [...new Set(filteredVehicles.map(v => `${v.brand}\t${v.model}`))]
    : [];
    
  const textData = uniqueList
    .sort((a, b) => a.localeCompare(b))
    .join('\n');

  const handleCopy = () => {
    if (!textData) return;
    
    navigator.clipboard.writeText(textData).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsModalOpen(false); // Kopyalandıktan sonra modalı kapat
      }, 1500);
    });
  };
  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      padding: '1rem 2rem',
      borderBottom: '1px solid var(--glass-border)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 0
      }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => window.location.reload()}
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary), #0055ff)',
            padding: '0.5rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Car size={24} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '1px' }}>
            AUTO<span style={{ color: 'var(--accent-primary)' }}>PRICE</span>
          </span>
        </motion.div>

        {/* ORTA MENÜ */}
        <div className="hide-on-mobile" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: activeTab === 'home' ? 'var(--accent-primary)' : 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: activeTab === 'home' ? 'bold' : 'normal' }}>
            <Home size={16} /> Ana Sayfa
          </Link>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: activeTab === 'list' ? 'var(--accent-primary)' : 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: activeTab === 'list' ? 'bold' : 'normal' }}>
            <List size={16} /> Fiyat Listesi
          </Link>
          <Link to="/statistics" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: activeTab === 'stats' ? 'var(--accent-primary)' : 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: activeTab === 'stats' ? 'bold' : 'normal' }}>
            <BarChart2 size={16} /> İstatistikler
          </Link>
          <Link to="/compare" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: activeTab === 'compare' ? 'var(--accent-primary)' : 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', position: 'relative', fontWeight: activeTab === 'compare' ? 'bold' : 'normal' }}>
            <ArrowLeftRight size={16} /> Karşılaştırma
            {comparesCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#ff4757', color: 'white', fontSize: '10px', borderRadius: '10px', padding: '2px 6px', fontWeight: 'bold' }}>{comparesCount}</span>
            )}
          </Link>
          <Link to="#" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>
            <Lightbulb size={16} /> Analizler
          </Link>
          <Link to="/my-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: activeTab === 'profile' ? 'var(--accent-primary)' : 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: activeTab === 'profile' ? 'bold' : 'normal' }}>
            <User size={16} /> Benim
          </Link>
          
          {/* INTEL MODU DROPDOWN */}
          <div ref={intelRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsIntelOpen(!isIntelOpen)}
              style={{ 
                background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', 
                color: isIntelOpen ? 'var(--accent-primary)' : 'var(--text-secondary)', 
                textDecoration: 'none', fontSize: '0.85rem', cursor: 'pointer',
                fontWeight: isIntelOpen ? 'bold' : 'normal',
                paddingBottom: '0.5rem', borderBottom: isIntelOpen ? '2px solid var(--accent-primary)' : '2px solid transparent'
              }}>
              <Zap size={16} /> Intel Modu
            </button>

            <AnimatePresence>
              {isIntelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                    background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    width: '200px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px',
                    border: '1px solid #eaeaea', zIndex: 100
                  }}
                >
                  <Link to="#" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.9rem', background: 'rgba(0, 85, 255, 0.05)', fontWeight: 'bold' }}>
                    <Zap size={16} /> Piyasa Nabzi
                  </Link>
                  <Link to="#" className="dropdown-item hoverable-item">
                    <Target size={16} /> Konumlandirma
                  </Link>
                  <Link to="#" className="dropdown-item hoverable-item">
                    <Crosshair size={16} /> Bosluk Bulucu
                  </Link>
                  <Link to="#" className="dropdown-item hoverable-item">
                    <Tag size={16} /> Promosyonlar
                  </Link>
                  <Link to="#" className="dropdown-item hoverable-item">
                    <Network size={16} /> Fiyat Mimarisi
                  </Link>
                  <Link to="#" className="dropdown-item hoverable-item">
                    <Clock size={16} /> Yasam Dongusu
                  </Link>
                  <Link to="#" className="dropdown-item hoverable-item">
                    <Bell size={16} /> Uyarilar
                  </Link>
                  <Link to="#" className="dropdown-item hoverable-item">
                    <Calculator size={16} /> TCO Hesaplayici
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SAĞ İKONLAR VE YENİLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* İKONLAR */}
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRight: '1px solid var(--glass-border)', paddingRight: '1rem' }}>
            <Bell size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
            
            <Link to="/compare" style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Heart size={20} color={activeTab === 'compare' ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
              {favoritesCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#ff4757', color: 'white', fontSize: '10px', borderRadius: '10px', padding: '2px 5px', fontWeight: 'bold' }}>{favoritesCount}</span>
              )}
            </Link>
            
            <Settings size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
          </div>

          {filteredVehicles && filteredVehicles.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="glass-button hide-on-mobile"
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '6px 12px',
                fontSize: '0.85rem'
              }}
            >
              <Copy size={14} /> <span className="hide-on-mobile">Listeyi Kopyala ({filteredVehicles.length})</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="date" disabled value={new Date().toISOString().split('T')[0]} className="glass-select" style={{ color: 'var(--text-primary)', padding: '6px 12px', fontSize: '0.85rem', borderRadius: '8px' }} />
            </div>

            <button className="glass-button" onClick={() => window.location.reload()} style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '8px' }}>Yenile</button>
          </div>
        </div>
      </div>

      {/* Kopyalama Modalı */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999, 
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px',
                border: '1px solid var(--glass-border)', width: '90%', maxWidth: '600px',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: '1rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>Kopyalanacak Araç Listesi</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={24} />
                </button>
              </div>
              
              <textarea 
                readOnly 
                value={textData}
                style={{ 
                  width: '100%', flex: 1, minHeight: '300px', background: 'rgba(0,0,0,0.4)', color: '#00ff64', 
                  padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', 
                  resize: 'none', fontFamily: 'monospace', fontSize: '0.9rem', outline: 'none'
                }} 
              />
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer', transition: 'background 0.3s' }}>
                  İptal
                </button>
                <button onClick={handleCopy} style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', background: 'var(--accent-primary)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Kopyalandı!' : 'Panoya Kopyala'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </nav>
  );
};

export default Navbar;
