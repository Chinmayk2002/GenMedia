import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import GenAudio from "./GenAudio.jsx";
import GenImage from "./GenImage.jsx";
import { AuthState } from "../../context/AuthProvider";
import { Notify } from "../../utils";
import "./HomePage.css"; // Import CSS file for styling
// import Sidebar from "../../components/Sidebar/Sidebar.jsx"

const HomePage = () => {
  const [privateMessage, setPrivateMessage] = useState("");
  const navigate = useNavigate();
  const { auth } = AuthState();

  const fetchPrivateData = async () => {
    try {
      const response = await fetch("/api/private", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setPrivateMessage(data.data);
        return Notify(data.data, "success");
      } else {
        navigate("/login");
        return Notify("You are not authorized, please login", "error");
      }
    } catch (error) {
      localStorage.removeItem("auth");
      navigate("/login");
      return Notify("Internal server error", "error");
    }
  };

  const employees = ['Elon Musk', 'Barak Obama','Justin Bieber'];
  
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeInfo, setEmployeeInfo] = useState({
    name: '',
    age: '',
    favoriteMusic: '',
  });
  const [selectedOptions, setSelectedOptions] = useState({
    video: false,
    audio: false,
    image: false,
    checkbox: false,
  });
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    // Hardcoded employee information for demo purposes
    setEmployeeInfo({
      name: employee,
      age: '25',
      favoriteMusic: 'Rock',
    });
  };

  return (<div>
    {/* <Sidebar/> */}
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
          {selectedEmployee && (
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="bg-orange-500 text-black p-6 rounded-lg border-2 border-orange-500"
          > */}
            <h2 className="text-xl font-semibold mb-4">Employee Information</h2>
            <p>Name: {employeeInfo.name}</p>
            <p>Age: {employeeInfo.age}</p>
            <p>Favorite Music: {employeeInfo.favoriteMusic}</p>
          {/* </motion.div> */}
        </div>
      )}
      <div className="w-full md:w-1/2 mb-4 md:mb-0">
        {/* Checkbox and Occasion selection */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="bg-orange-500 text-black p-6 rounded-lg border-2 border-orange-500"
        > */}
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
          </div>
        {/* </motion.div> */}
      </div>
      {selectedOptions.image?(<GenImage />):(<div></div>)}
      {selectedOptions.audio?(<GenAudio/>):(<div></div>)}
      
      
      </div>
  );
};

export default HomePage;
