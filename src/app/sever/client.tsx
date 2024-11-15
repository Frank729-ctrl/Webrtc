'use client';
import { useEffect, useRef, useState } from 'react';

const WebRTCCameraStream = () => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000');

    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // STUN server for ICE candidates
      ],
    };

    const pc = new RTCPeerConnection(configuration);
    setPeerConnection(pc);

    // WebSocket message handler for offer, answer, and ICE candidates
    socket.onmessage = async (message) => {
      const data = JSON.parse(message.data);

      if (data.offer) {
        await handleOffer(data.offer);
      } else if (data.answer) {
        await handleAnswer(data.answer);
      } else if (data.iceCandidate) {
        await handleIceCandidate(data.iceCandidate);
      }
    };

    // Handle ICE candidates generated by this peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ iceCandidate: event.candidate }));
      }
    };

    // Handle tracks from the remote peer
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Clean up on unmount
    return () => {
      socket.close();
      pc.close();
    };
  }, []);

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnection) return;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (peerConnection) {
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Send offer via WebSocket
        const socket = new WebSocket('ws://localhost:3000');
        socket.send(JSON.stringify({ offer }));
      }
    } catch (err) {
      console.error('Error accessing the camera: ', err);
    }
  };

  return (
    <div>
      <video ref={localVideoRef} autoPlay playsInline className="w-full h-auto" />
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-auto" />
      <button onClick={startCamera}>Start Camera</button>
    </div>
  );
};

export default WebRTCCameraStream;