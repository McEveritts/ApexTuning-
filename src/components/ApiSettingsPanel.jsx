import { useState, useEffect } from 'react';

function ApiSettingsPanel() {
    const [apiKey, setApiKey] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [status, setStatus] = useState({ type: 'initial', message: '' }); // initial, success, error
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // Load from local storage on mount
        const savedKey = localStorage.getItem('GEMINI_API_KEY');
        if (savedKey) {
            setApiKey(savedKey);
            setIsSaved(true);
            setStatus({ type: 'success', message: 'API Key Loaded from Storage' });
        }
    }, []);

    const handleTestConnection = async () => {
        if (!apiKey.trim()) {
            setStatus({ type: 'error', message: 'Please enter an API key to test.' });
            return;
        }

        setIsTesting(true);
        setStatus({ type: 'initial', message: '' });
        setIsSaved(false);

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);

            if (response.ok) {
                setStatus({ type: 'success', message: 'API Key Valid' });
            } else {
                setStatus({ type: 'error', message: 'Invalid API Key or Provider Error' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Network error or unable to reach API' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = () => {
        if (status.type === 'success') {
            localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
            setIsSaved(true);
        }
    };

    const handleClear = () => {
        localStorage.removeItem('GEMINI_API_KEY');
        setApiKey('');
        setStatus({ type: 'initial', message: '' });
        setIsSaved(false);
    };

    return (
        <div className="panel-dark">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Gemini API Configuration</h3>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                        setApiKey(e.target.value);
                        if (status.type === 'success' && !isSaved) setStatus({ type: 'initial', message: '' });
                    }}
                    placeholder="Enter your GEMINI_API_KEY"
                />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleTestConnection}
                    disabled={isTesting || !apiKey}
                >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                </button>

                <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleSave}
                    disabled={status.type !== 'success' || isSaved}
                    style={status.type === 'success' && !isSaved ? { borderColor: 'var(--success)', color: 'var(--success)' } : {}}
                >
                    {isSaved ? 'Saved' : 'Save Key'}
                </button>

                {isSaved && (
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleClear}
                        style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'transparent', marginLeft: 'auto' }}
                        title="Clear API Key"
                    >
                        Clear
                    </button>
                )}
            </div>

            {status.message && (
                <div style={{ marginTop: '1rem' }}>
                    {status.type === 'success' && <span className="badge badge-success">{status.message}</span>}
                    {status.type === 'error' && <span className="badge badge-error">{status.message}</span>}
                </div>
            )}
        </div>
    );
}

export default ApiSettingsPanel;
