/**
 * ApexTuning Gemini API Service (GenUI Architecture V4)
 * 
 * Executes the Forza Horizon tuning physics protocol conversationally.
 * Uses Gemini structured output (responseSchema) for guaranteed valid JSON.
 * Returns { narrative, requiresVehicleSelection?, tuningData? } for the frontend.
 */

// --- Structured Output Schema (Gemini responseSchema format) ---
// Defines the exact JSON contract. All tuningData sub-fields are optional
// so the model can return narrative-only responses without a tune.
const RESPONSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        narrative: {
            type: "STRING",
            description: "Conversational response to the user."
        },
        requiresVehicleSelection: {
            type: "BOOLEAN",
            description: "True only if user wants a tune but didn't specify exact Year, Make, Model."
        },
        tuningData: {
            type: "OBJECT",
            description: "Only present when delivering a complete calculated tune.",
            nullable: true,
            properties: {
                targetClass: { type: "STRING" },
                discipline: { type: "STRING" },
                tires: {
                    type: "OBJECT",
                    properties: {
                        front: { type: "NUMBER" },
                        rear: { type: "NUMBER" }
                    }
                },
                alignment: {
                    type: "OBJECT",
                    properties: {
                        camberFront: { type: "NUMBER" },
                        camberRear: { type: "NUMBER" },
                        toeFront: { type: "NUMBER" },
                        toeRear: { type: "NUMBER" },
                        caster: { type: "NUMBER" }
                    }
                },
                arbs: {
                    type: "OBJECT",
                    properties: {
                        front: { type: "NUMBER" },
                        rear: { type: "NUMBER" }
                    }
                },
                springs: {
                    type: "OBJECT",
                    properties: {
                        front: { type: "NUMBER" },
                        rear: { type: "NUMBER" },
                        rideHeightFront: { type: "NUMBER" },
                        rideHeightRear: { type: "NUMBER" }
                    }
                },
                damping: {
                    type: "OBJECT",
                    properties: {
                        reboundFront: { type: "NUMBER" },
                        reboundRear: { type: "NUMBER" },
                        bumpFront: { type: "NUMBER" },
                        bumpRear: { type: "NUMBER" }
                    }
                },
                aero: {
                    type: "OBJECT",
                    properties: {
                        front: { type: "NUMBER" },
                        rear: { type: "NUMBER" }
                    }
                },
                brake: {
                    type: "OBJECT",
                    properties: {
                        bias: { type: "NUMBER" },
                        pressure: { type: "NUMBER" }
                    }
                },
                diff: {
                    type: "OBJECT",
                    properties: {
                        accel: { type: "NUMBER" },
                        decel: { type: "NUMBER" },
                        center: { type: "NUMBER" }
                    }
                }
            }
        }
    },
    required: ["narrative"]
};

// --- Compact System Instruction ---
const SYSTEM_INSTRUCTION = `
You are the ApexTuning AI, an elite mathematical automotive engineer for the Forza Horizon game engine.
You interact via chat. Your JSON output schema is enforced by the API — follow it exactly.

# RULE 1: VEHICLE IDENTIFICATION (INTENT ROUTING)
If the user asks for a tune but does NOT provide the exact Car Year, Make, and Model:
- Set "requiresVehicleSelection": true and do NOT include tuningData.
- The frontend renders a dropdown widget when this is true.

# RULE 2: SETTINGS OVERRIDES
Respect the user's Unit System and Discipline preferences appended below.
- Metric: weight in Kg, power in kW, tire pressure in Bar.
- Imperial: weight in Lbs, power in HP, tire pressure in PSI.
- If the user's prompt contradicts the Default Discipline, the user's prompt takes priority.

# RULE 3: DYNAMIC SCALING PHYSICS (NO HARD LIMITS)
Every car has unique min/max slider boundaries. NEVER use hardcoded static values (e.g., 28 PSI or -1.5 camber).
Calculate every value dynamically from the car's Weight, Weight Distribution, and class-specific min/max slider ranges.
Proportional formula: (MaxSlider - MinSlider) × WeightDistribution% + MinSlider.
Follow the 12-Phase physics protocol for Weight Dynamics, Gearing, ARBs, Springs, Damping, Aero, and Differential.

# RULE 4: DISCIPLINE-SPECIFIC PHYSICS

## STREET / TRACK (High Grip)
Standard proportional scaling. Balanced front/rear distribution. Moderate camber (-0.5° to -2.0°). Diff tuned for controlled traction out of corners.

## DIRT / RALLY / CROSS COUNTRY
Softer springs and ARBs for terrain compliance. Increased ride height. Reduced camber. Higher tire pressure for puncture resistance. Looser diff decel for rotation on loose surfaces.

## DRIFT (Proportional Math Dampened by 40%)
- Rear camber aggressive: -3.0° to -5.0°. High front caster.
- Softer front ARBs, stiffer rear ARBs for oversteer bias.
- Diff accel 80–100%, decel 0–20% for sustained slides.
- Lower rear tire pressure for increased slip angle.
- All proportional calculations are dampened by 40% toward oversteer-biased extremes.

## DRAG (Proportional Math Dampened by 60%)
- Zero camber, zero toe for maximum straight-line contact patch.
- Stiffest possible springs to minimize weight transfer.
- Max rear aero only if top-speed limited, otherwise minimum aero.
- Diff accel 100%, decel 0% for pure launch traction.
- Brake bias 50/50. All proportional calculations dampened by 60% toward straight-line extremes.

# RULE 5: FORZA ENGINE GROUNDING BOUNDARY (MANDATORY)
You exist ONLY within the Forza Horizon game engine simulation.
- NEVER use real-world curb weights, track widths, or suspension geometry from Google Search results.
- If Google Search returns real-life specifications, IGNORE them for tuning math.
- Only use search data to IDENTIFY which car the user means (year/make/model disambiguation).
- All weight, power, and slider boundaries must come from your Forza Horizon knowledge base.
- If uncertain about in-game stats, state your uncertainty — do NOT substitute real-world specs.

# RULE 6: CONVERSATIONAL MEMORY
You may receive multi-turn conversation history. When the user says things like "make the rear softer" or "adjust the diff", recalculate the PREVIOUS tuningData with the requested modification and return a complete updated tuningData object. Always reference the specific car from the conversation context.
`;

// Maximum conversation turns sent to the API to prevent token overflow
const MAX_HISTORY_TURNS = 10;

export const generateSetup = async (conversationHistory, apiKey) => {
    if (!apiKey) {
        throw new Error("No Gemini API Key provided.");
    }

    try {
        // Read User Preferences
        const unitSystem = localStorage.getItem('PREF_UNIT_SYSTEM') || 'imperial';
        const defaultDiscipline = localStorage.getItem('PREF_DEFAULT_DISCIPLINE') || 'street';
        const targetModel = localStorage.getItem('PREF_GEMINI_MODEL') || 'gemini-2.5-flash';

        const dynamicSystemInstruction = SYSTEM_INSTRUCTION + `\n--- ACTIVE USER PREFERENCES ---\nUNIT SYSTEM: ${unitSystem.toUpperCase()}\nDEFAULT DISCIPLINE: ${defaultDiscipline.toUpperCase()}`;

        // Trim conversation history to prevent token overflow
        const trimmedHistory = conversationHistory.length > MAX_HISTORY_TURNS
            ? conversationHistory.slice(-MAX_HISTORY_TURNS)
            : conversationHistory;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=` + apiKey,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: dynamicSystemInstruction }]
                    },
                    contents: trimmedHistory.map(msg => ({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    })),
                    tools: [{ googleSearch: {} }],
                    generationConfig: {
                        temperature: 0.2,
                        responseMimeType: "application/json",
                        responseSchema: RESPONSE_SCHEMA,
                    }
                }),
            }
        );

        if (!response.ok) {
            let errorMessage = "Failed to generate tune from Gemini API";
            try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || errorMessage;
            } catch {
                errorMessage = `Server Error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // With responseMimeType: "application/json", the response is guaranteed valid JSON.
        // No manual extraction needed — parse directly.
        const textResponse = data.candidates[0].content.parts[0].text;
        const payloadObj = JSON.parse(textResponse);
        return payloadObj;

    } catch (error) {
        console.error("Gemini GenUI API Execution Error:", error);
        throw error;
    }
};
