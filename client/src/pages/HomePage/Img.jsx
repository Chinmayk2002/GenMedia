import React, { useState } from 'react';
import axios from 'axios';

function Img() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const fetchData = async () => {
     try {
      const data = {
        prompt: "horse",
      };

      const response = await fetch('http://localhost:3001/api/forwardRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      setResponse(responseData);
      setImageURL(responseData.images);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div>
      <button className="mb-4 bg-green-500 hover:bg-green-400 transition-colors duration-100 text-white px-4 py-3 rounded-lg font-semibold" onClick={fetchData}>Fetch Data</button>

      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default Img;
