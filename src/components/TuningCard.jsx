import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

// Helper component for Sliders (Phase 3)
const VisualSlider = ({ value, min, max, labelLeft, labelRight }) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : min;
    const clampedValue = Math.max(min, Math.min(max, safeValue));
    const percentage = ((clampedValue - min) / (max - min)) * 100;

    return (
        <div className="slider-container" aria-hidden="true">
            <div className="slider-track">
                <div className="slider-thumb" style={{ left: `${percentage}%` }}></div>
            </div>
            {(labelLeft || labelRight) && (
                <div className="slider-labels">
                    <span>{labelLeft || min}</span>
                    <span>{labelRight || max}</span>
                </div>
            )}
        </div>
    );
};

// Helper component for Bar Charts (Phase 2)
const BarChart = ({ percentage }) => {
    const safePercent = typeof percentage === 'number' && !isNaN(percentage) ? percentage : 50;
    const clampedPercent = Math.max(0, Math.min(100, safePercent));
    return (
        <div className="bar-chart-wrapper" aria-hidden="true">
            <div className="bar-chart-fill" style={{ width: `${clampedPercent}%` }}></div>
        </div>
    );
};

/**
 * GenUI Interactive Component
 * This card renders natively INSIDE a message bubble when the Gemini API returns
 * a valid 'tuningData' JSON physics payload. 
 */
function TuningCard({ tuningData, onCompare }) {
    const cardRef = useRef(null);

    // Copy the raw JSON to clipboard for fast sharing
    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(tuningData, null, 2));
        alert('Tuning values copied to clipboard!');
    };

    // Export the tuning card to a PNG image (Phase 19)
    const exportImage = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, { backgroundColor: '#0f172a' }); // Using a dark Slate background to match theme
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `apextuning-${tuningData.targetClass || 'setup'}.png`;
            link.click();
        } catch (error) {
            console.error("Failed to export image:", error);
            alert("Failed to export image.");
        }
    };

    // Share a link to this setup (Phase 20)
    const shareLink = () => {
        try {
            const base64Data = btoa(JSON.stringify(tuningData));
            const url = `${window.location.origin}${window.location.pathname}?tune=${encodeURIComponent(base64Data)}`;
            navigator.clipboard.writeText(url);
            alert('Shareable link copied to clipboard!');
        } catch (err) {
            console.error('Failed to generate share link', err);
            alert('Failed to generate share link.');
        }
    };

    // Save to favorites (Phase 23)
    const saveFavorite = () => {
        const name = prompt("Enter a name for this setup:", `${tuningData.targetClass} ${tuningData.discipline || 'Tune'}`);
        if (name) {
            const existing = JSON.parse(localStorage.getItem('FAVORITE_TUNES') || '[]');
            existing.push({ name, tuningData });
            localStorage.setItem('FAVORITE_TUNES', JSON.stringify(existing));
            alert('Setup saved to Favorites!');
            window.dispatchEvent(new Event('favoritesUpdated'));
        }
    };

    if (!tuningData) return null;

    return (
        <div ref={cardRef} className="card animate-slide-up" style={{ padding: '1.5rem', marginTop: '0.5rem', backgroundColor: 'var(--bg-slate-primary)', border: '1px solid var(--border-slate)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-slate)', paddingBottom: '1rem' }}>
                <h3 className="header-title" style={{ margin: 0, fontSize: '1.2rem' }}>
                    Calculated Setup <span className="text-gold">[{tuningData.targetClass || "CLASS"}]</span>
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary" onClick={saveFavorite} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--accent-gold)' }} aria-label="Save to favorites">
                        ★ Save
                    </button>
                    {onCompare && (
                        <button className="btn-secondary" onClick={() => onCompare(tuningData)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} aria-label="Compare setup">
                            Compare
                        </button>
                    )}
                    <button className="btn-secondary" onClick={shareLink} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} aria-label="Share setup link">
                        Share Link
                    </button>
                    <button className="btn-secondary" onClick={exportImage} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} aria-label="Export setup to image">
                        Export Image
                    </button>
                    <button className="btn-secondary" onClick={copyToClipboard} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} aria-label="Copy setup to clipboard">
                        Copy Setup
                    </button>
                </div>
            </div>

            <div className="layout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>

                {/* TIRES */}
                <div className="panel-dark" style={{ padding: '1.25rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', marginTop: 0 }}>Tire Pressure (PSI)</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Front:</span>
                        <span className="text-gold font-bold">{tuningData.tires?.front?.toFixed(1) || "N/A"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Rear:</span>
                        <span className="text-gold font-bold">{tuningData.tires?.rear?.toFixed(1) || "N/A"}</span>
                    </div>
                </div>

                {/* ALIGNMENT */}
                <div className="panel-dark" style={{ padding: '1.25rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', marginTop: 0 }}>Alignment</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Camber F:</span> <span className="text-gold font-bold">{tuningData.alignment?.camberFront?.toFixed(1) || "N/A"}°</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Camber R:</span> <span className="text-gold font-bold">{tuningData.alignment?.camberRear?.toFixed(1) || "N/A"}°</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Toe F:</span> <span className="text-gold font-bold">{tuningData.alignment?.toeFront?.toFixed(1) || "N/A"}°</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Toe R:</span> <span className="text-gold font-bold">{tuningData.alignment?.toeRear?.toFixed(1) || "N/A"}°</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Caster:</span> <span className="text-gold font-bold">{tuningData.alignment?.caster?.toFixed(1) || "N/A"}°</span></div>
                </div>

                {/* ARBS */}
                <div className="panel-dark" style={{ padding: '1.25rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', marginTop: 0 }}>Anti-Roll Bars</h4>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Front:</span>
                            <span className="text-gold font-bold">{tuningData.arbs?.front?.toFixed(1) || "N/A"}</span>
                        </div>
                        <VisualSlider value={tuningData.arbs?.front} min={1} max={65} labelLeft="Soft" labelRight="Stiff" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Rear:</span>
                            <span className="text-gold font-bold">{tuningData.arbs?.rear?.toFixed(1) || "N/A"}</span>
                        </div>
                        <VisualSlider value={tuningData.arbs?.rear} min={1} max={65} labelLeft="Soft" labelRight="Stiff" />
                    </div>
                </div>

                {/* SPRINGS & RIDE HEIGHT */}
                <div className="panel-dark" style={{ padding: '1.25rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', marginTop: 0 }}>Springs & Height</h4>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Springs F:</span> <span className="text-gold font-bold">{tuningData.springs?.front?.toFixed(1) || "N/A"}</span></div>
                        <VisualSlider value={tuningData.springs?.front} min={150} max={1200} labelLeft="Soft" labelRight="Stiff" />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Springs R:</span> <span className="text-gold font-bold">{tuningData.springs?.rear?.toFixed(1) || "N/A"}</span></div>
                        <VisualSlider value={tuningData.springs?.rear} min={150} max={1200} labelLeft="Soft" labelRight="Stiff" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Height F:</span> <span className="text-gold font-bold">{tuningData.springs?.rideHeightFront || "N/A"}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Height R:</span> <span className="text-gold font-bold">{tuningData.springs?.rideHeightRear || "N/A"}</span></div>
                </div>

                {/* DAMPING */}
                <div className="panel-dark" style={{ padding: '1.25rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', marginTop: 0 }}>Damping</h4>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rebound F:</span> <span className="text-gold font-bold">{tuningData.damping?.reboundFront?.toFixed(1) || "N/A"}</span></div>
                        <VisualSlider value={tuningData.damping?.reboundFront} min={1} max={20} labelLeft="Soft" labelRight="Stiff" />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rebound R:</span> <span className="text-gold font-bold">{tuningData.damping?.reboundRear?.toFixed(1) || "N/A"}</span></div>
                        <VisualSlider value={tuningData.damping?.reboundRear} min={1} max={20} labelLeft="Soft" labelRight="Stiff" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Bump F:</span> <span className="text-gold font-bold">{tuningData.damping?.bumpFront?.toFixed(1) || "N/A"}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bump R:</span> <span className="text-gold font-bold">{tuningData.damping?.bumpRear?.toFixed(1) || "N/A"}</span></div>
                </div>

                {/* AERO & BRAKES */}
                <div className="panel-dark" style={{ padding: '1.25rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', marginTop: 0 }}>Aero & Brakes</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Aero F:</span> <span className="text-gold font-bold">{tuningData.aero?.front || "N/A"}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><span>Aero R:</span> <span className="text-gold font-bold">{tuningData.aero?.rear || "N/A"}</span></div>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Brake Bias:</span> <span className="text-gold font-bold">{tuningData.brake?.bias || "N/A"}%</span></div>
                        <BarChart percentage={tuningData.brake?.bias} />
                        <div className="slider-labels" style={{ marginTop: '0.25rem' }}>
                            <span>Rear</span>
                            <span>Front</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pressure:</span> <span className="text-gold font-bold">{tuningData.brake?.pressure || "N/A"}%</span></div>
                </div>

                {/* DIFFERENTIAL */}
                <div className="panel-dark" style={{ padding: '1.25rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', marginTop: 0 }}>Differential</h4>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Accel (R):</span> <span className="text-gold font-bold">{tuningData.diff?.accel || "N/A"}%</span></div>
                        <BarChart percentage={tuningData.diff?.accel} />
                        <div className="slider-labels" style={{ marginTop: '0.25rem' }}>
                            <span>Open</span>
                            <span>Locked</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Decel (R):</span> <span className="text-gold font-bold">{tuningData.diff?.decel || "N/A"}%</span></div>
                        <BarChart percentage={tuningData.diff?.decel} />
                        <div className="slider-labels" style={{ marginTop: '0.25rem' }}>
                            <span>Open</span>
                            <span>Locked</span>
                        </div>
                    </div>

                    {tuningData.diff?.center !== undefined && (
                        <div style={{ borderTop: '1px solid var(--border-slate)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Center Balance:</span> <span className="text-gold font-bold">{tuningData.diff?.center}%</span>
                            </div>
                            <BarChart percentage={tuningData.diff?.center} />
                            <div className="slider-labels" style={{ marginTop: '0.25rem' }}>
                                <span>Rear</span>
                                <span>Front</span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Discipline: {tuningData.discipline || "Unknown"}
            </div>
        </div>
    );
}

export default TuningCard;
