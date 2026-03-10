/**
 * ApexTuning Data Ingestion Utility
 * Fetches the complete Forza Horizon 5 car roster from an open-source Markdown dataset,
 * parses the table, extracts year/make/model via Regex, and saves it locally as JSON.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.join(__dirname, '../src/data/fh5_cars.json');

// Using the most famous community repository for FH5 IDs: ForzaMods
const DATA_SOURCE_URL = 'https://raw.githubusercontent.com/ForzaMods/FH5-Car-ID-List/main/README.md';

async function ingestCarData() {
    console.log('🏎️  Starting Forza Horizon 5 Car Ingestion (Markdown Parse Mode)...');
    console.log(`🌐 Fetching data from: ${DATA_SOURCE_URL}`);

    try {
        const response = await fetch(DATA_SOURCE_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const rawMarkdown = await response.text();
        const lines = rawMarkdown.split('\n');

        const parsedCars = [];

        // Parsing the Markdown Table (Format: | 1234 | 1999 Nissan Skyline | ... |)
        for (let line of lines) {
            line = line.trim();

            // Skip headers, alignment lines, and empty lines
            if (!line.startsWith('|') || line.includes('|:--') || line.includes('ID')) continue;

            const columns = line.split('|').map(col => col.trim()).filter(col => col !== '');
            if (columns.length < 2) continue; // Safety check

            // Column 1 is usually ID, Column 2 is Name string (e.g., "1968 Abarth 595 esseesse")
            // Handle some repos where Name is the first col if ID doesn't exist
            const nameString = isNaN(Number(columns[0])) ? columns[0] : columns[1];

            if (!nameString) continue;

            // Regex: Extract Year (4 digits), Make (first word), Model (rest)
            const match = nameString.match(/^(\d{4})\s+([\w-]+)\s+(.*)$/);

            if (match) {
                parsedCars.push({
                    year: parseInt(match[1], 10),
                    make: match[2],
                    model: match[3].trim()
                });
            } else {
                // Fallback for cars without standard year formatting
                parsedCars.push({
                    year: 0,
                    make: nameString.split(' ')[0] || "Unknown",
                    model: nameString.split(' ').slice(1).join(' ') || "Unknown"
                });
            }
        }

        console.log(`✅ Successfully parsed ${parsedCars.length} raw records.`);

        // 2. Sorting & Cleanup
        // Alphabetical by Make -> Chronological by Year -> Alphabetical by Model
        parsedCars.sort((a, b) => {
            if (a.make.toLowerCase() < b.make.toLowerCase()) return -1;
            if (a.make.toLowerCase() > b.make.toLowerCase()) return 1;

            if (a.year < b.year) return -1;
            if (a.year > b.year) return 1;

            if (a.model.toLowerCase() < b.model.toLowerCase()) return -1;
            if (a.model.toLowerCase() > b.model.toLowerCase()) return 1;

            return 0;
        });

        // 3. File Output
        console.log(`💾 Writing ${parsedCars.length} polished car records to ${OUTPUT_PATH}...`);
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsedCars, null, 2), 'utf-8');

        console.log('🏁 Ingestion Complete! The cascading UI is now powered by the full FH5 roster.');

    } catch (error) {
        console.log("FATAL ERROR during ingestion:", error.message);
        process.exit(1);
    }
}

// Execute
ingestCarData();
