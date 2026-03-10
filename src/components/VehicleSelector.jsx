import { useState, useMemo, useEffect } from 'react';
import carData from '../data/fh5_cars.json';

function VehicleSelector({ onVehicleChange, initialValue = "" }) {
    const [selectedMake, setSelectedMake] = useState("");
    const [selectedModel, setSelectedModel] = useState("");

    // Phase 1: Data Architecture
    // Extract a unique, alphabetically sorted array of all makes
    const uniqueMakes = useMemo(() => {
        const makes = carData.map(car => car.make);
        return [...new Set(makes)].sort();
    }, []);

    // Filter models based on the selected Make
    const availableModels = useMemo(() => {
        if (!selectedMake) return [];
        return carData.filter(car => car.make === selectedMake).sort((a, b) => a.model.localeCompare(b.model));
    }, [selectedMake]);

    // Handle initial value pre-fill (optional)
    useEffect(() => {
        if (initialValue && !selectedMake && !selectedModel) {
            // Attempt to reverse engineer make/model from a string if it matches our data
            const matchingCar = carData.find(car => initialValue.includes(car.make) && initialValue.includes(car.model));
            if (matchingCar) {
                setSelectedMake(matchingCar.make);
                setSelectedModel(`${matchingCar.year} ${matchingCar.model}`);
            }
        }
    }, [initialValue, selectedMake, selectedModel]);


    const handleMakeChange = (e) => {
        const make = e.target.value;
        setSelectedMake(make);
        setSelectedModel(""); // Reset model when make changes
        onVehicleChange(""); // Reset parent state
    };

    const handleModelChange = (e) => {
        const fullModelString = e.target.value; // e.g. "2018 Giulia Quadrifoglio"
        setSelectedModel(fullModelString);

        if (fullModelString) {
            const yearStr = fullModelString.substring(0, 4);
            const modelStr = fullModelString.substring(5);
            onVehicleChange(`${yearStr} ${selectedMake} ${modelStr}`);
        } else {
            onVehicleChange(""); // If unselected
        }
    };

    return (
        <div className="dropdown-styled-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {/* Make Selector */}
            <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Manufacturer</label>
                <select
                    value={selectedMake}
                    onChange={handleMakeChange}
                    className="dropdown-styled"
                >
                    <option value="">-- Select Make --</option>
                    {uniqueMakes.map(make => (
                        <option key={make} value={make}>{make}</option>
                    ))}
                </select>
            </div>

            {/* Model Selector */}
            <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Model</label>
                <select
                    value={selectedModel}
                    onChange={handleModelChange}
                    disabled={!selectedMake}
                    className={`dropdown-styled ${!selectedMake ? 'disabled-select' : ''}`}
                >
                    <option value="">-- Select Model --</option>
                    {availableModels.map(car => (
                        <option key={`${car.make}-${car.model}-${car.year}`} value={`${car.year} ${car.model}`}>
                            {car.year} {car.model}
                        </option>
                    ))}
                </select>
            </div>

            <style>{`
                .dropdown-styled {
                    background-color: var(--bg-slate-secondary);
                    color: var(--text-primary);
                    border: 1px solid var(--border-slate);
                    padding: 0.75rem 1rem;
                    border-radius: 4px;
                    width: 100%;
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out, opacity 150ms;
                    font-family: 'Roboto', sans-serif;
                    appearance: none; /* Removes native dropdown arrow for styling if desired, but retaining basic select here */
                }
                
                .dropdown-styled:focus:not(:disabled) {
                    border-color: var(--accent-gold);
                }

                .disabled-select {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background-color: var(--bg-slate-primary);
                }
                
                /* Layout adjustment for larger screens */
                @media (min-width: 640px) {
                    .dropdown-styled-container {
                       grid-template-columns: 1fr 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default VehicleSelector;
