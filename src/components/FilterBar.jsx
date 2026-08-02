import { motion } from 'framer-motion';

const FilterBar = ({ brands, activeBrand, onFilter }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginBottom: '3rem',
      flexWrap: 'wrap'
    }}>
      {brands.map((brand, index) => (
        <motion.button
          key={brand}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilter(brand)}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '30px',
            border: activeBrand === brand 
              ? '1px solid var(--accent-primary)' 
              : '1px solid var(--glass-border)',
            background: activeBrand === brand 
              ? 'rgba(0, 240, 255, 0.1)' 
              : 'var(--glass-bg)',
            color: activeBrand === brand ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
        >
          {brand === 'All' ? 'Tüm Markalar' : brand}
        </motion.button>
      ))}
    </div>
  );
};

export default FilterBar;
