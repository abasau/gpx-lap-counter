function parseGPX(gpxContent) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxContent, "text/xml");
    
    const trackPoints = Array.from(xmlDoc.querySelectorAll('trkpt'));
    
    return trackPoints.map(point => {
        const lat = parseFloat(point.getAttribute('lat'));
        const lon = parseFloat(point.getAttribute('lon'));
        const timeElement = point.querySelector('time');
        const time = timeElement ? new Date(timeElement.textContent) : null;
        
        return { lat, lon, time };
    });
}

export { parseGPX };