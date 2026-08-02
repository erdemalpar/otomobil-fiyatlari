import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

const FilterSection = ({ title, options, selectedOptions, onChange }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOption = (option) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter(o => o !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  const isAllSelected = options.length > 0 && selectedOptions.length === options.length;

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  if (options.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          marginBottom: isOpen ? '1rem' : '0'
        }}
      >
        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{title}</h4>
        {isOpen ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div 
                onClick={toggleAll}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  color: isAllSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  transition: 'color 0.2s',
                  marginBottom: '0.5rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--glass-border)'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: `1px solid ${isAllSelected ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                  background: isAllSelected ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  {isAllSelected && <Check size={14} color="var(--accent-primary)" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Tümünü Seç</span>
              </div>
              {options.map((option) => {
                const isSelected = selectedOptions.includes(option);
                return (
                  <div 
                    key={option} 
                    onClick={() => toggleOption(option)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      cursor: 'pointer',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      transition: 'color 0.2s'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                      background: isSelected ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}>
                      {isSelected && <Check size={14} color="var(--accent-primary)" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '0.95rem' }}>{option}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ 
  isOpen, 
  onToggle, 
  vehicles, 
  selectedBrands, 
  setSelectedBrands,
  selectedModels,
  setSelectedModels,
  selectedVersions,
  setSelectedVersions
}) => {
  // Benzersiz verileri hesaplama
  const allBrands = [...new Set(vehicles.map(v => v.brand))].sort();
  
  // Seçili markalara göre modelleri filtrele
  const availableModels = [...new Set(
    vehicles
      .filter(v => selectedBrands.length === 0 || selectedBrands.includes(v.brand))
      .map(v => v.model)
  )].sort();

  // Seçili markalar ve modellere göre versiyonları (alt modeller) filtrele
  const availableVersions = [...new Set(
    vehicles
      .filter(v => selectedBrands.length === 0 || selectedBrands.includes(v.brand))
      .filter(v => selectedModels.length === 0 || selectedModels.includes(v.model))
      .map(v => v.version)
  )].sort();

  const handleBrandChange = (brands) => {
    setSelectedBrands(brands);
    // Marka değiştiğinde, eğer seçili olan modeller/versiyonlar artık listede yoksa, temizle
    setSelectedModels([]);
    setSelectedVersions([]);
  };

  const handleModelChange = (models) => {
    setSelectedModels(models);
    setSelectedVersions([]);
  };

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedModels([]);
    setSelectedVersions([]);
  };

  const hasFilters = selectedBrands.length > 0 || selectedModels.length > 0 || selectedVersions.length > 0;

  return (
    <>
      {/* Mobil Karartma Arkaplanı */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="sidebar-overlay"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 90,
            }}
          />
        )}
      </AnimatePresence>

      {/* Yan Çubuk (Sidebar) Container */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '320px',
          maxWidth: '85vw',
          zIndex: 100,
          display: 'flex',
        }}
      >
        {/* Sidebar İçerik Alanı */}
        <div 
          className="glass"
          style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRight: '1px solid var(--glass-border)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
            position: 'relative',
            zIndex: 101
          }}
        >
          <div style={{ 
            padding: '1.5rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid var(--glass-border)'
          }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>Nokta Atışı Arama</h2>
          </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          
          <FilterSection 
            title="Marka" 
            options={allBrands} 
            selectedOptions={selectedBrands} 
            onChange={handleBrandChange} 
          />
          <AnimatePresence>
            {selectedBrands.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <FilterSection 
                  title="Model" 
                  options={availableModels} 
                  selectedOptions={selectedModels} 
                  onChange={handleModelChange} 
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {selectedBrands.length > 0 && selectedModels.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <FilterSection 
                  title="Alt Model (Versiyon)" 
                  options={availableVersions} 
                  selectedOptions={selectedVersions} 
                  onChange={setSelectedVersions} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {hasFilters && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
            <button
              onClick={clearAll}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '12px',
                background: 'rgba(255, 0, 60, 0.1)',
                border: '1px solid var(--accent-secondary)',
                color: 'var(--accent-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
        </div>

        {/* Dışarı Taşan Açma/Kapama Butonu */}
        <button
          onClick={onToggle}
          style={{
            position: 'absolute',
            right: '-48px', // Genişliği kadar dışarıda
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '96px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderLeft: 'none',
            borderRadius: '0 16px 16px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            boxShadow: '4px 0 15px rgba(0,0,0,0.3)',
            zIndex: 100,
            backdropFilter: 'blur(12px)'
          }}
        >
          {isOpen ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
        </button>
      </motion.div>
    </>
  );
};

export default Sidebar;
