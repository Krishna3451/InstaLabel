import React from 'react';
import Modal from 'react-modal';
import CircularProgress from './CircularProgress';

Modal.setAppElement('#root');

const AnalysisModal = ({ isOpen, onClose, analysis }) => {
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '90%',
      width: '500px',
      maxHeight: '90vh',
      borderRadius: '16px',
      padding: '24px',
      overflow: 'auto',
      border: 'none',
      background: 'white'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000
    }
  };

  const parseAnalysis = (text) => {
    if (!text) return { rating: 0, positive: '', negative: '' };

    try {
      const rating = text.match(/Rating:\s*(\d+(\.\d+)?)\s*\/\s*10/) || [0, '0'];
      const positiveMatch = text.match(/Positive[^:]*:(.*?)(?=Negative|$)/is);
      const negativeMatch = text.match(/Negative[^:]*:(.*?)(?=$)/is);

      return {
        rating: parseFloat(rating[1]),
        positive: positiveMatch ? positiveMatch[1].trim() : '',
        negative: negativeMatch ? negativeMatch[1].trim() : ''
      };
    } catch (error) {
      console.error('Error parsing analysis:', error);
      return { rating: 0, positive: '', negative: '' };
    }
  };

  const { rating, positive, negative } = parseAnalysis(analysis || '');

  const formatBulletPoints = (text) => {
    return text.split('\n').map((point, index) => (
      <li key={index} className="mb-1">
        {point.replace(/^[-•*]\s*/, '').trim()}
      </li>
    ));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      closeTimeoutMS={300}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center animate-fade-in">
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex justify-center animate-fade-in-delay-1">
          <CircularProgress 
            value={rating} 
            maxValue={10}
            size={100}
            strokeWidth={8}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg animate-fade-in-delay-2">
            <h3 className="font-semibold text-green-700 mb-2">Positive Aspects</h3>
            <ul className="list-disc pl-4 text-green-600">
              {formatBulletPoints(positive)}
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg animate-fade-in-delay-3">
            <h3 className="font-semibold text-red-700 mb-2">Negative Aspects</h3>
            <ul className="list-disc pl-4 text-red-600">
              {formatBulletPoints(negative)}
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const modalStyles = `
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  opacity: 0;
  transition: opacity 300ms ease-in-out;
}

.modal-overlay.ReactModal__Overlay--after-open {
  opacity: 1;
}

.modal-overlay.ReactModal__Overlay--before-close {
  opacity: 0;
}

.modal-content {
  position: fixed;
  bottom: -100%;
  left: 0;
  right: 0;
  max-width: 500px;
  margin: auto;
  transition: bottom 300ms cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px 16px 0 0;
}

.modal-content.ReactModal__Content--after-open {
  bottom: 0;
}

.modal-content.ReactModal__Content--before-close {
  bottom: -100%;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeInUp 0.5s ease-out forwards;
}

.animate-fade-in-delay-1 {
  opacity: 0;
  animation: fadeInUp 0.5s ease-out 0.1s forwards;
}

.animate-fade-in-delay-2 {
  opacity: 0;
  animation: fadeInUp 0.5s ease-out 0.2s forwards;
}

.animate-fade-in-delay-3 {
  opacity: 0;
  animation: fadeInUp 0.5s ease-out 0.3s forwards;
}
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

export default AnalysisModal;