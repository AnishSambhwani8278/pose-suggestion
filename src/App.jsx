import { useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Settings, Wand2, X, Info } from "lucide-react";

const App = () => {
  const cam = useRef(null);
  const [result, setResult] = useState("");
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [pose, setPose] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("geminiApiKey") || "");
  const [isInitializing, setIsInitializing] = useState(true);

  const urls = [
    "poses/pose1.png",
    "poses/pose2.png",
    "poses/pose3.png",
    "poses/pose4.png",
    "poses/pose5.png",
    "poses/pose6.png",
    "poses/pose7.png",
    "poses/pose8.png",
    "poses/pose9.png",
    "poses/pose10.png",
    "poses/pose11.png",
    "poses/pose12.png",
    "poses/pose13.png",
    "poses/pose14.png",
    "poses/pose15.png",
    "poses/pose16.png",
    "poses/pose17.png",
    "poses/pose18.png",
    "poses/pose19.png",
    "poses/pose20.png",
    "poses/pose21.png",
    "poses/pose22.png",
    "poses/pose23.png",
    "poses/pose24.png",
    "poses/pose25.png",
    "poses/pose26.png",
    "poses/pose27.png",
    "poses/pose28.png",
    "poses/pose29.png",
    "poses/pose30.png"
  ];

  useEffect(() => {
    let ignore = false;
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === "videoinput");
        if (!ignore) setCameras(videoDevices);

        const activeTrack = stream.getVideoTracks()[0];
        const activeDevice = videoDevices.find(d => d.label === activeTrack.label);

        if (!ignore) {
          if (activeDevice) {
            setSelectedCameraId(activeDevice.deviceId);
          } else if (videoDevices.length > 0) {
            setSelectedCameraId(videoDevices[0].deviceId);
          }
          if (cam.current) {
            cam.current.srcObject = stream;
          }
        } else {
          stream.getTracks().forEach(t => t.stop());
        }
      } catch (e) {
        console.error("Init error:", e);
      } finally {
        if (!ignore) setIsInitializing(false);
      }
    };
    initCamera();
    return () => { ignore = true; };
  }, []);

  const handleApiKeyChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem("geminiApiKey", newKey);
  };

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
  });

  const getCroppedCanvas = (video) => {
    const canvas = document.createElement("canvas");
    const containerRatio = video.clientWidth / video.clientHeight;
    const videoRatio = video.videoWidth / video.videoHeight;

    let sWidth = video.videoWidth;
    let sHeight = video.videoHeight;
    let sx = 0;
    let sy = 0;

    if (containerRatio > videoRatio) {
      sHeight = video.videoWidth / containerRatio;
      sy = (video.videoHeight - sHeight) / 2;
    } else {
      sWidth = video.videoHeight * containerRatio;
      sx = (video.videoWidth - sWidth) / 2;
    }

    canvas.width = sWidth;
    canvas.height = sHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
    return canvas;
  };

  const saveFrame = () => {
    const video = cam.current;
    if (!video) return;
    const canvas = getCroppedCanvas(video);
    const dataUrl = canvas.toDataURL("image/jpeg");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `image-${Date.now()}.jpeg`;
    link.click();
    setPose(null);
  }

  const captureFrame = () => {
    if (!cam.current) return null;
    const video = cam.current;
    const canvas = getCroppedCanvas(video);
    const dataURL = canvas.toDataURL("image/jpeg");
    return {
      inlineData: {
        data: dataURL.split(",")[1],
        mimeType: "image/jpeg",
      },
    };
  };

  const run = async () => {
    const frameData = captureFrame();
    if (!frameData) return;

    setResult("Analyzing...");
    try {
      const result = await model.generateContent([
        {
          text: `Analyze this image and suggest 1 pose out of these and just return the numerical index of the best pose. 
          0. Front Standing Pose with Both Hands in Pants Pockets – relaxed upright posture, shoulders neutral, feet shoulder-width apart, both hands casually inserted into front pockets, facing camera directly.
          1. Front Standing Pose with Raised Peace Sign Gesture – upright neutral standing position, one arm relaxed downward, opposite arm lifted beside shoulder making a V-sign/peace sign with fingers.
          2. Front Standing Pose with Arms Folded Across Chest – upright posture, both arms crossed naturally over torso, feet apart, confident casual stance.
          3. Standing Cross-Legged Pose with One Knee Bent – body facing forward, weight on one straight leg, opposite leg bent inward crossing in front, toe touching ground, casual fashion stance.
          4. Walking Mid-Step Pose Facing Forward – natural walking motion, one leg stepping ahead, opposite leg trailing, arms relaxed with subtle swing, torso upright.
          5. Three-Quarter Back Pose Looking Over Shoulder – body turned mostly away from viewer, torso angled sideways, head rotated back over shoulder toward camera, one leg bent casually.
          6. Standing Leaning Pose with One Hand in Pocket – body tilted slightly sideways, weight resting on one hip, one hand in pocket, opposite arm relaxed, crossed ankles.
          7. Floor Seated Casual Lean-Back Pose – seated on floor with one knee raised, opposite leg folded sideways, one hand placed behind body for support, other arm resting on knee.
          8. Cross-Legged Ground Sitting Pose – seated on floor in lotus/simple cross-legged position, spine upright, hands resting between knees or on ankles, calm casual posture.
          9. Candid Laugh Pose with Hand Covering Mouth – standing with relaxed bent knee stance, torso slightly forward, one hand near mouth as if laughing shyly, opposite hand resting on hip or side.
          10. Contrapposto Standing Pose with One Hand on Hip – classic fashion stance, weight on one leg, opposite knee relaxed, pelvis shifted, one hand resting on hip, other arm hanging naturally.
          11. Casual Standing Pose with One Arm Across Body – upright stance, one leg slightly forward, one arm resting across stomach while opposite hand touches elbow, thoughtful relaxed posture.
          12. Hands Behind Back Standing Pose – straight posture, feet together or slightly apart, both hands clasped behind lower back, calm polite stance.
          13. Side Standing Pose with Head Tilt – body in side profile, one knee slightly bent, head tilted downward or sideways, soft candid look.
          14. Relaxed Wall-Lean Pose with One Foot Against Wall – back or shoulder leaning against wall, one leg straight, opposite foot pressed flat against wall, casual urban stance.
          15. Walking Away Pose Looking Back – body moving away from viewer, one leg stepping forward, head turned backward toward camera, dynamic candid pose.
          16. Standing Stretch Pose with Hands Overhead – upright body, both arms raised above head, fingers interlocked or separated, torso slightly elongated.
          17. Pocket Pose with One Shoulder Dropped – both feet grounded, one hand in pocket, one shoulder lowered, head slightly angled, effortless casual vibe.
          18. Jogging Motion Pose – mid-run stance, one knee lifted, opposite arm forward, body leaning slightly ahead, energetic movement posture.
          19. Seated Chair Pose with Legs Crossed – sitting on chair edge, one leg crossed over other knee, one elbow resting casually on thigh.
          20. Chair Backward Sit Pose – sitting on chair backward, arms resting on chair backrest, torso leaning slightly forward, relaxed conversation pose.
          21. Squatting Casual Street Pose – low squat position, elbows resting on knees, heels grounded, relaxed urban candid stance.
          22. Kneeling One-Knee Pose – one knee on ground, opposite knee raised, torso upright, hands resting naturally on thigh.
          23. Half-Turn Standing Pose with Chin Touch – body turned three-quarter angle, one hand touching chin, opposite arm relaxed, thinking pose.
          24. Phone Checking Pose – standing with one hip shifted, head tilted downward, both hands holding imaginary phone in front.
          25. Back Pose with Arms Crossed Behind Neck – body facing away, elbows wide outward, hands resting behind head, relaxed confident posture.
          26. One Arm Raised Wave Pose – standing upright, one arm lifted above shoulder in friendly wave, opposite arm by side.
          27. Jumping Mid-Air Pose – body airborne, knees bent slightly upward, arms lifted outward, joyful candid action shot.
          28. Forward Bend Laughing Pose – torso bent slightly forward, hands on thighs or knees, head lowered as if laughing naturally.
          29. Model Runway Pose – one foot placed directly in front of other, hips angled, shoulders back, one arm loose, elegant fashion posture.
          `,
        },
        frameData,
      ]);

      const response = await result.response;
      setPose(Number(response.text()) || 0);
      setResult("");
    } catch (error) {
      console.error(error);
      setResult("Failed to analyze image.");
      setTimeout(() => setResult(""), 3000);
    }
  }

  useEffect(() => {
    if (isInitializing || !selectedCameraId) return;

    let ignore = false;
    const getCamera = async () => {
      try {
        if (cam.current && cam.current.srcObject) {
          cam.current.srcObject.getTracks().forEach((track) => track.stop());
          cam.current.srcObject = null;
        }

        const videoConstraints = { deviceId: { exact: selectedCameraId }, width: { ideal: 1920 }, height: { ideal: 1080 } };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints
        });

        if (!ignore && cam.current) {
          cam.current.srcObject = stream;
        } else {
          stream.getTracks().forEach(t => t.stop());
        }
      }
      catch (e) {
        console.error("Camera error:", e);
        if (!ignore) {
          setResult(`Camera Error: ${e.name} - ${e.message}`);
          setTimeout(() => setResult(""), 3000);
        }
      }
    }
    getCamera();
    return () => { ignore = true; };
  }, [selectedCameraId, isInitializing]);

  return (
    <>
      <video ref={cam} autoPlay playsInline className="camera-feed"></video>

      {/* Top Bar for Settings */}
      <div className="ui-overlay top-bar">
        <div className="left-actions">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="icon-button" style={{ textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 128 128">
              <g fill="#ffffff">
                <path fillRule="evenodd" clipRule="evenodd" d="M64 5.103c-33.347 0-60.388 27.035-60.388 60.388 0 26.682 17.303 49.317 41.297 57.303 3.017.56 4.125-1.31 4.125-2.905 0-1.44-.056-6.197-.082-11.243-16.8 3.653-20.345-7.125-20.345-7.125-2.747-6.98-6.705-8.836-6.705-8.836-5.48-3.748.413-3.67.413-3.67 6.063.425 9.257 6.223 9.257 6.223 5.386 9.23 14.127 6.562 17.573 5.02.542-3.903 2.107-6.568 3.834-8.076-13.413-1.525-27.514-6.704-27.514-29.843 0-6.593 2.36-11.98 6.223-16.21-.628-1.52-2.695-7.662.584-15.98 0 0 5.07-1.623 16.61 6.19C53.7 35 58.867 34.327 64 34.304c5.13.023 10.3.694 15.127 2.033 11.526-7.813 16.59-6.19 16.59-6.19 3.287 8.317 1.22 14.46.593 15.98 3.872 4.23 6.215 9.617 6.215 16.21 0 23.194-14.127 28.3-27.574 29.796 2.167 1.874 4.097 5.55 4.097 11.183 0 8.08-.07 14.583-.07 16.572 0 1.607 1.088 3.49 4.148 2.897 23.98-7.994 41.263-30.622 41.263-57.294C124.388 32.14 97.35 5.104 64 5.104z" /><path d="M26.484 91.806c-.133.3-.605.39-1.035.185-.44-.196-.685-.605-.543-.906.13-.31.603-.395 1.04-.188.44.197.69.61.537.91zm2.446 2.729c-.287.267-.85.143-1.232-.28-.396-.42-.47-.983-.177-1.254.298-.266.844-.14 1.24.28.394.426.472.984.17 1.255zM31.312 98.012c-.37.258-.976.017-1.35-.52-.37-.538-.37-1.183.01-1.44.373-.258.97-.025 1.35.507.368.545.368 1.19-.01 1.452zm3.261 3.361c-.33.365-1.036.267-1.552-.23-.527-.487-.674-1.18-.343-1.544.336-.366 1.045-.264 1.564.23.527.486.686 1.18.333 1.543zm4.5 1.951c-.147.473-.825.688-1.51.486-.683-.207-1.13-.76-.99-1.238.14-.477.823-.7 1.512-.485.683.206 1.13.756.988 1.237zm4.943.361c.017.498-.563.91-1.28.92-.723.017-1.308-.387-1.315-.877 0-.503.568-.91 1.29-.924.717-.013 1.306.387 1.306.88zm4.598-.782c.086.485-.413.984-1.126 1.117-.7.13-1.35-.172-1.44-.653-.086-.498.422-.997 1.122-1.126.714-.123 1.354.17 1.444.663zm0 0" />
              </g>
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/anish-sambhwani/" target="_blank" rel="noopener noreferrer" className="icon-button" style={{ textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 382 382">
              <path fill="#ffffff" d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889 C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056 H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806 c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1 s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73 c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079 c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426 c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472 L341.91,330.654L341.91,330.654z"/>
            </svg>
          </a>
          <button className="icon-button" onClick={() => setShowInfo(true)}>
            <Info size={24} />
          </button>
        </div>
        <button className="icon-button" onClick={() => setShowSettings(true)}>
          <Settings size={24} />
        </button>
      </div>

      {pose != null && <img src={urls[pose]} className="pose-overlay" alt="Suggested Pose" />}

      {result && <div className="result-text">{result}</div>}

      {/* Bottom Control Bar */}
      <div className="ui-overlay bottom-bar">
        <div className="action-group">
          <button className="action-button" onClick={run}>
            <Wand2 size={20} />
            Suggest Pose
          </button>
        </div>

        <div className="shutter-container">
          <button className="shutter-button" onClick={saveFrame}>
            <div className="shutter-button-inner"></div>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Settings</h2>
              <button className="icon-button" onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Camera Selection</label>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
              >
                {cameras.map((camera, index) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Gemini API Key</label>
              <input
                type="password"
                placeholder="Enter custom API key..."
                value={apiKey}
                onChange={handleApiKeyChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>How to use</h2>
              <button className="icon-button" onClick={() => setShowInfo(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="info-text">
              <p>1. Make sure you are visible in the camera.</p>
              <p>2. Tap on the <strong>Suggest Pose</strong> button to let AI suggest the best pose for your photo.</p>
              <p>3. A silhouette of the suggested pose will appear on screen.</p>
              <p>4. Mimic the pose and tap the shutter button to capture your photo.</p>
            </div>

            <div className="info-footer">
              <p>Created with ❤️ by Anish Sambhwani</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App;