import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AutoTokenizer,
  MusicgenForConditionalGeneration,
  BaseStreamer,
} from "@xenova/transformers";
import { encodeWAV, share } from "./utils.js";
import Img from "./Img.jsx";
import GenImage from "./GenImage.jsx";
import { AuthState } from "../../context/AuthProvider";
import { Notify } from "../../utils";
import "./HomePage.css"; // Import CSS file for styling

const MODEL_ID = "Xenova/musicgen-small";
const EXAMPLES = [
  "80s pop track with bassy drums and synth",
  "90s rock song with loud guitars and heavy drums",
  "a light and cheerly EDM track, with syncopated drums, aery pads, and strong emotions bpm: 130",
  "A cheerful country song with acoustic guitars",
  "lofi slow bpm electro chill with organic samples",
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

  return (<div className="flex flex-wrap justify-between mx-auto max-w-4xl">
    <div className="container mx-auto p-8">
      <h1 className="text-5xl font-bold mb-2">MusicGen</h1>

      <input
        type="text"
        placeholder="Describe the music to generate..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        className="input-text"
      />

      <div className="flex flex-wrap justify-center gap-4">
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
          <p className="text-center">{`${duration} second${
            duration > 1 ? "s" : ""
          }`}</p>
        </div>
      </div>

      {/* <div className="container1">
        <button className="generate-button" onClick={generateMusic}>
          Generate Music
        </button>
      </div> */}

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
        {SHARING_ENABLED && result && (
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
      </div>

      {/* <Img /> */}
      <GenImage />
    </div>
    </div>
  );
};

export default HomePage;
