import { useState, useEffect, useRef } from 'react';

const Camera = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Clean up when the component is unmounted or camera is turned off
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCameraOn(true);
    } catch (err) {
      console.error("Error accessing the camera: ", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Video Feed */}
      {isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-auto max-w-[800px] max-h-[450px] rounded-lg shadow-lg"
        />
      ) : (
        <div className="w-full h-[450px] max-w-[800px] bg-gray-300 rounded-lg flex justify-center items-center">
          <span className="text-gray-600">Camera is off</span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex space-x-4">
        {!isCameraOn ? (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Turn On Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Disable Camera
          </button>
        )}
      </div>
    </div>
  );
};

export default Camera;
