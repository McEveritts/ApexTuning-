/**
 * ApexTuning Edge-Case Physics Validation Harness
 * 
 * Fires Gemini API calls for extreme vehicles and validates the returned
 * tuningData against Forza-valid ranges. Run manually:
 * 
 *   GEMINI_API_KEY=your_key node scripts/edgeCaseTests.js
 * 
 * Optionally set GEMINI_MODEL to test different models:
 *   GEMINI_MODEL=gemini-3.1-flash GEMINI_API_KEY=your_key node scripts/edgeCaseTests.js
 */

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!API_KEY) {
    console.error('ERROR: Set GEMINI_API_KEY environment variable.');
    process.exit(1);
}

// ── Test Vehicles ──────────────────────────────────────────────
const TEST_VEHICLES = [
    {
        name: "1957 Caterham Seven",
        prompt: "Build an A-Class Street tune for the 1957 Caterham Super Seven. It weighs about 500kg with ~60% front weight distribution.",
        risk: "Ultra-lightweight, extreme front bias — springs/damping may underflow"
    },
    {
        name: "2014 Mercedes-Benz Unimog U5023",
        prompt: "Build a B-Class Cross Country tune for the 2014 Mercedes-Benz Unimog U5023. It weighs over 7000 lbs.",
        risk: "Extreme heavy vehicle — spring rates and ARBs may overflow"
    },
    {
        name: "2019 Porsche 911 GT3 RS",
        prompt: "Build an S1-Class Street tune for the 2019 Porsche 911 GT3 RS. Rear-engine layout with approximately 38% front / 62% rear weight distribution.",
        risk: "Rear-engine distribution inverts proportional front/rear scaling"
    },
    {
        name: "1965 Shelby Cobra 427 S/C",
        prompt: "Build an S2-Class Street tune for the 1965 Shelby Cobra 427 S/C. Ultra-high power-to-weight, RWD.",
        risk: "Extreme power-to-weight — diff accel overflow, tire pressure extremes"
    }
];

// ── Validation Ranges (Forza Horizon slider boundaries) ────────
const RANGES = {
    tirePressurePSI: { min: 15, max: 50 },
    camber: { min: -5.0, max: 0.0 },
    toe: { min: -1.0, max: 1.0 },
    caster: { min: 1.0, max: 7.0 },
    arbs: { min: 1.0, max: 65.0 },
    springs: { min: 1.0, max: 2000.0 },  // broad range to cover all classes
    rideHeight: { min: 1.0, max: 30.0 },
    damping: { min: 1.0, max: 20.0 },
    aero: { min: 0, max: 500 },
    brakeBias: { min: 40, max: 60 },
    brakePressure: { min: 50, max: 200 },
    diffPercent: { min: 0, max: 100 }
};

// ── Response Schema (mirrors geminiApi.js) ─────────────────────
const RESPONSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        narrative: { type: "STRING" },
        requiresVehicleSelection: { type: "BOOLEAN" },
        tuningData: {
            type: "OBJECT", nullable: true,
            properties: {
                targetClass: { type: "STRING" },
                discipline: { type: "STRING" },
                tires: { type: "OBJECT", properties: { front: { type: "NUMBER" }, rear: { type: "NUMBER" } } },
                alignment: { type: "OBJECT", properties: { camberFront: { type: "NUMBER" }, camberRear: { type: "NUMBER" }, toeFront: { type: "NUMBER" }, toeRear: { type: "NUMBER" }, caster: { type: "NUMBER" } } },
                arbs: { type: "OBJECT", properties: { front: { type: "NUMBER" }, rear: { type: "NUMBER" } } },
                springs: { type: "OBJECT", properties: { front: { type: "NUMBER" }, rear: { type: "NUMBER" }, rideHeightFront: { type: "NUMBER" }, rideHeightRear: { type: "NUMBER" } } },
                damping: { type: "OBJECT", properties: { reboundFront: { type: "NUMBER" }, reboundRear: { type: "NUMBER" }, bumpFront: { type: "NUMBER" }, bumpRear: { type: "NUMBER" } } },
                aero: { type: "OBJECT", properties: { front: { type: "NUMBER" }, rear: { type: "NUMBER" } } },
                brake: { type: "OBJECT", properties: { bias: { type: "NUMBER" }, pressure: { type: "NUMBER" } } },
                diff: { type: "OBJECT", properties: { accel: { type: "NUMBER" }, decel: { type: "NUMBER" }, center: { type: "NUMBER" } } }
            }
        }
    },
    required: ["narrative"]
};

const SYSTEM_INSTRUCTION = `
You are the ApexTuning AI, an elite mathematical automotive engineer for the Forza Horizon game engine.
Your JSON output schema is enforced by the API.

# RULE 1: DYNAMIC SCALING PHYSICS
Calculate every value dynamically from the car's Weight, Weight Distribution, and class-specific min/max slider ranges.
Proportional formula: (MaxSlider - MinSlider) × WeightDistribution% + MinSlider.
NEVER use hardcoded static values.

# RULE 2: FORZA ENGINE GROUNDING
You exist ONLY within the Forza Horizon game engine simulation.
NEVER use real-world curb weights or suspension geometry. All stats must come from Forza Horizon knowledge.

--- ACTIVE USER PREFERENCES ---
UNIT SYSTEM: IMPERIAL
DEFAULT DISCIPLINE: STREET
`;

// ── Validation Logic ───────────────────────────────────────────
function validateField(label, value, range) {
    const errors = [];
    if (value === undefined || value === null) return errors; // optional field
    if (typeof value !== 'number' || !isFinite(value)) {
        errors.push(`  ✗ ${label}: non-finite value (${value})`);
        return errors;
    }
    if (value < range.min || value > range.max) {
        errors.push(`  ✗ ${label}: ${value} (expected ${range.min}–${range.max})`);
    }
    return errors;
}

function validateTuningData(td) {
    const errors = [];
    if (!td) {
        errors.push("  ✗ No tuningData returned");
        return errors;
    }

    // Tires
    errors.push(...validateField("tires.front", td.tires?.front, RANGES.tirePressurePSI));
    errors.push(...validateField("tires.rear", td.tires?.rear, RANGES.tirePressurePSI));

    // Alignment
    errors.push(...validateField("alignment.camberFront", td.alignment?.camberFront, RANGES.camber));
    errors.push(...validateField("alignment.camberRear", td.alignment?.camberRear, RANGES.camber));
    errors.push(...validateField("alignment.toeFront", td.alignment?.toeFront, RANGES.toe));
    errors.push(...validateField("alignment.toeRear", td.alignment?.toeRear, RANGES.toe));
    errors.push(...validateField("alignment.caster", td.alignment?.caster, RANGES.caster));

    // ARBs
    errors.push(...validateField("arbs.front", td.arbs?.front, RANGES.arbs));
    errors.push(...validateField("arbs.rear", td.arbs?.rear, RANGES.arbs));

    // Springs
    errors.push(...validateField("springs.front", td.springs?.front, RANGES.springs));
    errors.push(...validateField("springs.rear", td.springs?.rear, RANGES.springs));
    errors.push(...validateField("springs.rideHeightFront", td.springs?.rideHeightFront, RANGES.rideHeight));
    errors.push(...validateField("springs.rideHeightRear", td.springs?.rideHeightRear, RANGES.rideHeight));

    // Damping
    errors.push(...validateField("damping.reboundFront", td.damping?.reboundFront, RANGES.damping));
    errors.push(...validateField("damping.reboundRear", td.damping?.reboundRear, RANGES.damping));
    errors.push(...validateField("damping.bumpFront", td.damping?.bumpFront, RANGES.damping));
    errors.push(...validateField("damping.bumpRear", td.damping?.bumpRear, RANGES.damping));

    // Aero
    errors.push(...validateField("aero.front", td.aero?.front, RANGES.aero));
    errors.push(...validateField("aero.rear", td.aero?.rear, RANGES.aero));

    // Brakes
    errors.push(...validateField("brake.bias", td.brake?.bias, RANGES.brakeBias));
    errors.push(...validateField("brake.pressure", td.brake?.pressure, RANGES.brakePressure));

    // Diff
    errors.push(...validateField("diff.accel", td.diff?.accel, RANGES.diffPercent));
    errors.push(...validateField("diff.decel", td.diff?.decel, RANGES.diffPercent));
    errors.push(...validateField("diff.center", td.diff?.center, RANGES.diffPercent));

    return errors;
}

// ── API Call ───────────────────────────────────────────────────
async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`API ${res.status}: ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
}

// ── Test Runner ────────────────────────────────────────────────
async function runTests() {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`  ApexTuning Edge-Case Physics Validator`);
    console.log(`  Model: ${MODEL}`);
    console.log(`${"═".repeat(60)}\n`);

    let passed = 0;
    let failed = 0;

    for (const vehicle of TEST_VEHICLES) {
        console.log(`▶ ${vehicle.name}`);
        console.log(`  Risk: ${vehicle.risk}`);

        try {
            const result = await callGemini(vehicle.prompt);
            const errors = validateTuningData(result.tuningData);

            if (errors.length === 0) {
                console.log(`  ✔ PASS — All values within Forza-valid ranges`);
                passed++;
            } else {
                console.log(`  ✘ FAIL — ${errors.length} validation error(s):`);
                errors.forEach(e => console.log(e));
                failed++;
            }

            // Print a compact summary of key values
            if (result.tuningData) {
                const td = result.tuningData;
                console.log(`  Summary: Class=${td.targetClass} | Tires F=${td.tires?.front} R=${td.tires?.rear} | Springs F=${td.springs?.front} R=${td.springs?.rear} | Diff A=${td.diff?.accel}% D=${td.diff?.decel}%`);
            }
        } catch (err) {
            console.log(`  ✘ ERROR — ${err.message}`);
            failed++;
        }

        console.log();
    }

    console.log(`${"─".repeat(60)}`);
    console.log(`  Results: ${passed} passed, ${failed} failed out of ${TEST_VEHICLES.length} tests`);
    console.log(`${"─".repeat(60)}\n`);

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
