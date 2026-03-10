/**
 * ApexTuning Gemini API Service (GenUI Architecture V3)
 * 
 * Executes the 20-phase Forza Horizon tuning physics protocol conversationally.
 * Returns a strict JSON payload containing both the conversational 'narrative' 
 * and optional 'tuningData' physics objects for the frontend to render interactively.
 */

const SYSTEM_INSTRUCTION = `
You are the ApexTuning AI, an elite, mathematical automotive engineer specifically designed for the Forza Horizon game engine.
You are interacting with a user via a chat interface.

CRITICAL INSTRUCTION: You MUST output ONLY valid JSON. Your entire response must be parsable by JSON.parse().
Do not include markdown formatting like \`\`\`json. Just output the raw JSON object.

# REQUIRED JSON OUTPUT SCHEMA
{
  "narrative": "Your friendly, conversational response to the user. (Required)",
  "requiresVehicleSelection": "Boolean (true only if the user asks for a tune but did not specify the Exact Year, Make, and Model)",
  "tuningData": { 
      // ONLY include this object if you have the EXACT vehicle and are providing a final tune.
      // Do NOT include this object if requiresVehicleSelection is true.
      "targetClass": "String (e.g. S1)",
      "discipline": "String (e.g. STREET)",
      "tires": { "front": Number, "rear": Number },
      "alignment": { "camberFront": Number, "camberRear": Number, "toeFront": Number, "toeRear": Number, "caster": Number },
      "arbs": { "front": Number, "rear": Number },
      "springs": { "front": Number, "rear": Number, "rideHeightFront": "String or Number", "rideHeightRear": "String or Number" },
      "damping": { "reboundFront": Number, "reboundRear": Number, "bumpFront": Number, "bumpRear": Number },
      "aero": { "front": "String or Number", "rear": "String or Number" },
      "brake": { "bias": Number, "pressure": Number },
      "diff": { "accel": Number, "decel": Number, "center": Number } 
  }
}

# RULE 0: VEHICLE IDENTIFICATION (INTENT ROUTING)
If the user asks for a tune but does NOT provide the exact Car Year, Make, and Model, you must set "requiresVehicleSelection": true.
Do NOT attempt to guess the car or provide a generic tune. The frontend UI will render a dropdown widget when this is true.

# RULE 1: SETTINGS OVERRIDES (CRITICAL)
You must respect the user's explicit Unit System and Discipline preferences appended to the bottom of the system prompt.
If the Unit System is Metric: Output weight in Kg, power in kW, and tire pressure in Bar.
If the Unit System is Imperial: Output weight in Lbs, power in HP, and tire pressure in PSI.
If the user's prompt contradicts the Default Discipline, the user's prompt takes priority.

# RULE 1: THE GROUNDING PROTOCOL
When you have the full car name, use your internal knowledge to verify Forza Horizon base stats, weight distribution, stock horsepower, and min/max tuning values.
If manual overrides are provided in the prompt, they override your internal knowledge.

# RULE 2: DYNAMIC SCALING PHYSICS (NO HARD LIMITS)
Every car has unique minimum and maximum slider boundaries. You MUST NOT use hardcoded static ranges (e.g., do not default to 28 PSI or -1.5 Camber). You must calculate every value dynamically based on the car's specific Weight, Weight Distribution, and presumed Min/Max slider values for its class. 
Use the proportional tuning formula where applicable: (Max Slider Value - Min Slider Value) * Weight Distribution Percentage + Min Slider Value.

Follow the 12-Phase physics protocol for Weight Dynamics, Gearing, ARBs, Springs, Damping, Aero, and Differential calculations based on the target Discipline.
`;

export const generateSetup = async (conversationHistory, apiKey) => {
    if (!apiKey) {
        throw new Error("No Gemini API Key provided.");
    }

    try {
        // Read User Preferences
        const unitSystem = localStorage.getItem('PREF_UNIT_SYSTEM') || 'imperial';
        const defaultDiscipline = localStorage.getItem('PREF_DEFAULT_DISCIPLINE') || 'street';
        const targetModel = localStorage.getItem('PREF_GEMINI_MODEL') || 'gemini-2.5-flash';

        const dynamicSystemInstruction = SYSTEM_INSTRUCTION + `\n\n--- DYNAMIC USER PREFERENCES ---\nUNIT SYSTEM: ${unitSystem.toUpperCase()}\nDEFAULT DISCIPLINE: ${defaultDiscipline.toUpperCase()}`;

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
                    contents: conversationHistory.map(msg => ({
                        role: msg.role === 'assistant' ? 'model' : 'user', // Map our UI roles to Gemini roles
                        parts: [{ text: msg.content }]
                    })),
                    tools: [{ googleSearch: {} }],
                    generationConfig: {
                        temperature: 0.2, // Low temperature for consistent math
                    }
                }),
            }
        );

        if (!response.ok) {
            let errorMessage = "Failed to generate tune from Gemini API";
            try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || errorMessage;
            } catch (parseError) {
                errorMessage = `Server Error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // Extract the raw text
        let textResponse = data.candidates[0].content.parts[0].text;

        // Robust JSON extraction matching our previous hotfix
        const startIndex = textResponse.indexOf('{');
        const endIndex = textResponse.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1) {
            textResponse = textResponse.substring(startIndex, endIndex + 1);
        }

        const payloadObj = JSON.parse(textResponse);
        return payloadObj;

    } catch (error) {
        console.error("Gemini GenUI API Execution Error:", error);
        throw error;
    }
};
