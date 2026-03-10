import { useState } from 'react';
import './App.css';
import InputDashboard from './components/InputDashboard';
import TuningOutput from './components/TuningOutput';
import { generateSetup } from './services/geminiApi';

function App() {
  const [tuningData, setTuningData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handler for when user clicks "Generate Tune"
  const handleGenerateTune = async (telemetryData) => {
    setIsLoading(true);
    setTuningData(null); // Reset output sheet

    try {
      // Pull key natively from where ApiSettingsPanel stored it
      const apiKey = localStorage.getItem('GEMINI_API_KEY');

      // Execute live generation against Google API
      const computedTune = await generateSetup(telemetryData, apiKey);

      setTuningData(computedTune);
    } catch (error) {
      console.error(error);
      setTuningData({
        error: true,
        message: error.message || "Failed to generate tune. Please check your API key and connection."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container layout-grid">
      <InputDashboard
        onGenerate={handleGenerateTune}
        isLoading={isLoading}
      />
      <TuningOutput
        tuningData={tuningData}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
