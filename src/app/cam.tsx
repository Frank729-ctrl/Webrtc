'use client';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';

const cameraOptions = [
  { id: 1, name: 'Default' },
  { id: 2, name: 'Device Camera' },
];

export default function Example() {
  const [selectedCamera, setSelectedCamera] = useState(cameraOptions[0]);
  const [availableCameras, setAvailableCameras] = useState(cameraOptions);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Ref to store the active media stream
  const [cameraActive, setCameraActive] = useState(false); // Track if the camera is on

  useEffect(() => {
    const detectCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const externalWebcams = devices.filter(device => device.kind === 'videoinput' && device.deviceId !== 'default');

        if (externalWebcams.length > 0) {
          const newCameraOptions = [
            ...cameraOptions,
            ...externalWebcams.map((webcam, index) => ({
              id: 3 + index,
              name: `External Webcam ${webcam.label || `#${index + 1}`}`,
            }))
          ];
          setAvailableCameras(newCameraOptions);
        } else {
          setAvailableCameras(cameraOptions);
        }
      } catch (error) {
        console.error('Error detecting devices:', error);
      }
    };

    detectCameras();
  }, []);

  const startVideoFeed = async () => {
    const constraints = {
      video: {
        deviceId: selectedCamera.id === 1 ? undefined : { exact: selectedCamera.id.toString() },
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream; // Store the media stream reference
      setCameraActive(true); // Mark the camera as active
    } catch (err) {
      console.error("Error starting video feed:", err);
    }
  };

  const stopVideoFeed = () => {
    if (streamRef.current) {
      // Stop all tracks (e.g., camera) to turn off the camera
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null; // Disconnect the video stream
      }
      streamRef.current = null; // Clear the media stream reference
    }
    setCameraActive(false); // Mark the camera as inactive
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      {/* Camera Selector Listbox */}
      <Listbox value={selectedCamera} onChange={setSelectedCamera}>
        <ListboxButton
          className={clsx(
            'relative block w-full max-w-[900px] rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white',
            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
          )}
        >
          {selectedCamera.name}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5 group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </ListboxButton>

        <ListboxOptions
          anchor="bottom"
          transition
          className={clsx(
            'w-[var(--button-width)] rounded-xl border border-white/5 bg-white/5 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none',
            'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
          )}
        >
          {availableCameras.map((camera) => (
            <ListboxOption
              key={camera.id}
              value={camera}
              className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="invisible size-4 fill-white group-data-[selected]:visible"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <div className="text-sm/6 text-white">{camera.name}</div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>

      {/* Start/Stop Camera Buttons */}
      <div className="flex gap-4">
        <button
          onClick={startVideoFeed}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start Video Feed
        </button>

        <button
          onClick={stopVideoFeed}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Stop Camera
        </button>
      </div>

      {/* Always centered Video feed display */}
      <div className="flex justify-center items-center w-full h-auto">
        <div className="w-full max-w-[800px] h-[520px] mt-12 border-2 border-gray-500 flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            className="max-w-[900px] h-[500px] mt-1 pb-1 object-fill"
            autoPlay
            playsInline
            style={{ visibility: cameraActive ? 'visible' : 'hidden' }} // Hide video element when camera is off
          />
          {!cameraActive && (
            <span className="absolute text-white text-xl">Camera is off</span>
          )}
        </div>
      </div>
    </div>
  );
}
