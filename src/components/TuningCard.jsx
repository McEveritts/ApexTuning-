import React from 'react';

/**
 * GenUI Interactive Component
 * This card renders natively INSIDE a message bubble when the Gemini API returns
 * a valid 'tuningData' JSON physics payload. 
 */
function TuningCard({ tuningData }) {

    // Helper to format 1st, 2nd, 3rd, 4th, etc.
    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // Copy the raw JSON to clipboard for fast sharing
    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(tuningData, null, 2));
        alert('Tuning values copied to clipboard!');
    };

    // Helper to render rationale text if it exists
    const renderRationale = (rationaleText) => {
        if (!rationaleText) return null;
        return (
            <div style={{
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.85rem',
                color: 'var(--text-tertiary)',
                fontStyle: 'italic',
                lineHeight: '1.4'
            }}>
                "{rationaleText}"
            </div>
        );
    };

    if (!tuningData) return null;

    return (
        <div className="card" style={{ padding: '1.5rem', marginTop: '0.5rem', backgroundColor: 'var(--bg-slate-primary)', border: '1px solid var(--border-slate)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-slate)', paddingBottom: '1rem' }}>
                <h3 className="header-title" style={{ margin: 0, fontSize: '1.2rem' }}>
                    Calculated Setup <span className="text-gold">[{tuningData.targetClass || "CLASS"}]</span>
                </h3>
                <button className="btn-secondary" onClick={copyToClipboard} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                    Copy Setup
                </button>
            </div>

            {/* REQUIRED UPGRADES / PARTS LIST */}
            {tuningData.upgrades && (
                <div className="panel-dark" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-gold)' }}>
                    <h4 style={{ color: 'var(--text-gold)', marginBottom: '1rem', marginTop: 0, fontSize: '1.1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem' }}>Required Upgrades / Build Sheet</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {tuningData.upgrades.engine && <div><span style={{ color: 'var(--text-secondary)' }}>Engine:</span> <span className="font-bold">{tuningData.upgrades.engine}</span></div>}
                        {tuningData.upgrades.aspiration && <div><span style={{ color: 'var(--text-secondary)' }}>Aspiration:</span> <span className="font-bold">{tuningData.upgrades.aspiration}</span></div>}
                        {tuningData.upgrades.tires && <div><span style={{ color: 'var(--text-secondary)' }}>Tires:</span> <span className="font-bold">{tuningData.upgrades.tires}</span></div>}
                        {tuningData.upgrades.transmission && <div><span style={{ color: 'var(--text-secondary)' }}>Transmission:</span> <span className="font-bold">{tuningData.upgrades.transmission}</span></div>}
                        {tuningData.upgrades.differential && <div><span style={{ color: 'var(--text-secondary)' }}>Differential:</span> <span className="font-bold">{tuningData.upgrades.differential}</span></div>}
                        {tuningData.upgrades.suspension && <div><span style={{ color: 'var(--text-secondary)' }}>Suspension:</span> <span className="font-bold">{tuningData.upgrades.suspension}</span></div>}
                        {tuningData.upgrades.arbs && <div><span style={{ color: 'var(--text-secondary)' }}>ARBs:</span> <span className="font-bold">{tuningData.upgrades.arbs}</span></div>}
                        {tuningData.upgrades.aero && <div><span style={{ color: 'var(--text-secondary)' }}>Aero:</span> <span className="font-bold">{tuningData.upgrades.aero}</span></div>}
                        {tuningData.upgrades.weightReduction && <div><span style={{ color: 'var(--text-secondary)' }}>Weight Reduction:</span> <span className="font-bold">{tuningData.upgrades.weightReduction}</span></div>}
                    </div>
                </div>
            )}

            <div className="layout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

                {/* TIRES */}
                <div className="panel-dark" style={{ padding: '1rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0 }}>Tire Pressure (PSI)</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Front:</span>
                        <span className="text-gold font-bold">{tuningData.tires?.front?.toFixed(1) || "N/A"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Rear:</span>
                        <span className="text-gold font-bold">{tuningData.tires?.rear?.toFixed(1) || "N/A"}</span>
                    </div>
                    {renderRationale(tuningData.rationales?.tires)}
                </div>

                {/* ALIGNMENT */}
                <div className="panel-dark" style={{ padding: '1rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0 }}>Alignment</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Camber F:</span> <span className="text-gold font-bold">{tuningData.alignment?.camberFront?.toFixed(1) || "N/A"}°</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Camber R:</span> <span className="text-gold font-bold">{tuningData.alignment?.camberRear?.toFixed(1) || "N/A"}°</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Toe F:</span> <span className="text-gold font-bold">{tuningData.alignment?.toeFront?.toFixed(1) || "N/A"}°</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Toe R:</span> <span className="text-gold font-bold">{tuningData.alignment?.toeRear?.toFixed(1) || "N/A"}°</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Caster:</span> <span className="text-gold font-bold">{tuningData.alignment?.caster?.toFixed(1) || "N/A"}°</span></div>
                    {renderRationale(tuningData.rationales?.alignment)}
                </div>

                {/* ARBS */}
                <div className="panel-dark" style={{ padding: '1rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0 }}>Anti-Roll Bars</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Front:</span>
                        <span className="text-gold font-bold">{tuningData.arbs?.front?.toFixed(1) || "N/A"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Rear:</span>
                        <span className="text-gold font-bold">{tuningData.arbs?.rear?.toFixed(1) || "N/A"}</span>
                    </div>
                    {renderRationale(tuningData.rationales?.arbs)}
                </div>

                {/* SPRINGS & RIDE HEIGHT */}
                <div className="panel-dark" style={{ padding: '1rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0 }}>Springs & Height</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Springs F:</span> <span className="text-gold font-bold">{tuningData.springs?.front?.toFixed(1) || "N/A"}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Springs R:</span> <span className="text-gold font-bold">{tuningData.springs?.rear?.toFixed(1) || "N/A"}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Height F:</span> <span className="text-gold font-bold">{tuningData.springs?.rideHeightFront || "N/A"}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Height R:</span> <span className="text-gold font-bold">{tuningData.springs?.rideHeightRear || "N/A"}</span></div>
                    {renderRationale(tuningData.rationales?.springs)}
                </div>

                {/* DAMPING */}
                <div className="panel-dark" style={{ padding: '1rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0 }}>Damping</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rebound F:</span> <span className="text-gold font-bold">{tuningData.damping?.reboundFront?.toFixed(1) || "N/A"}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rebound R:</span> <span className="text-gold font-bold">{tuningData.damping?.reboundRear?.toFixed(1) || "N/A"}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bump F:</span> <span className="text-gold font-bold">{tuningData.damping?.bumpFront?.toFixed(1) || "N/A"}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bump R:</span> <span className="text-gold font-bold">{tuningData.damping?.bumpRear?.toFixed(1) || "N/A"}</span></div>
                    {renderRationale(tuningData.rationales?.damping)}
                </div>

                {/* AERO & BRAKES */}
                <div className="panel-dark" style={{ padding: '1rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0 }}>Aero & Brakes</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Aero F:</span> <span className="text-gold font-bold">{tuningData.aero?.front || "N/A"}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Aero R:</span> <span className="text-gold font-bold">{tuningData.aero?.rear || "N/A"}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}><span>Brake Bias:</span> <span className="text-gold font-bold">{tuningData.brake?.bias || "N/A"}%</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pressure:</span> <span className="text-gold font-bold">{tuningData.brake?.pressure || "N/A"}%</span></div>
                    {renderRationale(tuningData.rationales?.aero)}
                </div>

                {/* DYNAMIC GEARING */}
                {tuningData.gearing && tuningData.gearing.ratios && tuningData.gearing.ratios.length > 0 && (
                    <div className="panel-dark" style={{ padding: '1rem' }}>
                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0 }}>Gearing</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-slate)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                            <span>Final Drive:</span>
                            <span className="text-gold font-bold">{tuningData.gearing.finalDrive?.toFixed(2) || "N/A"}</span>
                        </div>
                        {tuningData.gearing.ratios.map((ratio, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{getOrdinal(index + 1)} Gear:</span>
                                <span className="text-gold font-bold">{ratio?.toFixed(2) || "N/A"}</span>
                            </div>
                        ))}
                        {renderRationale(tuningData.rationales?.gearing)}
                    </div>
                )}

                {/* DIFFERENTIAL */}
                <div className="panel-dark" style={{ padding: '1rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0 }}>Differential</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Accel (R):</span> <span className="text-gold font-bold">{tuningData.diff?.accel || "N/A"}%</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Decel (R):</span> <span className="text-gold font-bold">{tuningData.diff?.decel || "N/A"}%</span></div>
                    {tuningData.diff?.center !== undefined && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-slate)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
                            <span>Center Balance:</span> <span className="text-gold font-bold">{tuningData.diff?.center}%</span>
                        </div>
                    )}
                    {renderRationale(tuningData.rationales?.diff)}
                </div>

            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Discipline: {tuningData.discipline || "Unknown"}
            </div>
        </div>
    );
}

export default TuningCard;
