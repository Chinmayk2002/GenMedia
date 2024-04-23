import { useState } from "react";
import ErrorMessage from "./ErrorMessage";
import "./HomePage.css";



const GenImage = () => {
    const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [prompt, setPrompt] = useState("");
  const fetchData = async () => {
     try {
    //   const data = {
    //     prompt: {prompt},
    //   };
      
      const response = await fetch('http://localhost:3001/api/forwardRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({prompt})
      });

      const responseData = await response.json();
      setResponse(responseData);
      setImageURL(responseData.images);
    } catch (error) {
      setError(error);
    }
  };
    
    const [seed, setSeed] = useState(42);
    const [guidanceScale, setGuidanceScale] = useState(7.5);
    const [numInfSteps, setNumInfSteps] = useState(10);
    const [errorMessage, setErrorMessage] = useState("");
    const [img, setImg] = useState(null);
    const [promptImg, setPromptImg] = useState(null);
    const [loadingImg, setLoadingImg] = useState(false);

    const cleanFormData = () => {
        setPrompt("");
        setSeed(42);
        setGuidanceScale(7.5);
        setNumInfSteps(5);
        setLoadingImg(false);
        setErrorMessage("");
    }

    // create a function that handles creating the lead
    // const handleGenerateImage = async (e) => {

    //     const requestOptions = {
    //         method: "POST", 
    //         headers: {"Content-Type": "application/json"}, 
            
    //     };

    //     setLoadingImg(true);
    //     // body: JSON.stringify(`prompt=${prompt}&num_inference_steps=${numInfSteps}&guidance_scale=${guidanceScale}&seed=`)
    //     const response = await fetch(`/api/generate/?prompt=${prompt}&num_inference_steps=${numInfSteps}&guidance_scale=${guidanceScale}&seed=${seed}`, requestOptions);
        
    //     if (!response.ok){
    //         setErrorMessage("Ooops! Something went wrong generating the image");
    //     } else {
    //         const imageBlob = await response.blob();
    //         const imageObjectURL = URL.createObjectURL(imageBlob);
    //         setImg(imageObjectURL);
    //         setPromptImg(prompt);
    //         cleanFormData();
    //     }
    // }

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     setImg(null);
    //     setPromptImg(null);
    //     handleGenerateImage();
    // }

    return (
      <div className="container mx-auto p-8">
        <div className="columns is-vcentered">
            <div className="column">
                
                    <h1 className="title has-text-centered is-4 text-5xl heading-spacing image-gen-column">ImageGen</h1>

                    <div className="field">
                        {/* <label className="label">Prompt</label> */}
                        <div className="control">
                            <input 
                                type="text" 
                                placeholder="Enter your prompt to generate the image..." 
                                value={prompt} 
                                onChange={(e) =>setPrompt(e.target.value)}
                                className="textarea w-full input-text "
                                required
                            /> 
                        </div>
                    </div>         
                        <ErrorMessage message={errorMessage}/>
                    <br /> 
                    <div className="container1">
                        <button className="generate-button" onClick={fetchData}>Generate Image</button>
                    </div>
                
            </div>
            <div className="column">
            {/* {imageURL &&  <img src={`data:image/jpeg;base64,${imageURL}`} alt="Your Image" />} */}
            { imageURL ? ( 
            <figure>
                {/* <img src={img} alt="genimage" /> */}
                {imageURL &&  <img src={`data:image/jpeg;base64,${imageURL}`} alt="Your Image" />}
                <figcaption>{prompt}</figcaption>
            </figure> ) 
                  : <></>
            }
            { imageURL ? (
                <progress className="progress is-small is-primary" max="100">Loading</progress>
            ) : <></>
            }
            </div>
        </div>
        </div>
        
    )


}

export default GenImage
