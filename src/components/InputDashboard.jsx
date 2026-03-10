import { useState } from 'react';
import ApiSettingsPanel from './ApiSettingsPanel';
import VehicleSelector from './VehicleSelector';

function InputDashboard({ onGenerate, isLoading }) {
    const [telemetry, setTelemetry] = useState({
        carName: '',
        weight: '',
        weightDistributionFront: '',
        horsepower: '',
        drivetrain: '',
        piClass: 'A',
        raceType: 'Street',
        model: 'gemini-3.1-pro-preview'
    });
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTelemetry(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVehicleChange = (vehicleString) => {
        setTelemetry(prev => ({
            ...prev,
            carName: vehicleString
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerate(telemetry);
    };

    return (
        <div className="card">
            <h1 className="header-title">Apex<span className="text-gold">Tuning</span></h1>
            <div className="header-accent"></div>

            <ApiSettingsPanel />

            <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                <div className="form-group">
                    <label>Select Vehicle</label>
                    <VehicleSelector
                        onVehicleChange={handleVehicleChange}
                        initialValue={telemetry.carName}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}
                    >
                        {isAdvancedMode ? '- Hide Advanced Telemetry' : '+ Override Stock Telemetry'}
                    </button>
                </div>

                {isAdvancedMode && (
                    <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-slate)', marginBottom: '1.25rem' }}>
                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Manual Overrides (Upgraded Cars)</h4>
                        <div className="form-group">
                            <label>Override Weight (lbs)</label>
                            <input
                                type="number"
                                name="weight"
                                value={telemetry.weight}
                                onChange={handleChange}
                                placeholder="Leave blank to use stock"
                            />
                        </div>

                        <div className="form-group">
                            <label>Override Distribution (%)</label>
                            <input
                                type="number"
                                name="weightDistributionFront"
                                value={telemetry.weightDistributionFront}
                                onChange={handleChange}
                                placeholder="Leave blank to use stock"
                                step="0.1"
                            />
                        </div>

                        <div className="form-group">
                            <label>Override Horsepower</label>
                            <input
                                type="number"
                                name="horsepower"
                                value={telemetry.horsepower}
                                onChange={handleChange}
                                placeholder="Leave blank to use stock"
                            />
                        </div>

                        <div className="form-group">
                            <label>Override Drivetrain</label>
                            <select name="drivetrain" value={telemetry.drivetrain} onChange={handleChange}>
                                <option value="">Use Stock Drivetrain</option>
                                <option value="RWD">RWD / Swap</option>
                                <option value="AWD">AWD / Swap</option>
                                <option value="FWD">FWD / Swap</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label>Target PI Class</label>
                    <select name="piClass" value={telemetry.piClass} onChange={handleChange}>
                        <option value="D">D Class</option>
                        <option value="C">C Class</option>
                        <option value="B">B Class</option>
                        <option value="A">A Class</option>
                        <option value="S1">S1 Class</option>
                        <option value="S2">S2 Class</option>
                        <option value="X">X Class</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Race Type Discipline</label>
                    <select name="raceType" value={telemetry.raceType} onChange={handleChange}>
                        <option value="Street">Street / Road Racing</option>
                        <option value="Drag">Drag Strip</option>
                        <option value="Dirt">Dirt / Rally</option>
                        <option value="Cross Country">Cross Country</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Gemini AI Model String</label>
                    <select name="model" value={telemetry.model} onChange={handleChange} style={{ fontWeight: '500' }}>
                        <optgroup label="Fast / Cost-Effective (Flash/Lite)">
                            <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</option>
                            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                            <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite</option>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            <option value="gemini-3-flash-preview">Gemini 3.0 Flash</option>
                            <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash-Lite</option>
                        </optgroup>
                        <optgroup label="Deep Reasoning Physics Physics (Pro/Deep Think)">
                            <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                            <option value="gemini-3-pro-preview">Gemini 3.0 Pro</option>
                            <option value="gemini-3-deep-think-preview">Gemini 3.0 Deep Think</option>
                            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Recommended)</option>
                        </optgroup>
                    </select>
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '2rem' }}>
                    {isLoading ? "Generating Tune..." : "Generate Tune"}
                </button>
            </form>
        </div>
    );
}

export default InputDashboard;
