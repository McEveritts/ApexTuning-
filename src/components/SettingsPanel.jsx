import React, { useState, useEffect } from 'react';

function SettingsPanel({ onClearChat, onLoadFavorite }) {
    // Section 1: API Configuration
    const [apiKey, setApiKey] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [apiStatus, setApiStatus] = useState({ type: 'initial', message: '' });
    const [isSaved, setIsSaved] = useState(false);

    // Section 2: Tuning Preferences
    const [unitSystem, setUnitSystem] = useState('imperial'); // 'imperial' or 'metric'
    const [defaultDiscipline, setDefaultDiscipline] = useState('street');
    const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
    const [theme, setTheme] = useState('gold');
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        // Load global preferences
        const savedKey = localStorage.getItem('GEMINI_API_KEY');
        const savedUnits = localStorage.getItem('PREF_UNIT_SYSTEM') || 'imperial';
        const savedDiscipline = localStorage.getItem('PREF_DEFAULT_DISCIPLINE') || 'street';
        const savedModel = localStorage.getItem('PREF_GEMINI_MODEL') || 'gemini-2.5-flash';
        const savedTheme = localStorage.getItem('PREF_THEME') || 'gold';

        if (savedKey) {
            setApiKey(savedKey);
            setIsSaved(true);
            setApiStatus({ type: 'success', message: 'API Key Configured' });
        }

        setUnitSystem(savedUnits);
        setDefaultDiscipline(savedDiscipline);
        setGeminiModel(savedModel);
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        const loadFavorites = () => {
            const savedFavorites = JSON.parse(localStorage.getItem('FAVORITE_TUNES') || '[]');
            setFavorites(savedFavorites);
        };
        loadFavorites();
        window.addEventListener('favoritesUpdated', loadFavorites);
        return () => window.removeEventListener('favoritesUpdated', loadFavorites);
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
        } catch {
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

    const handleRemoveFavorite = (index) => {
        const newFavs = favorites.filter((_, i) => i !== index);
        setFavorites(newFavs);
        localStorage.setItem('FAVORITE_TUNES', JSON.stringify(newFavs));
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

    const handleModelChange = (e) => {
        const val = e.target.value;
        setGeminiModel(val);
        localStorage.setItem('PREF_GEMINI_MODEL', val);
    };

    const handleThemeChange = (e) => {
        const val = e.target.value;
        setTheme(val);
        localStorage.setItem('PREF_THEME', val);
        document.documentElement.setAttribute('data-theme', val);
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

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>AI Model</label>
                    <select value={geminiModel} onChange={handleModelChange} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-slate-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-slate)', borderRadius: '4px' }}>
                        {/* Gemini 3.1 Family */}
                        <option value="gemini-3.1-flash">Gemini 3.1 Flash</option>
                        <option value="gemini-3.1-pro">Gemini 3.1 Pro (Advanced)</option>

                        {/* Gemini 3.0 Family */}
                        <option value="gemini-3.0-flash">Gemini 3.0 Flash</option>
                        <option value="gemini-3.0-pro">Gemini 3.0 Pro (Advanced)</option>

                        {/* Gemini 2.5 Family */}
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>

                        {/* Gemini 2.0 Family */}
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</option>
                        <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Experimental</option>
                    </select>
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

                <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>App Theme</label>
                    <select value={theme} onChange={handleThemeChange} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-slate-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-slate)', borderRadius: '4px' }}>
                        <option value="gold">Apex Gold</option>
                        <option value="blue">Racing Blue</option>
                        <option value="red">Modena Red</option>
                        <option value="emerald">British Racing Green</option>
                        <option value="purple">Midnight Purple</option>
                    </select>
                </div>
            </div>

            {/* Section 3: Favorite Tunes */}
            <div className="panel-dark">
                <h3 style={{ marginBottom: '1rem', marginTop: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Favorite Setups</h3>
                {favorites.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 0 }}>No favorite setups saved yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {favorites.map((fav, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-slate-primary)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-slate)' }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={fav.name}>
                                    {fav.name || fav.tuningData?.targetClass || 'Saved Tune'}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                    <button className="btn-secondary" onClick={() => onLoadFavorite(fav.tuningData)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Load</button>
                                    <button className="btn-secondary" onClick={() => handleRemoveFavorite(i)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--error)' }}>×</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 4: App Data */}
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
