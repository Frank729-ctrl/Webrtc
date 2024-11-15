import Image from 'next/image';
import logo from './logo.png';
import Select from './cam';
import WebRTCCameraStream from './sever/client';  // Import the WebRTC component

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Header with logo */}
      <nav className="flex w-full justify-start p-4 bg-gray-900">
        <div className="hero flex items-center">
          <Image src={logo} alt="Logo" className="w-12 h-12" />
          <span className="ml-3 text-white font-bold tracking-wider text-xl">FDPlay</span>
        </div>
      </nav>

      {/* Camera Selection Component */}
      <div className="container mt-6">
        <Select />
      </div>

      {/* WebRTC Camera Stream Component */}
      <div className="container mt-6 w-full">
        <WebRTCCameraStream />
      </div>
    </div>
  );
}
