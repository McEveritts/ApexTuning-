import React, { useState, useEffect } from 'react';

function SettingsPanel({ onClearChat }) {
    // Section 1: API Configuration
    const [apiKey, setApiKey] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [apiStatus, setApiStatus] = useState({ type: 'initial', message: '' });
    const [isSaved, setIsSaved] = useState(false);

    // Section 2: Tuning Preferences
    const [unitSystem, setUnitSystem] = useState('imperial'); // 'imperial' or 'metric'
    const [defaultDiscipline, setDefaultDiscipline] = useState('street');

    useEffect(() => {
        // Load global preferences
        const savedKey = localStorage.getItem('GEMINI_API_KEY');
        const savedUnits = localStorage.getItem('PREF_UNIT_SYSTEM') || 'imperial';
        const savedDiscipline = localStorage.getItem('PREF_DEFAULT_DISCIPLINE') || 'street';

        if (savedKey) {
            setApiKey(savedKey);
            setIsSaved(true);
            setApiStatus({ type: 'success', message: 'API Key Configured' });
        }

        setUnitSystem(savedUnits);
        setDefaultDiscipline(savedDiscipline);
    }, []);

    // --- API Handlers ---
    const handleTestConnection = async () => {
        if (!apiKey.trim()) {
            setApiStatus({ type: 'error', message: 'Please enter an API key to test.' });
            return;
        }

        setIsTesting(true);
        setApiStatus({ type: 'initial', message: '' });
        setIsSaved(false);

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
            if (response.ok) {
                setApiStatus({ type: 'success', message: 'API Key Valid' });
            } else {
                setApiStatus({ type: 'error', message: 'Invalid API Key or Error' });
            }
        } catch (error) {
            setApiStatus({ type: 'error', message: 'Network error or unable to reach API' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveApi = () => {
        if (apiStatus.type === 'success') {
            localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
            setIsSaved(true);
        }
    };

    const handleClearApi = () => {
        localStorage.removeItem('GEMINI_API_KEY');
        setApiKey('');
        setApiStatus({ type: 'initial', message: '' });
        setIsSaved(false);
    };

    // --- Preference Handlers ---
    const handleUnitChange = (e) => {
        const val = e.target.value;
        setUnitSystem(val);
        localStorage.setItem('PREF_UNIT_SYSTEM', val);
    };

    const handleDisciplineChange = (e) => {
        const val = e.target.value;
        setDefaultDiscipline(val);
        localStorage.setItem('PREF_DEFAULT_DISCIPLINE', val);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>

            {/* Section 1: API Configuration */}
            <div className="panel-dark">
                <h3 style={{ marginBottom: '1rem', marginTop: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Connection & API</h3>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => {
                            setApiKey(e.target.value);
                            if (apiStatus.type === 'success' && !isSaved) setApiStatus({ type: 'initial', message: '' });
                        }}
                        placeholder="Enter your GEMINI_API_KEY"
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button type="button" className="btn-secondary" onClick={handleTestConnection} disabled={isTesting || !apiKey}>
                        {isTesting ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={handleSaveApi} disabled={apiStatus.type !== 'success' || isSaved} style={apiStatus.type === 'success' && !isSaved ? { borderColor: 'var(--success)', color: 'var(--success)' } : {}}>
                        {isSaved ? 'Saved' : 'Save Key'}
                    </button>
                    {isSaved && (
                        <button type="button" className="btn-secondary" onClick={handleClearApi} style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'transparent', marginLeft: 'auto' }}>
                            Clear
                        </button>
                    )}
                </div>
                {apiStatus.message && (
                    <div style={{ marginTop: '1rem' }}>
                        {apiStatus.type === 'success' && <span className="badge badge-success">{apiStatus.message}</span>}
                        {apiStatus.type === 'error' && <span className="badge badge-error">{apiStatus.message}</span>}
                    </div>
                )}
            </div>

            {/* Section 2: Tuning Preferences */}
            <div className="panel-dark">
                <h3 style={{ marginBottom: '1rem', marginTop: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Tuning Preferences</h3>

                <div className="form-group">
                    <label>Measurement Unit System</label>
                    <select value={unitSystem} onChange={handleUnitChange} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-slate-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-slate)', borderRadius: '4px' }}>
                        <option value="imperial">Imperial (Lbs, HP, PSI)</option>
                        <option value="metric">Metric (Kg, kW, Bar)</option>
                    </select>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Default Disicipline Alignment</label>
                    <select value={defaultDiscipline} onChange={handleDisciplineChange} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-slate-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-slate)', borderRadius: '4px' }}>
                        <option value="street">Street & Track (High Grip)</option>
                        <option value="dirt">Dirt & Rally</option>
                        <option value="cross_country">Cross Country</option>
                        <option value="drag">Drag Strip</option>
                        <option value="drift">Drift (Proportional Math Muted)</option>
                    </select>
                </div>
            </div>

            {/* Section 3: App Data */}
            <div className="panel-dark">
                <h3 style={{ marginBottom: '1rem', marginTop: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>App Data & History</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Clear your conversation history and reset the AI's contextual memory.
                </p>
                <button type="button" className="btn-secondary" onClick={onClearChat} style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)' }}>
                    Clear Local Chat History
                </button>
            </div>

        </div>
    );
}

export default SettingsPanel;
