import React from 'react';
import TuningCard from './TuningCard';

function ComparisonModal({ queue, onClose, onRemove }) {
    if (!queue || queue.length === 0) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            zIndex: 100, display: 'flex', flexDirection: 'column',
            padding: '2rem', overflowY: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Telemetry Comparison</h2>
                <button onClick={onClose} style={{
                    background: 'none', border: '1px solid var(--border-slate)', color: 'var(--text-secondary)',
                    padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px'
                }}>Close Comparison</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${queue.length}, 1fr)`, gap: '2rem', alignItems: 'start' }}>
                {queue.map((tune, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                        <button
                            onClick={() => onRemove(idx)}
                            style={{
                                position: 'absolute', top: -15, right: -15, zIndex: 10,
                                background: 'var(--accent-gold)', color: '#000', border: 'none',
                                width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                            title="Remove from comparison"
                        >×</button>
                        <TuningCard tuningData={tune} />
                    </div>
                ))}
            </div>

            {queue.length === 1 && (
                <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>
                    Add another setup from the chat to compare side-by-side.
                </div>
            )}
        </div>
    );
}

export default ComparisonModal;
