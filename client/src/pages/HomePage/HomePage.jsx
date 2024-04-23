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

  return (<div>
    {/* <Sidebar/> */}
      <GenAudio/>
      <GenImage />
      </div>
  );
};

export default HomePage;
