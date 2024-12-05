import React, { useRef, useEffect, useState, useCallback } from 'react';
import TopButtons from './TopButtons';
import AnalysisModal from './AnalysisModal';
import LoadingOverlay from './LoadingOverlay';
import { analyzeImage } from '../utils/api';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/outline';

const CameraView = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError('Failed to access camera. Please ensure camera permissions are granted.');
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current) return;
    setError(null);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    const imageBase64 = canvas.toDataURL('image/jpeg');
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(imageBase64, selectedCategory);
      setAnalysisResult(result);
      setShowModal(true);
    } catch (error) {
      setError(error.message);
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setError(null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageBase64 = e.target?.result;
      if (typeof imageBase64 !== 'string') return;
      
      setIsAnalyzing(true);
      try {
        const result = await analyzeImage(imageBase64, selectedCategory);
        setAnalysisResult(result);
        setShowModal(true);
      } catch (error) {
        setError(error.message);
        console.error('Analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute top-0 left-0 w-full h-[calc(100%-46px)] object-cover rounded-b-[38px]"
        />
        
        <div className="absolute inset-0 flex flex-col h-full">
          <TopButtons />
          
          {error && (
            <div className="mx-4 mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex-1" />
          
          <div className="flex justify-between items-center px-8 py-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 
              transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-lg 
              active:scale-95 flex items-center justify-center"
            >
              <PhotoIcon className="w-6 h-6 text-white" />
            </button>
            
            <button 
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-white border-4 border-blue-400"
            />
            
            <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 
              transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-lg 
              active:scale-95 flex items-center justify-center"
            >
              <BoltIcon className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="bg-black py-2">
            <div className="flex justify-center space-x-3">
              {['Cosmetics', 'Food', 'Medicine'].map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-5 py-1 rounded-full text-sm ${
                    selectedCategory === category
                      ? 'bg-white text-black'
                      : 'bg-transparent text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isAnalyzing && <LoadingOverlay />}
        
        <AnalysisModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          analysis={analysisResult}
        />
      </div>
    </div>
  );
};

export default CameraView;