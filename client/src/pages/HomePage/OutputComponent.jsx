import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import ParticleBackground from './ParticleBackground';

function OutputComponent() {
  const [prompt, setPrompt] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    video: false,
    audio: false,
    image: false,
    checkbox: false,
  });
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeInfo, setEmployeeInfo] = useState({
    name: '',
    age: '',
    favoriteColor: '',
    favoriteMusic: '',
  });
  const [selectedMusicType, setSelectedMusicType] = useState('');

  const employees = ['Nakul', 'Nakul', 'Nakul', 'Nakul', 'Nakul', 'Nakul']; // Hardcoded employee names

  const makeRequest = async () => {
    try {
      setLoading(true);
      // Your fetch request logic
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prompt) {
      const debouncedMakeRequest = AwesomeDebouncePromise(makeRequest, 1000);
      debouncedMakeRequest();
    }
  }, [prompt, selectedOptions, selectedGender, selectedOccasion, selectedEmployee, selectedMusicType]);

  const handleDownloadImage = (imageData, index) => {
    // Your download image logic
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    // Hardcoded employee information for demo purposes
    setEmployeeInfo({
      name: employee,
      age: '30',
      favoriteColor: 'Blue',
      favoriteMusic: 'Rock',
    });
  };

  const handleResetOptions = () => {
    // Reset all selected options
    setSelectedOptions({
      video: false,
      audio: false,
      image: false,
      checkbox: false,
    });
    setSelectedGender('');
    setSelectedOccasion('');
    setSelectedEmployee('');
    setEmployeeInfo({
      name: '',
      age: '',
      favoriteColor: '',
      favoriteMusic: '',
    });
    setSelectedMusicType('');
  };

  return (
    <div className="flex flex-wrap justify-between mx-auto max-w-4xl">
      {/* Upper Left Card - Employee Selection */}
      <div className="w-full md:w-1/2 mb-4 md:mb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="bg-white text-black p-6 rounded-lg border-2 border-orange-500"
        >
          <h2 className="text-xl font-semibold mb-4">Select Employee</h2>
          <select
            value={selectedEmployee}
            onChange={(e) => handleEmployeeSelect(e.target.value)}
            className="w-full p-2 border border-black rounded bg-transparent focus:outline-none"
          >
            <option value="">Select</option>
            {employees.map((employee, index) => (
              <option key={index} value={employee}>
                {employee}
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Lower Left Card - Employee Information */}
      {selectedEmployee && (
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="bg-white text-black p-6 rounded-lg border-2 border-orange-500"
          >
            <h2 className="text-xl font-semibold mb-4">Employee Information</h2>
            <p>Name: {employeeInfo.name}</p>
            <p>Age: {employeeInfo.age}</p>
            <p>Favorite Color: {employeeInfo.favoriteColor}</p>
            <p>Favorite Music: {employeeInfo.favoriteMusic}</p>
          </motion.div>
        </div>
      )}

      {/* Upper Right Card - Checkbox and Occasion Selection */}
      <div className="w-full md:w-1/2 mb-4 md:mb-0">
        {/* Checkbox and Occasion selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="bg-white text-black p-6 rounded-lg border-2 border-orange-500"
        >
          <h2 className="text-xl font-semibold mb-4">Select Options</h2>
          {/* Checkbox selection */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.image}
                onChange={() =>
                  setSelectedOptions({ ...selectedOptions, image: !selectedOptions.image })
                }
                className="form-checkbox text-black focus:ring-black"
              />
              <span className="ml-2 text-black">Image</span>
            </label>
            {/* Other checkboxes */}
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={selectedOptions.audio}
                onChange={() =>
                  setSelectedOptions({ ...selectedOptions, audio: !selectedOptions.audio })
                }
                className="form-checkbox text-black focus:ring-black"
              />
              <span className="ml-2 text-black">Audio</span>
            </label>
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={selectedOptions.video}
                onChange={() =>
                  setSelectedOptions({ ...selectedOptions, video: !selectedOptions.video })
                }
                className="form-checkbox text-black focus:ring-black"
              />
              <span className="ml-2 text-black">Video</span>
            </label>
          </div>
          {/* Occasion selection */}
          <h2 className="text-xl font-semibold mb-4">Select Occasion</h2>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="birthday"
                checked={selectedOccasion === 'birthday'}
                onChange={() => setSelectedOccasion('birthday')}
                className="form-radio text-black focus:ring-black"
              />
              <span className="ml-2 text-black">Birthday</span>
            </label>
            <label className="flex items-center mt-2">
              <input
                type="radio"
                value="anniversary"
                checked={selectedOccasion === 'anniversary'}
                onChange={() => setSelectedOccasion('anniversary')}
                className="form-radio text-black focus:ring-black"
              />
              <span className="ml-2 text-black">Anniversary</span>
            </label>
            <label className="flex items-center mt-2">
              <input
                type="radio"
                value="achievement"
                checked={selectedOccasion === 'achievement'}
                onChange={() => setSelectedOccasion('achievement')}
                className="form-radio text-black focus:ring-black"
              />
              <span className="ml-2 text-black">Achievement</span>
            </label>
          </div>
        </motion.div>
      </div>

      {/* Lower Right Card - Output */}
      <div className="w-full md:w-1/2 mb-4 md:mb-0">
        {/* Output display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="bg-orange-500 text-black p-6 rounded-lg border-2 border-orange-500 relative"
        >
          {/* Output content */}
          <button
            onClick={handleResetOptions}
            className="absolute bottom-0 left-0 right-0 mx-auto bg-orange-600 text-black py-2 px-4 rounded-full hover:bg-orange-700 focus:outline-none"
          >
            GENERATE!
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default OutputComponent;