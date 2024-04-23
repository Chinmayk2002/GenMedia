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
      <button onClick={fetchData}>Fetch Data</button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      {imageURL && <img src={imageURL} alt="Generated Image" />}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default Img;
