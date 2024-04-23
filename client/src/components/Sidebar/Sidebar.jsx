import React, { useState } from 'react';
import './Sidebar.css'; // Include CSS for sidebar styling

const Sidebar = ({ onCheckboxChange }) => {
  const [audioChecked, setAudioChecked] = useState(false);
  const [videoChecked, setVideoChecked] = useState(false);

  const handleAudioChange = () => {
    const newValue = !audioChecked;
    setAudioChecked(newValue);
    onCheckboxChange('audio', newValue);
  };

  const handleVideoChange = () => {
    const newValue = !videoChecked;
    setVideoChecked(newValue);
    onCheckboxChange('video', newValue);
  };

  return (
    <div className="sidebar">
      <div className="checkbox">
        <input
          type="checkbox"
          id="audio"
          checked={audioChecked}
          onChange={handleAudioChange}
        />
        <label htmlFor="audio">Audio</label>
      </div>
      <div className="checkbox">
        <input
          type="checkbox"
          id="video"
          checked={videoChecked}
          onChange={handleVideoChange}
        />
        <label htmlFor="video">Video</label>
      </div>
    </div>
  );
};

export default Sidebar;
