import React, { useState } from 'react';
import axios from 'axios';

function Img() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const data = { prompt: "horse" };

      const response = await axios.post('https://41df58941b81c1855e.gradio.live/sdapi/v1/txt2img/', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setResponse(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message); // Set error message to state for display
    }
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default Img;
