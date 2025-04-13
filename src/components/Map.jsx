import React from 'react';
import { MapContainer, TileLayer, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ track, lapPoints }) => {
    if (!track || track.length === 0) return null;

    const bounds = track.reduce((bounds, point) => {
        bounds.extend([point.lat, point.lon]);
        return bounds;
    }, L.latLngBounds([track[0].lat, track[0].lon], [track[0].lat, track[0].lon]));

    return (
        <div className='map-container'>
            <MapContainer
                bounds={bounds}
                style={{ height: '400px', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Polyline
                    positions={track.map(point => [point.lat, point.lon])}
                    color="blue"
                />
                {lapPoints.map((pointIndex, index) => (
                    <Circle
                        key={index}
                        center={[track[pointIndex].lat, track[pointIndex].lon]}
                        radius={5}
                        color="red"
                        fillColor="red"
                        fillOpacity={1}
                    />
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;