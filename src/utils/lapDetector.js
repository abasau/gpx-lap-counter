// Calculate distance between two GPS points using the Haversine formula
const calculateDistance = (point1, point2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lon - point1.lon) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
};

// Format time in MM:SS or HH:MM:SS format
const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};

// Detect laps in the track
const countLaps = (points, thresholdDistance = 25) => {
    if (points.length < 10) {
        return { laps: 0, lapPoints: [] };
    }

    // Start position is the first point
    const startPosition = points[0];
    const lapPoints = [];
    let lastLapPoint = 0;

    // We need to move a minimum distance away before we can count a new lap
    // This prevents small GPS fluctuations from being counted as laps
    const minDistanceForNewLap = 50; // meters
    let maxDistanceFromStart = 0;
    let hasMovedAwayFromStart = false;

    // Start counting from the 2nd point to avoid counting the start as a lap
    for (let i = 1; i < points.length; i++) {
        const currentPoint = points[i];

        // Calculate distance from starting point
        const distanceFromStart = calculateDistance(startPosition, currentPoint);

        // Track maximum distance from start to confirm we're actually making laps
        if (distanceFromStart > maxDistanceFromStart) {
            maxDistanceFromStart = distanceFromStart;
            if (maxDistanceFromStart > minDistanceForNewLap) {
                hasMovedAwayFromStart = true;
            }
        }

        // If we're close to the start position and have moved away sufficiently since the last lap
        if (distanceFromStart < thresholdDistance && hasMovedAwayFromStart) {
            // Make sure we're not counting the same lap (require minimum points between laps)
            if (i - lastLapPoint > 5) {
                lapPoints.push(i);
                lastLapPoint = i;
                maxDistanceFromStart = 0;
                hasMovedAwayFromStart = false; // Reset for next lap
            }
        }
    }

    const lapDetails = lapPoints.map((pointIndex, lapIndex) => {
        const lapTime = points[pointIndex].time;
        const prevLapTime = lapIndex > 0 ? points[lapPoints[lapIndex - 1]].time : points[0].time;

        let lapDuration = null;
        if (lapTime && prevLapTime) {
            lapDuration = (lapTime - prevLapTime) / 1000; // Duration in seconds
        }

        return {
            lapNumber: lapIndex + 1,
            pointIndex: pointIndex,
            time: lapTime || 'unknown',
            durationSeconds: lapDuration,
            formattedDuration: lapDuration ? formatTime(lapDuration) : 'unknown'
        };
    });


    const averageLapTimeFirstPass = lapDetails.reduce((total, lap) => total + (lap.durationSeconds || 0), 0) / lapDetails.length;
    const lapDetailsWithoutBreaks = lapDetails.filter(lap => lap.durationSeconds < averageLapTimeFirstPass * 5);
    const averageLapTime = lapDetailsWithoutBreaks.filter(lap => lap.durationSeconds < averageLapTimeFirstPass * 5).reduce((total, lap) => total + (lap.durationSeconds || 0), 0) / lapDetailsWithoutBreaks.length;

    const totalTime = lapDetailsWithoutBreaks.reduce((total, lap) => total + (lap.durationSeconds || 0), 0);

    return {
        laps: lapPoints.length,
        totalTime: formatTime(totalTime),
        averageLapTime: formatTime(averageLapTime),
        lapPoints,
        lapDetails
    };
};

const getHistogramBucketPoint = (point, binSize) => {
    const lat = Math.floor(point.lat / binSize) * binSize + binSize / 2;
    const lon = Math.floor(point.lon / binSize) * binSize + binSize / 2;

    return { lat, lon };
};

const getPointKey = ({ lat, lon }) => (`${lat},${lon}`);

const createHistogram = (points) => {
    const bins = new Map();

    points.forEach(point => {
        const key = getPointKey(point);
        bins.set(key, (bins.get(key) || 0) + 1);
    });

    return bins;
};

const removeDuplicatePoints = (points, minDistance = 10) => {
    if (points.length < 2) return points;

    const filteredPoints = [points[0]];
    let lastPoint = points[0];

    for (let i = 1; i < points.length; i++) {
        const currentPoint = points[i];
        const distance = calculateDistance(lastPoint, currentPoint);

        if (distance >= minDistance) {
            filteredPoints.push(currentPoint);
            lastPoint = currentPoint;
        }
    }

    return filteredPoints;
};

const separateCircularPaths = (points, binSize = 0.0001) => {
    const circularPaths = [];

    const bucketPoints = points.map(point => getHistogramBucketPoint(point, binSize));
    const histogram = createHistogram(bucketPoints, binSize);

    points.forEach(point => {
        const bucketPoint = getHistogramBucketPoint(point, binSize);
        const histogramBucket = histogram.get(getPointKey(bucketPoint));

        if (histogramBucket > 5) {
            //circularPaths.push({ ...point, ...bucketPoint });
            circularPaths.push(point);
        }

    });

    return { circularPaths };
};

export { countLaps, separateCircularPaths, removeDuplicatePoints };