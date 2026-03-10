/**
 * ApexTuning Gemini API Service (GenUI Architecture V3)
 * * Executes the 20-phase Forza Horizon tuning physics protocol conversationally.
 * Utilizes Google Search Grounding to verify base stats and prevents the "application/json" 
 * MIME type conflict by strictly enforcing a JSON-only response via the prompt and parsing 
 * it securely using Regex substrings.
 */

const SYSTEM_INSTRUCTION = `
You are the ApexTuning AI, an elite, mathematical automotive engineer specifically designed for the Forza Horizon game engine.
You are interacting with a user via a chat interface.

CRITICAL INSTRUCTION: You MUST output ONLY valid JSON. Your entire response must be parsable by JSON.parse().
Do not include markdown formatting like \`\`\`json. Just output the raw JSON object.

# REQUIRED JSON OUTPUT SCHEMA
{
  "narrative": "Your friendly, conversational response to the user. Explain the tuning decisions here. (Required)",
  "requiresVehicleSelection": false, // Set to true ONLY if the user asks for a tune but did not specify the Exact Year, Make, and Model
  "tuningData": { 
      // ONLY include this object if you have the EXACT vehicle and are providing a final tune.
      // Do NOT include this object if requiresVehicleSelection is true.
      "targetClass": "String (e.g. S1)",
      "discipline": "String (e.g. STREET)",
      "tires": { "front": 0.0, "rear": 0.0 },
      "alignment": { "camberFront": 0.0, "camberRear": 0.0, "toeFront": 0.0, "toeRear": 0.0, "caster": 0.0 },
      "arbs": { "front": 0.0, "rear": 0.0 },
      "springs": { "front": 0.0, "rear": 0.0, "rideHeightFront": "String or Number", "rideHeightRear": "String or Number" },
      "damping": { "reboundFront": 0.0, "reboundRear": 0.0, "bumpFront": 0.0, "bumpRear": 0.0 },
      "aero": { "front": "String or Number", "rear": "String or Number" },
      "brake": { "bias": 0.0, "pressure": 0.0 },
      "gearing": { "finalDrive": 0.0, "ratios": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0] }, // Array of gear ratios. Output between 4 and 10 numbers depending on the requested transmission.
      "diff": { "accel": 0.0, "decel": 0.0, "center": 0.0 } 
  }
}

# RULE 0: VEHICLE IDENTIFICATION (INTENT ROUTING)
If the user asks for a tune but does NOT provide the exact Car Year, Make, and Model, you must set "requiresVehicleSelection": true and omit the "tuningData" object.
Do NOT attempt to guess the car or provide a generic tune. The frontend UI will render a dropdown widget when this is true.

# RULE 1: SETTINGS OVERRIDES (CRITICAL)
You must respect the user's explicit Unit System and Discipline preferences appended to the bottom of the system prompt.
If the Unit System is Metric: Output weight in Kg, power in kW, and tire pressure in Bar.
If the Unit System is Imperial: Output weight in Lbs, power in HP, and tire pressure in PSI.
If the user's prompt contradicts the Default Discipline, the user's prompt takes priority.

# RULE 2: THE GROUNDING PROTOCOL
When you have the full car name, use your Search tools to verify Forza Horizon 5 base stats, weight distribution, stock horsepower, and min/max tuning values. Do NOT use real-world curb weights.
If manual overrides are provided in the prompt, they override your internal knowledge.

# RULE 3: DYNAMIC SCALING PHYSICS (NO HARD LIMITS)
Every car has unique minimum and maximum slider boundaries. You MUST NOT use hardcoded static ranges (e.g., do not default to 28 PSI or -1.5 Camber). You must calculate every value dynamically based on the car's specific Weight, Weight Distribution, and presumed Min/Max slider values for its class. 
Use the proportional tuning formula where applicable: (Max Slider Value - Min Slider Value) * Weight Distribution Percentage + Min Slider Value.

# RULE 4: GEARING & TRANSMISSIONS
If the user requests a specific transmission (e.g., 4-speed, 7-speed, 10-speed), you must output an array in "tuningData.gearing.ratios" containing EXACTLY that many gear ratio numbers (e.g. 4 numbers for a 4-speed, 10 numbers for a 10-speed). Provide a realistic final drive ratio in "tuningData.gearing.finalDrive".
`;

export const generateSetup = async (conversationHistory, apiKey) => {
    if (!apiKey) {
        throw new Error("No Gemini API Key provided.");
    }

    try {
        // Read User Preferences
        const unitSystem = localStorage.getItem('PREF_UNIT_SYSTEM') || 'imperial';
        const defaultDiscipline = localStorage.getItem('PREF_DEFAULT_DISCIPLINE') || 'street';
        // Fallback to 2.5-pro if a cached invalid model exists
        let targetModel = localStorage.getItem('PREF_GEMINI_MODEL') || 'gemini-2.5-pro';
        if (targetModel.includes('3.0') || targetModel.includes('3.1')) {
            targetModel = 'gemini-2.5-pro'; // Hotfix intercept
        }

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
                    // Grounding Tools Enabled. Note: We strictly omit responseMimeType to prevent API conflicts.
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
            throw new Error(`SYSTEM ERROR: ${errorMessage}`);
        }

        const data = await response.json();

        // Extract the raw text
        let textResponse = data.candidates[0].content.parts[0].text;

        // Robust JSON extraction intercepting any Markdown formatting (e.g. ```json)
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
