import React, { useState, useRef } from 'react';
import DropArea from './DropArea';
import Results from './Results';
import Map from './Map';
import { parseGPX } from '../utils/gpxParser';
import { countLaps, separateCircularPaths, removeDuplicatePoints } from '../utils/lapDetector';

const GPXLapCounter = () => {
    const [track, setTrack] = useState(null);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [circularPaths, setCircularPaths] = useState(null);

    const handleFileChange = (selectedFile) => {
        // Clear previous states
        setError(null);
        setResults(null);
        setTrack(null);
        setCircularPaths(null);
        setLoading(true);

        // Validate file input
        if (!selectedFile || !(selectedFile instanceof File)) {
            setError('No file selected');
            setLoading(false);
            return;
        }

        if (!selectedFile.name.toLowerCase().endsWith('.gpx')) {
            setError('Please select a valid GPX file');
            setLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const allPoints = removeDuplicatePoints(parseGPX(e.target.result));
                const { circularPaths } = separateCircularPaths(allPoints);
                const data = countLaps(circularPaths, 10);
                setTrack(allPoints);
                setCircularPaths(circularPaths);
                setResults(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = () => {
            setError('Error reading file');
            setLoading(false);
        };

        reader.readAsText(selectedFile);
    };

    return (
        <div className="gpx-lap-counter">
            <h1>GPX Lap Counter</h1>
            <DropArea onFileChange={handleFileChange} />
            {loading && <div className="loading">Analyzing GPX file...</div>}
            {error && <div className="error">{error}</div>}
            <div className="maps-container">
                {track && circularPaths && results && (
                    <div className="map-section">
                        <h2>Entire Path</h2>
                        <Map track={track} lapPoints={[]} />
                        <h2>Laps</h2>
                        <Map track={circularPaths} lapPoints={results.lapPoints} />
                        <Results results={results} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default GPXLapCounter;