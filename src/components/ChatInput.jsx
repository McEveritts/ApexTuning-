import { useState, useRef, useEffect } from 'react';

function ChatInput({ onSendMessage, isFetching }) {
    const [inputValue, setInputValue] = useState('');
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);

    // Telemetry overrides state handled locally within the input zone
    const [overrides, setOverrides] = useState({
        weight: '',
        weightDistributionFront: '',
        horsepower: '',
        drivetrain: '',
        piClass: 'A',
        raceType: 'Street'
    });

    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px'; // Reset to min-height
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
        }
    }, [inputValue]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitMessage();
        }
    };

    const handleOverrideChange = (e) => {
        const { name, value } = e.target;
        setOverrides(prev => ({ ...prev, [name]: value }));
    };

    const submitMessage = () => {
        if (!inputValue.trim() || isFetching) return;

        // Pass both the natural language prompt AND any advanced overrides up to the layout
        onSendMessage(inputValue, isAdvancedMode ? overrides : null);

        setInputValue('');
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';
        }
    };

    return (
        <div className="chat-input-zone">

            {/* Advanced Overrides Accordion Panel */}
            {isAdvancedMode && (
                <div className="panel-dark" style={{ maxWidth: '800px', margin: '0 auto 1rem auto', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>Manual Telemetry Overrides</h4>
                        <button onClick={() => setIsAdvancedMode(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem' }}>Weight (lbs)</label>
                            <input type="number" name="weight" value={overrides.weight} onChange={handleOverrideChange} placeholder="Stock" />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem' }}>Front Dist (%)</label>
                            <input type="number" name="weightDistributionFront" value={overrides.weightDistributionFront} onChange={handleOverrideChange} placeholder="Stock" step="0.1" />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem' }}>Horsepower</label>
                            <input type="number" name="horsepower" value={overrides.horsepower} onChange={handleOverrideChange} placeholder="Stock" />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem' }}>Drivetrain Swap</label>
                            <select name="drivetrain" value={overrides.drivetrain} onChange={handleOverrideChange}>
                                <option value="">Stock</option>
                                <option value="RWD">RWD</option>
                                <option value="AWD">AWD</option>
                                <option value="FWD">FWD</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem' }}>Target PI Class</label>
                            <select name="piClass" value={overrides.piClass} onChange={handleOverrideChange}>
                                <option value="B">B Class</option>
                                <option value="A">A Class</option>
                                <option value="S1">S1 Class</option>
                                <option value="S2">S2 Class</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem' }}>Discipline</label>
                            <select name="raceType" value={overrides.raceType} onChange={handleOverrideChange}>
                                <option value="Street">Street</option>
                                <option value="Drag">Drag</option>
                                <option value="Dirt">Dirt/Rally</option>
                                <option value="Cross Country">Cross Country</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Chat Input Bar */}
            <div className="chat-input-container">
                <textarea
                    ref={textareaRef}
                    className="chat-textarea"
                    placeholder="E.g., Build a dirt tune for my A-Class Alfa Romeo Giulia..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isFetching}
                />
                <button
                    className="send-button"
                    onClick={submitMessage}
                    disabled={!inputValue.trim() || isFetching}
                    title="Send Message"
                >
                    {/* Inline SVG for Send Arrow */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* Helper Footer */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                <button
                    type="button"
                    onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.75rem' }}
                >
                    {isAdvancedMode ? 'Hide Overrides' : '+ Advanced Overrides'}
                </button>
            </div>
        </div>
    );
}

export default ChatInput;
