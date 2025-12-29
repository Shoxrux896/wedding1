import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortablePhoto({ photo, selected, onSelect, onDelete, onLightbox }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: photo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        borderRadius: '0',
        overflow: 'hidden',
        cursor: 'grab',
        border: selected ? '2px solid var(--color-black)' : '1px solid var(--color-gray-200)',
        boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.2)' : 'none',
        touchAction: 'none' // Important for touch devices
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => {
                // Prevent lightbox if clicking checkbox or delete
                if (!e.defaultPrevented) onLightbox(photo.url);
            }}
            {...attributes}
            {...listeners}
        >
            <img
                src={photo.url}
                alt="Photo"
                loading="lazy"
                style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    display: 'block',
                    pointerEvents: 'none' // Prevent image drag conflict
                }}
            />

            {/* Selection Checkbox */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onSelect(photo.id);
                }}
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    width: '24px',
                    height: '24px',
                    background: selected ? 'var(--color-black)' : 'var(--color-white)',
                    border: '1px solid var(--color-black)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                }}
            >
                {selected && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(photo.id);
                }}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'var(--color-white)',
                    color: 'var(--color-black)',
                    border: '1px solid var(--color-black)',
                    borderRadius: '0',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s'
                }}
            >
                ×
            </button>
        </div>
    );
}
