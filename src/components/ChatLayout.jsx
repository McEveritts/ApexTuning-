
import { useState, useEffect } from 'react';
import ChatInput from './ChatInput';
import MessageStream from './MessageStream';
import SettingsPanel from './SettingsPanel';
import ComparisonModal from './ComparisonModal';
import { generateSetup } from '../services/geminiApi';

function ChatLayout() {
    const [messages, setMessages] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle
    const [comparisonQueue, setComparisonQueue] = useState([]);

    // Phase 20: Read encoded shared tune URL parameter on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tuneParam = params.get('tune');
        if (tuneParam) {
            try {
                const decodedData = JSON.parse(atob(decodeURIComponent(tuneParam)));
                setMessages([{
                    id: 'shared-tune',
                    role: 'assistant',
                    content: "Here is the shared setup you requested.",
                    tuningData: decodedData
                }]);
                // Clean up the URL to prevent reloading the tune on manual refresh
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (err) {
                console.error("Failed to parse incoming tune URL data", err);
            }
        }
    }, []);

    const handleCompare = (tune) => {
        if (comparisonQueue.length >= 2) {
            alert("Maximum 2 setups can be compared side-by-side.");
            return;
        }
        setComparisonQueue(prev => [...prev, tune]);
    };

    const handleLoadFavorite = (tune) => {
        setMessages(prev => [...prev, {
            id: Date.now() + Math.random().toString(),
            role: 'assistant',
            content: "Here is your saved favorite setup.",
            tuningData: tune
        }]);
        setSidebarOpen(false); // Close mobile sidebar
    };

    const pushMessage = (role, content, extraPayload = {}) => {
        setMessages(prev => [...prev, {
            id: Date.now() + Math.random().toString(),
            role,
            content,
            ...extraPayload
        }]);
    };

    const handleSendMessage = async (promptText, manualOverrides) => {
        // 1. Render User Message
        pushMessage('user', promptText);

        // 2. Format Context for the Core
        const apiKey = localStorage.getItem('GEMINI_API_KEY');
        if (!apiKey) {
            pushMessage('assistant', "I cannot generate tunes until you provide your Gemini API Key in the settings panel (top left corner).");
            return;
        }

        setIsFetching(true);

        try {
            // Build the enhanced prompt with any manual overrides
            const enhancedPrompt = manualOverrides ?
                `User Request: ${promptText} \n[SYSTEM OVERRIDES INJECTED: ${JSON.stringify(manualOverrides)}]` :
                promptText;

            // Build full conversation history for contextual memory (Phase 12).
            // Strip tuningData from assistant messages to reduce token bloat.
            const conversationHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));
            // Append the current user message
            conversationHistory.push({ role: 'user', content: enhancedPrompt });

            const responsePayload = await generateSetup(conversationHistory, apiKey);

            // 3. Render Assistant Response (GenUI)
            if (responsePayload.requiresVehicleSelection) {
                // Trigger the Intent routing
                pushMessage('assistant', responsePayload.narrative || "I need to know exactly which car we are building before calculating the telemetry physics. Please select it from the database below.", { requiresVehicleSelection: true });
            } else if (responsePayload.tuningData) {
                // Strict Success path
                pushMessage('assistant', responsePayload.narrative || "Here is the mathematically scaled telemetry setup for your vehicle.", { tuningData: responsePayload.tuningData });
            } else {
                // Open-ended conversation back and forth
                pushMessage('assistant', responsePayload.narrative || responsePayload.error);
            }

        } catch (error) {
            pushMessage('assistant', "SYSTEM ERROR: " + error.message);
        } finally {
            setIsFetching(false);
        }
    };

    // Callback when user interacts with the GenUI cascading dropdown inside the chat stream
    const handleInChatVehicleSelect = (carString) => {
        if (carString) {
            handleSendMessage(`I have selected the ${carString}.`, null);
        }
    };

    // Callback to wipe contextual memory from the App Data settings
    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear your conversation history? This cannot be undone.")) {
            setMessages([{
                id: Date.now().toString(),
                role: 'assistant',
                content: "I am the ApexTuning AI. What vehicle are we tuning today? (Year, Make, Model)",
                tuningData: null,
                requiresVehicleSelection: false
            }]);
            setSidebarOpen(false);
        }
    };

    return (
        <div className="chat-layout">

            {/* Mobile Settings Toggle */}
            <div className="mobile-toolbar" style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 50 }}>
                <button className="btn-secondary" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'var(--bg-slate-secondary)', border: '1px solid var(--border-slate)', borderRadius: '8px', padding: '0.75rem 1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '44px' }} aria-label={sidebarOpen ? "Close Settings Sidebar" : "Open Settings Sidebar"} aria-expanded={sidebarOpen}>
                    {sidebarOpen ? '✕ Close' : '≡ Settings'}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 5
                    }}
                    aria-hidden="true"
                />
            )}

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''} `}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-slate)' }}>
                    <h1 className="header-title" style={{ fontSize: '1.5rem' }}>Apex<span className="text-gold">Tuning</span></h1>
                    <div className="header-accent" style={{ marginBottom: 0, width: '40px', height: '2px' }}></div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {/* Dedicated Settings Panel (API, Defaults, App Data) */}
                    <SettingsPanel onClearChat={handleClearChat} onLoadFavorite={handleLoadFavorite} />
                </div>
            </aside>

            <main className="main-chat-area">
                <MessageStream
                    messages={messages}
                    isFetching={isFetching}
                    onVehicleSelect={handleInChatVehicleSelect}
                    onCompare={handleCompare}
                />
                <ChatInput onSendMessage={handleSendMessage} isFetching={isFetching} />

                {comparisonQueue.length > 0 && (
                    <ComparisonModal
                        queue={comparisonQueue}
                        onClose={() => setComparisonQueue([])}
                        onRemove={(index) => setComparisonQueue(prev => prev.filter((_, i) => i !== index))}
                    />
                )}
            </main>

            <style>{`
                @media(min-width: 768px) {
                    .mobile-toolbar { display: none !important; }
                    .main-chat-area { paddingTop: 0 !important; }
                }
            `}</style>
        </div>
    );
}

export default ChatLayout;
