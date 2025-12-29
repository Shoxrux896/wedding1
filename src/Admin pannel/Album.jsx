
import { CATEGORIES } from '../categoriesConfig';

export function AlbumFilter({ selectedCategory = null, onCategorySelect }) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onCategorySelect?.(cat.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '0',
              border: isActive ? '1px solid var(--color-black)' : '1px solid var(--color-gray-300)',
              background: isActive ? 'var(--color-black)' : 'var(--color-white)',
              color: isActive ? 'var(--color-white)' : 'var(--color-black)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.target.style.borderColor = 'var(--color-black)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.target.style.borderColor = 'var(--color-gray-300)';
              }
            }}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}