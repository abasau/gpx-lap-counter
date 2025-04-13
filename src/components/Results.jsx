import React from 'react';

const Results = ({ results }) => {
    return (
        <div className="results">
            <h2>Analysis Results</h2>
            <div className="summary-stats">
                <div className="stat-box">
                    <div className="stat-label">Laps Detected</div>
                    <div className="stat-value">{results.laps}</div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">Total Time</div>
                    <div className="stat-value">{results.totalTime}</div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">Avg Lap Time</div>
                    <div className="stat-value">{results.averageLapTime}</div>
                </div>
            </div>
            <p>Total track points: {results.trackPoints}</p>
            {results.lapDetails && results.lapDetails.length > 0 && (
                <div className="lap-details">
                    <h3>Lap Details</h3>
                    <ul>
                        {results.lapDetails.map((lap, index) => (
                            <li key={index}>
                                Lap {lap.lapNumber}: {lap.formattedDuration} at {lap.time.toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Results;