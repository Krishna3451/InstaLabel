import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 bg-black/50 pointer-events-none">
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-slide-up"
        style={{
          transformOrigin: 'center bottom'
        }}
      >
        <div className="bg-white rounded-lg p-6 text-center">
          <img 
            src="/src/assets/loading.gif" 
            alt="Loading animation" 
            className="h-12 w-29 mx-auto mb-4"
          />
          <p className="text-gray-700">AI analyzing image...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;