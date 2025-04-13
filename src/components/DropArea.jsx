import React, { useState, useRef } from 'react';

const DropArea = ({ onFileChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onFileChange(files[0]);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            onFileChange(files[0]);
        }
    };

    return (
        <div 
            className={`drop-area ${isDragging ? 'active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <p>Drag and drop your GPX file here</p>
            <p>or</p>
            <button onClick={handleBrowseClick}>Browse Files</button>
            <input 
                ref={fileInputRef}
                type="file" 
                className="file-input" 
                onChange={handleFileInput}
                accept=".gpx"
                style={{ display: 'none' }} 
            />
        </div>
    );
};

export default DropArea;