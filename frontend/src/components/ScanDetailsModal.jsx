import React from 'react';
import Modal from 'react-modal';
import CircularProgress from './CircularProgress';
import { X } from 'lucide-react';

Modal.setAppElement('#root');

const ScanDetailsModal = ({ isOpen, onClose, scan }) => {
  if (!scan) return null;

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      maxWidth: '90%',
      width: '500px',
      maxHeight: '90vh',
      backgroundColor: '#1a1f2e',
      border: 'none',
      borderRadius: '16px',
      padding: '24px',
      overflow: 'auto'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)'
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

  const { rating, positive, negative } = parseAnalysis(scan.analysis);

  const formatBulletPoints = (text) => {
    return text.split('\n').map((point, index) => (
      <li key={index} className="mb-1 text-gray-200">
        {point.replace(/^[-•]\s*/, '').trim()}
      </li>
    ));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
    >
      <div className="space-y-6 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Scan Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Preview */}
        <div className="relative w-full h-48 rounded-xl overflow-hidden">
          <img 
            src={scan.imageUrl} 
            alt="Scanned item"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex justify-center">
          <CircularProgress 
            value={rating} 
            maxValue={10}
            size={100}
            strokeWidth={8}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-green-900/30 p-4 rounded-lg">
            <h3 className="font-semibold text-green-400 mb-2">Positive Aspects</h3>
            <ul className="list-disc pl-4 text-green-200">
              {formatBulletPoints(positive)}
            </ul>
          </div>

          <div className="bg-red-900/30 p-4 rounded-lg">
            <h3 className="font-semibold text-red-400 mb-2">Negative Aspects</h3>
            <ul className="list-disc pl-4 text-red-200">
              {formatBulletPoints(negative)}
            </ul>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          Scanned on: {new Date(scan.timestamp).toLocaleString()}
        </div>
      </div>
    </Modal>
  );
};

export default ScanDetailsModal; 