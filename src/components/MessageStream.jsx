import React from 'react';
import TuningCard from './TuningCard';
import VehicleSelector from './VehicleSelector'; // GenUI injection

function MessageStream({ messages, isFetching, onVehicleSelect, onCompare }) {

    // Auto-scroll to bottom of chat
    const streamRef = React.useRef(null);
    React.useEffect(() => {
        if (streamRef.current) {
            streamRef.current.scrollTop = streamRef.current.scrollHeight;
        }
    }, [messages, isFetching]);

    return (
        <div ref={streamRef} className="chat-stream">
            {messages.length === 0 && (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-secondary)' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.2, marginBottom: '1rem' }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8-1.41-1.42z" fill="currentColor" />
                    </svg>
                    <h2>ApexTuning Assistant</h2>
                    <p>What are we building today?</p>
                </div>
            )}

            {messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.role}`}>
                    <div className={`message-bubble ${msg.role}`}>

                        {/* 1. Main Text Response */}
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                        {/* 2. GenUI Intersection: Vehicle Selection Missing */}
                        {msg.requiresVehicleSelection && msg.role === 'assistant' && (
                            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-slate-secondary)', borderRadius: '8px', border: '1px solid var(--accent-gold)' }}>
                                <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', color: 'var(--accent-gold)' }}>Please define the vehicle:</p>
                                <VehicleSelector onVehicleChange={onVehicleSelect} />
                            </div>
                        )}

                        {/* 3. GenUI Intersection: Rendering the Math Engine UI inside the chat */}
                        {msg.tuningData && msg.role === 'assistant' && (
                            <div style={{ marginTop: '1rem' }}>
                                <TuningCard tuningData={msg.tuningData} onCompare={onCompare} />
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {isFetching && (
                <div className="message-row assistant">
                    <div className="message-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)' }}>
                        <div className="loader-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
                        <div className="loader-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor', animation: 'pulse 1.5s infinite ease-in-out 0.2s' }}></div>
                        <div className="loader-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor', animation: 'pulse 1.5s infinite ease-in-out 0.4s' }}></div>
                        <span style={{ marginLeft: '8px', fontSize: '0.875rem' }}>Engine calculating telemetry...</span>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
}

export default MessageStream;
