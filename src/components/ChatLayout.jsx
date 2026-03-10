import { useState } from 'react';
import ChatInput from './ChatInput';
import MessageStream from './MessageStream';
import ApiSettingsPanel from './ApiSettingsPanel';
import { generateSetup } from '../services/geminiApi';

function ChatLayout() {
    const [messages, setMessages] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle

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
        // Retrieve the API Key
        const apiKey = localStorage.getItem('GEMINI_API_KEY');
        if (!apiKey) {
            pushMessage('assistant', "I cannot generate tunes until you provide your Gemini API Key in the settings panel (top left corner).");
            return;
        }

        setIsFetching(true);

        try {
            // Note: We need to update geminiApi.js to accept conversational history arrays context.
            // For now passing the newest request.
            const enhancedPrompt = manualOverrides ?
                `User Request: ${promptText}\n[SYSTEM OVERRIDES INJECTED: ${JSON.stringify(manualOverrides)}]` :
                promptText;

            // This assumes the new geminiApi.js will return { narrative: string, config: object }
            const responsePayload = await generateSetup([{ role: 'user', content: enhancedPrompt }], apiKey);

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

    return (
        <div className="chat-layout">

            {/* Mobile Settings Toggle */}
            <div className="mobile-toolbar" style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 50 }}>
                <button className="btn-secondary" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'var(--bg-slate-secondary)', border: '1px solid var(--border-slate)', borderRadius: '8px', padding: '0.75rem 1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {sidebarOpen ? '✕ Close' : '≡ Settings'}
                </button>
            </div>

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-slate)' }}>
                    <h1 className="header-title" style={{ fontSize: '1.5rem' }}>Apex<span className="text-gold">Tuning</span></h1>
                    <div className="header-accent" style={{ marginBottom: 0, width: '40px', height: '2px' }}></div>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    <ApiSettingsPanel />
                    {/* Future: Render chat history sessions here */}
                    <div style={{ marginTop: '2rem' }}>
                        <button onClick={() => setMessages([])} className="btn-secondary" style={{ width: '100%' }}>
                            + Start New Tune
                        </button>
                    </div>
                </div>
            </aside>

            <main className="main-chat-area">
                <MessageStream
                    messages={messages}
                    isFetching={isFetching}
                    onVehicleSelect={handleInChatVehicleSelect}
                />
                <ChatInput onSendMessage={handleSendMessage} isFetching={isFetching} />
            </main>

            <style>{`
    @media(min - width: 768px) {
                    .mobile - toolbar { display: none!important; }
                .main - chat - area { paddingTop: 0!important; }
    }
        `}</style>
        </div>
    );
}

export default ChatLayout;
