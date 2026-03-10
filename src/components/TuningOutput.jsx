import { useState } from 'react';

// Basic Loader Animation Styles
const loaderStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '400px',
    color: 'var(--accent-gold)'
};

const spinnerStyle = {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(249, 171, 0, 0.2)',
    borderTop: '4px solid var(--accent-gold)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
};

function TuningOutput({ tuningData, isLoading }) {
    const [copyStatus, setCopyStatus] = useState('Copy to Clipboard');

    const handleCopy = () => {
        if (!tuningData || tuningData.placeholder) return;

        // Convert current tuningData object into a formatted string block
        const textToCopy = JSON.stringify(tuningData, null, 2);

        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy to Clipboard'), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            setCopyStatus('Failed to Copy');
        });
    };

    // 1. Loading State
    if (isLoading) {
        return (
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 className="header-title">Computed Tune</h2>
                <div className="header-accent"></div>
                <div style={loaderStyle}>
                    <style>
                        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}
                    </style>
                    <div style={spinnerStyle}></div>
                    <p style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', fontWeight: 500 }}>
                        Analyzing Physics Engine...
                    </p>
                </div>
            </div>
        );
    }

    // 2. Empty State
    if (!tuningData) {
        return (
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 className="header-title">Computed Tune</h2>
                <div className="header-accent"></div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '400px',
                    color: 'var(--border-slate)',
                    textAlign: 'center'
                }}>
                    {/* Wireframe Car Placeholder Icon (SVG) */}
                    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1.5rem', opacity: 0.5 }}>
                        <path d="M15 40C15 45.5228 19.4772 50 25 50C30.5228 50 35 45.5228 35 40C35 34.4772 30.5228 30 25 30C19.4772 30 15 34.4772 15 40Z" stroke="currentColor" strokeWidth="3" />
                        <path d="M85 40C85 45.5228 89.4772 50 95 50C100.52 50 105 45.5228 105 40C105 34.4772 100.52 30 95 30C89.4772 30 85 34.4772 85 40Z" stroke="currentColor" strokeWidth="3" />
                        <path d="M15 40H5C3.89543 40 3 39.1046 3 38V28.0931C3 26.6961 3.73145 25.4057 4.90807 24.7334L25 13.251C26.5413 12.3702 28.2831 11.9211 30.0632 11.9542L70.4705 12.7058C72.8447 12.7499 75.1432 13.5284 77.086 14.938L112.553 40.669A4 4 0 0 1 110.207 48H105" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        <path d="M35 40H85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        <path d="M48 12.5V30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        <path d="M78 16V30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <p style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Awaiting Vehicle Telemetry...</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Enter baseline stats and target configuration to begin.</p>
                </div>
            </div>
        );
    }

    // 2.5 Error State
    if (tuningData.error) {
        return (
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 className="header-title">Computed Tune</h2>
                <div className="header-accent" style={{ backgroundColor: 'var(--error)' }}></div>
                <div style={{ color: 'var(--error)', padding: '2rem', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Compilation Error</h3>
                    <p>{tuningData.message}</p>
                </div>
            </div>
        )
    }

    // 3. Populated State (Live API Response Parsing)
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 className="header-title">Computed Tune</h2>
                    <div className="header-accent"></div>
                </div>
                <span className="badge badge-gold">
                    {tuningData?.targetClass || "CLASS"} - {tuningData?.discipline || "DISCIPLINE"}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', flex: 1, overflowY: 'auto' }}>

                <div className="tune-category">
                    <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-slate)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Tires (PSI)</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Front:</span> <strong className="text-gold">{tuningData?.tires?.front || 'N/A'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rear:</span> <strong className="text-gold">{tuningData?.tires?.rear || 'N/A'}</strong></div>
                </div>

                <div className="tune-category">
                    <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-slate)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Alignment</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>F Camber:</span> <strong className="text-gold">{tuningData?.alignment?.camberFront || '0'}&deg;</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>R Camber:</span> <strong className="text-gold">{tuningData?.alignment?.camberRear || '0'}&deg;</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Toe:</span> <strong className="text-gold">{tuningData?.alignment?.toeFront || '0'}&deg;</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Caster:</span> <strong className="text-gold">{tuningData?.alignment?.caster || '0'}&deg;</strong></div>
                </div>

                <div className="tune-category">
                    <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-slate)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Anti-Roll Bars</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Front:</span> <strong className="text-gold">{tuningData?.arbs?.front || '0'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rear:</span> <strong className="text-gold">{tuningData?.arbs?.rear || '0'}</strong></div>
                </div>

                <div className="tune-category">
                    <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-slate)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Springs</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Front Rate:</span> <strong className="text-gold">{tuningData?.springs?.front || '0'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Rear Rate:</span> <strong className="text-gold">{tuningData?.springs?.rear || '0'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>F Ride HT:</span> <strong className="text-gold">{tuningData?.springs?.rideHeightFront || '0'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>R Ride HT:</span> <strong className="text-gold">{tuningData?.springs?.rideHeightRear || '0'}</strong></div>
                </div>

                <div className="tune-category">
                    <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-slate)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Damping</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>F Rebound:</span> <strong className="text-gold">{tuningData?.damping?.reboundFront || '0'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>R Rebound:</span> <strong className="text-gold">{tuningData?.damping?.reboundRear || '0'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>F Bump:</span> <strong className="text-gold">{tuningData?.damping?.bumpFront || '0'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>R Bump:</span> <strong className="text-gold">{tuningData?.damping?.bumpRear || '0'}</strong></div>
                </div>

                <div className="tune-category">
                    <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-slate)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Aero & Brake</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Front Aero:</span> <strong className="text-gold">{tuningData?.aero?.front || 'N/A'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Rear Aero:</span> <strong className="text-gold">{tuningData?.aero?.rear || 'N/A'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Brake Bal:</span> <strong className="text-gold">{tuningData?.brake?.bias || '50'}%</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pressure:</span> <strong className="text-gold">{tuningData?.brake?.pressure || '100'}%</strong></div>
                </div>

                <div className="tune-category">
                    <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-slate)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Differential</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Accel:</span> <strong className="text-gold">{tuningData?.diff?.accel || '0'}%</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Decel:</span> <strong className="text-gold">{tuningData?.diff?.decel || '0'}%</strong></div>
                    {tuningData?.diff?.center && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}><span>Center:</span> <strong className="text-gold">{tuningData.diff.center}%</strong></div>
                    )}
                </div>

            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-slate)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={handleCopy}>
                    <svg style={{ width: '18px', height: '18px', fill: 'var(--accent-gold)' }} viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                    </svg>
                    {copyStatus}
                </button>
            </div>
        </div>
    );
}

export default TuningOutput;
