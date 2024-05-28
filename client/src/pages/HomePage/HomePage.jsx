import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GenAudio from "./GenAudio.jsx";
import GenImage from "./GenImage.jsx";
import { AuthState } from "../../context/AuthProvider";
import { Notify } from "../../utils";
import { useEffect, useRef } from "react";
import {
  AutoTokenizer,
  MusicgenForConditionalGeneration,
  BaseStreamer,
} from "@xenova/transformers";
import { encodeWAV, share } from "./utils.js";
import "./HomePage.css";
import ErrorMessage from "./ErrorMessage";
import "./HomePage.css"; // Import CSS file for styling
// import Sidebar from "../../components/Sidebar/Sidebar.jsx"

const MODEL_ID = "Xenova/musicgen-small";
const EXAMPLES = [
  // "Funky disco groove with groovy basslines and funky guitar riffs",
  // "Ethereal space ambient with atmospheric pads and cosmic textures",
  // "Aggressive trap beat with hard-hitting 808s and sharp hi-hats",
  // "Smooth jazz fusion with intricate saxophone solos and laid-back drums",
  // "Experimental glitch-hop with glitchy beats and warped synths",
];

const SHARING_ENABLED = window.location.host.endsWith(".hf.space");

class CallbackStreamer extends BaseStreamer {
  constructor(callback_fn) {
    super();
    this.callback_fn = callback_fn;
  }

  put(value) {
    return this.callback_fn(value);
  }

  end() {
    return this.callback_fn();
  }
}

const HomePage = () => {
  const employeess = [
    { name: 'Elon Musk', age: 30, favoriteMusic: 'A light and cheerly EDM track, with syncopated drums, aery pads, and strong emotions bpm: 130' },
    { name: 'Barak Obama', age: 45, favoriteMusic: '80s pop track with bassy drums and synth' },
    { name: 'Justin Bieber', age: 28, favoriteMusic: 'Lofi slow bpm electro chill with organic samples' }
  ];

  const handleEmployeeChange = (event) => {
    const index = event.target.value;
    setSelectedEmployee(employeess[index]);
    setTextInput(employeess[index].favoriteMusic);
    setPrompt(employeess[index].name + " celebrating " + selectedOccasion);
    if (selectedOccasion == "Custom") {
      setTextInput("");
      setPrompt("");
    }
  };

  const handleMultiTriggers = (e) => {
    generateMusic();
    fetchData();
  };
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [dispurl, setDispurl] = useState('');
  const [textInput, setTextInput] = useState();
  const [progress, setProgress] = useState(0);
  const [loadProgress, setLoadProgress] = useState({});
  const [statusText, setStatusText] = useState("Loading model (656MB)...");
  const [result, setResult] = useState(null);
  const audioRef = useRef(null);

  const modelPromise = useRef(null);
  const tokenizerPromise = useRef(null);

  const [guidanceScale, setGuidanceScale] = useState(3);
  const [temperature, setTemperature] = useState(1);
  const [duration, setDuration] = useState(10);

  useEffect(() => {
    modelPromise.current ??= MusicgenForConditionalGeneration.from_pretrained(
      MODEL_ID,
      {
        progress_callback: (data) => {
          if (data.status !== "progress") return;
          setLoadProgress((prev) => ({ ...prev, [data.file]: data }));
        },
        dtype: {
          text_encoder: "q8",
          decoder_model_merged: "q8",
          encodec_decode: "fp32",
        },
        device: "wasm",
      }
    );

    tokenizerPromise.current ??= AutoTokenizer.from_pretrained(MODEL_ID);
  }, []);

  useEffect(() => {
    const items = Object.values(loadProgress);
    if (items.length !== 5) return;
    let loaded = 0;
    let total = 0;
    for (const data of Object.values(loadProgress)) {
      loaded += data.loaded;
      total += data.total;
    }
    const progress = loaded / total;
    setProgress(progress);
    setStatusText(
      progress === 1
        ? "Ready!"
        : `Loading model (${(progress * 100).toFixed()}% of 656MB)...`
    );
  }, [loadProgress]);

  const generateVideo = async (image, audio) => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('audio', audio);

    try {
      const response = await fetch('http://localhost:3002/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const videoBlob = await response.blob();
        return videoBlob;
      } else {
        const errorText = await response.text();
        console.error('Failed to create video:', errorText);
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };


  const handleDownload = () => {
    if (!dispurl) {
      alert('No video available for download.');
      return;
    }
    const link = document.createElement('a');
    link.href = dispurl;
    link.download = 'generated_video.mp4';
    link.click();
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleAudioChange = (e) => {
    setAudio(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !audio) {
      alert('Please provide both image and audio files.');
      return;
    }

    const videoUrl = await generateVideo(image, audio);
    if (videoUrl) {
      const url = URL.createObjectURL(videoUrl);
      setDispurl(url);
    } else {
      alert('Failed to create video.');
    }
  };

  const generateMusic = async () => {
    audioRef.current.src = "";
    setResult(null);

    const tokenizer = await tokenizerPromise.current;
    const model = await modelPromise.current;

    const maxLength = Math.min(
      Math.max(Math.floor(duration * 50), 1) + 4,
      model.generation_config.max_length ?? 1500
    );

    const streamer = new CallbackStreamer((value) => {
      const percent = value === undefined ? 1 : value[0].length / maxLength;
      setStatusText(`Generating (${(percent * 100).toFixed()}%)...`);
      setProgress(percent);
    });

    const inputs = tokenizer(textInput);

    const audioValues = await model.generate({
      ...inputs,
      max_length: maxLength,
      guidance_scale: guidanceScale,
      temperature: temperature,
      streamer: streamer,
    });

    setStatusText("Encoding audio...");

    const samplingRate = model.config.audio_encoder.sampling_rate;
    const wav = encodeWAV(audioValues.data, samplingRate);
    const blob = new Blob([wav], { type: "audio/wav" });
    setResult(blob);

    audioRef.current.src = URL.createObjectURL(blob);
    setStatusText("Done!");
  };

  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [prompt, setPrompt] = useState("");
  const fetchData = async () => {
    try {


      const response = await fetch('http://localhost:3001/api/forwardRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      const responseData = await response.json();
      setResponse(responseData);
      console.log(response);
      setImageURL(responseData.images);
    } catch (error) {
      setError(error);
    }
  };

  const [seed, setSeed] = useState(42);
  // const [guidanceScale, setGuidanceScale] = useState(7.5);
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

  const employees = ['Elon Musk', 'Barak Obama', 'Justin Bieber'];

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


  function downloadImage(elementId) {
    // Get the image element by its ID
    const imageElement = document.getElementById(elementId);

    // Check if the element exists and is an image
    if (imageElement && imageElement.tagName.toLowerCase() === 'img') {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Set the canvas dimensions to match the image
      canvas.width = 512;
      canvas.height = 512;

      // Draw the image onto the canvas
      context.drawImage(imageElement, 0, 0);

      // Convert the canvas content to a data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg');

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = 'saved_image.jpg';

      // Click the link to download the image
      link.click();
    } else {
      console.error('Invalid image element or ID:', elementId);
    }
  }




  function downloadAudio() {
    const audioBlob = new Blob([result], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated_audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="employee-container">
      <div className="employee-section">
        <h3 className="special-heading p-2 m-2">
          Create Media Tailored Just For You
        </h3>

        <div>
          <h2>Select Employee</h2>
          <select
            className="w-full p-2 border border-black rounded bg-transparent focus:outline-none"
            onChange={handleEmployeeChange}
          >
            <option value="">Select an employee</option>
            {employeess.map((employee, index) => (
              <option key={index} value={index}>
                {employee.name}
              </option>
            ))}
          </select>
          {selectedEmployee && (
            <div className="selected-employee">
              <h2>Selected Employee</h2>
              <p>Name: {selectedEmployee.name}</p>
              <p>Age: {selectedEmployee.age}</p>
              <p>Favorite Music: {selectedEmployee.favoriteMusic}</p>
            </div>
          )}
        </div>
      </div>
      <div className="options-section customflex">
        <div className="mb-4">
          <h2>Select Occasion</h2>
          <label className="option-label">
            <input
              type="radio"
              value="birthday"
              checked={selectedOccasion === "birthday"}
              onChange={() => setSelectedOccasion("birthday")}
              className="form-radio text-black focus:ring-black"
            />
            <span className="text-black">Birthday</span>
          </label>
          <label className="option-label">
            <input
              type="radio"
              value="Anniversary"
              checked={selectedOccasion === "Anniversary"}
              onChange={() => setSelectedOccasion("Anniversary")}
              className="form-radio text-black focus:ring-black"
            />
            <span className="text-black">Anniversary</span>
          </label>
          <label className="option-label">
            <input
              type="radio"
              value="Achievement"
              checked={selectedOccasion === "Achievement"}
              onChange={() => setSelectedOccasion("Achievement")}
              className="form-radio text-black focus:ring-black"
            />
            <span className="text-black">Achievement</span>
          </label>
        </div>
        <div className="mb-4">
          <h2>Select Options</h2>
          <label className="option-label">
            <input
              type="checkbox"
              checked={selectedOptions.image}
              onChange={() =>
                setSelectedOptions({
                  ...selectedOptions,
                  image: !selectedOptions.image,
                })
              }
              className="form-checkbox text-black focus:ring-black"
            />
            <span className="text-black">Image</span>
          </label>
          <label className="option-label">
            <input
              type="checkbox"
              checked={selectedOptions.audio}
              onChange={() =>
                setSelectedOptions({
                  ...selectedOptions,
                  audio: !selectedOptions.audio,
                })
              }
              className="form-checkbox text-black focus:ring-black"
            />
            <span className="text-black">Audio</span>
          </label>
          <label className="option-label">
            <input
              type="checkbox"
              checked={selectedOptions.video}
              onChange={() =>
                setSelectedOptions({
                  ...selectedOptions,
                  video: !selectedOptions.video,
                })
              }
              className="form-checkbox text-black focus:ring-black"
            />
            <span className="text-black">Video</span>
          </label>
        </div>

        {/* </motion.div> */}
      </div>
      {selectedOptions.image ? (
        <div className="container mx-auto p-8">
          <div className="columns is-vcentered">
            <div className="column">
              <h1 className="title has-text-centered is-4 text-5xl heading-spacing image-gen-column">
                ImageGen
              </h1>

              <div className="field">
                {/* <label className="label">Prompt</label> */}
                <div className="control">
                  <input
                    type="text"
                    placeholder="Enter your prompt to generate the image..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="textarea w-full input-text "
                    required
                  />
                </div>
              </div>
              <ErrorMessage message={errorMessage} />

              <div className="container1">
                <button className="generate-button mb-5" onClick={fetchData}>
                  Generate Image
                </button>
              </div>
            </div>
            <div className="column">
              {/* {imageURL &&  <img src={`data:image/jpeg;base64,${imageURL}`} alt="Your Image" />} */}
              {imageURL ? (<>

                <figure >
                  {/* <img src={img} alt="genimage" /> */}
                  {imageURL && (
                    <img className="w-100"
                      id="imagedwl" src={`data:image/jpeg;base64,${imageURL}`}
                      alt="Your Image"
                    />
                  )}
                  {/* <figcaption>{prompt}</figcaption> */}
                </figure>
                <div className="container1">
                  <button
                    className="generate-button mt-2"
                    onClick={() => downloadImage("imagedwl")}
                  >
                    Download Image
                  </button>
                </div>
              </>

              ) : (
                <></>
              )}
              {imageURL ? (
                <progress className="progress is-small is-primary" max="100">
                  Loading
                </progress>
              ) : (
                <></>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div></div>
      )}
      {selectedOptions.audio ? (
        <div className="flex flex-wrap justify-between mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold mb-2 my-5">MusicGen</h1>
          <div className="container mx-auto p-8">


            <input
              type="text"
              placeholder="Describe the music to generate..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="input-text"
            />

            <div className="flex flex-wrap justify-center gap-4 w-100">
              <h2 className="text-5xl dph" >‎
                ‎ ‎ ‎ ‎‎
                ‎ ‎ ‎ ‎
                ‎
                ‎ ‎ ‎ ‎
                ‎
                ‎ ‎ ‎ ‎
                ‎
                ‎ ‎ ‎ ‎
                ‎
                ‎ ‎ ‎ ‎
                ‎
                ‎ ‎ ‎ ‎
                ‎
                ‎ ‎ ‎ ‎
                ‎
                ‎ ‎ ‎ ‎
                ‎
                ‎ ‎ ‎ ‎
                ‎

              </h2>
              {EXAMPLES.map((example, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-blue-400 to-blue-700 text-white rounded-md p-4 w-64 transform hover:-translate-y-2 transition-transform duration-300"
                >
                  <p className="text-xl font-bold">{example}</p>
                  <button
                    onClick={() => setTextInput(example)}
                    className="bg-white text-blue-700 font-semibold px-4 py-2 mt-4 rounded-md hover:bg-blue-100 transition duration-300"
                  >
                    Use This!
                  </button>
                </div>
              ))}
            </div>

            <div className="flex-container">
              <div className="duration-container mt-8">
                <label className="block mb-2">Duration</label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full"
                  style={{ height: "10px" }} // Optional inline style for height
                />
                <p className="text-center">{`${duration} second${duration > 1 ? "s" : ""
                  }`}</p>
              </div>
            </div>

            <div className="progress-bar">
              <div
                className="progress-bar-inner"
                style={{ width: `${100 * progress}%` }}
              ></div>
            </div>
            <p>{statusText}</p>
            <div className="container1">
              <button className="generate-button" onClick={generateMusic}>
                Generate Music
              </button>
            </div>
            <div className="audio-player">
              <audio ref={audioRef} controls />
              {result && (
                <>
                  <button className="generate-button" onClick={downloadAudio}>
                    Download Audio
                  </button>
                  {SHARING_ENABLED && (
                    <button
                      className="share-button"
                      onClick={async () => {
                        await share(result, {
                          prompt: textInput,
                          duration,
                          guidanceScale,
                          temperature,
                        });
                      }}
                    >
                      Share
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      {selectedOptions.video ? (
        <div className="container mx-auto p-8">
          <h1 className="text-5xl font-bold mb-2">VideoGen</h1>
          <div className="container">
            <form className="p-2" onSubmit={handleSubmit}>
              <div className="form-group m-3">
                <label htmlFor="imageInput">Image File:</label>
                <input type="file" id="imageInput" className="form-control" onChange={handleImageChange} />
              </div>
              <div className="form-group m-3">
                <label htmlFor="audioInput">Audio File:</label>
                <input type="file" id="audioInput" className="form-control" onChange={handleAudioChange} />
              </div>
              <button type="submit" className="generate-button mt-4">Generate Video</button>
            </form>
            <div id="result" className="mt-4">
              {dispurl && <video controls src={dispurl}></video>}
            </div>
            <button type="button" className="generate-button mt-4" onClick={handleDownload}>Download Video</button>
          </div>

        </div>
      ) : (
        <></>
      )}

    </div>
  );

};

export default HomePage;
