import React, { useState, useRef, useEffect, useId } from 'react';
import { ArrowLeft, Utensils, Calendar, SlidersHorizontal, Pill, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { motion, AnimatePresence } from 'framer-motion';
import useClickOutside from '../hooks/useClickOutside';
import "react-datepicker/dist/react-datepicker.css";
import { fetchRecentScans } from '../utils/api';
import ScanDetailsModal from '../components/ScanDetailsModal';

const getRatingColor = (rating) => {
  const hue = (rating / 10) * 120; // 0 is red, 120 is green
  return `hsl(${hue}, 70%, 50%)`;
};

const RatingCircle = ({ rating }) => {
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - ((rating / 10) * circumference);
  const strokeColor = getRatingColor(rating);

  return (
    <div className="relative w-12 h-12 drop-shadow-lg">
      <svg
        className="transform -rotate-90 w-12 h-12"
        viewBox="0 0 44 44"
      >
        {/* Background circle */}
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transition: 'stroke-dashoffset 0.5s ease'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-semibold text-gray-700">{rating}</span>
      </div>
    </div>
  );
};

const FilterModal = ({ isOpen, onClose, currentFilter, onFilterChange }) => {
  const filterRef = useRef(null);
  useClickOutside(filterRef, onClose);

  const categories = ['All', 'Food', 'Medicine', 'Cosmetics'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          />
          <div className="fixed inset-0 grid place-items-start justify-end z-30">
            <motion.div
              ref={filterRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="h-full w-64 bg-white shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Filter</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        onFilterChange(category);
                        onClose();
                      }}
                      className={`w-full px-4 py-2 text-left rounded-lg transition-colors
                        ${currentFilter === category 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const groupScansByDate = (scans) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return scans.reduce((groups, scan) => {
    const scanDate = new Date(scan.timestamp);
    scanDate.setHours(0, 0, 0, 0);

    if (scanDate.getTime() === today.getTime()) {
      if (!groups.today) groups.today = [];
      groups.today.push(scan);
    } else if (scanDate.getTime() === yesterday.getTime()) {
      if (!groups.yesterday) groups.yesterday = [];
      groups.yesterday.push(scan);
    } else if (scanDate > oneWeekAgo) {
      if (!groups.thisWeek) groups.thisWeek = [];
      groups.thisWeek.push(scan);
    } else if (scanDate > oneMonthAgo) {
      if (!groups.thisMonth) groups.thisMonth = [];
      groups.thisMonth.push(scan);
    }

    return groups;
  }, {});
};

const ScanGroup = ({ title, scans, setSelectedScan }) => {
  if (!scans || scans.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider pl-1">
        {title}
      </h2>
      <div className="space-y-4">
        {scans.map((scan, index) => (
          <motion.div
            layoutId={`scan-card-${scan._id}`}
            key={scan._id}
            initial={{ opacity: 0, y: 500, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              type: "spring",
              bounce: 0,  // Remove bounce effect
              duration: 0.4,
              velocity: 100  // Add initial velocity
            }}
            onClick={() => setSelectedScan(scan)}
            className="flex items-center justify-between bg-white p-4 rounded-xl 
              cursor-pointer
              transition-all duration-300 ease-in-out
              transform
              border border-gray-200
              hover:bg-gray-50
              hover:translate-y-[-4px]
              hover:shadow-lg
              relative
              before:absolute before:inset-0 before:rounded-xl
              before:shadow-[0_0_15px_rgba(0,0,0,0.07)]
              before:transition-all before:duration-300
              hover:before:shadow-[0_0_20px_rgba(0,0,0,0.1)]
              [transform-style:preserve-3d]
              [perspective:1000px]
              hover:[transform:rotateX(2deg)]"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src={scan.imageUrl}
                  alt={scan.category}
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
              <motion.div layoutId={`title-${scan._id}`}>
                <h3 className="font-medium text-gray-900">{scan.category}</h3>
              </motion.div>
            </div>
            <motion.div layoutId={`rating-${scan._id}`}>
              <RatingCircle rating={parseFloat(scan.analysis?.match(/Rating:\s*(\d+(\.\d+)?)/)?.[1] || '0')} />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const AnalysisCard = ({ title, points, isPositive, isDisclaimer = false }) => {
  if (!points || points.length === 0) return null;
  
  return (
    <div className="bg-white rounded-xl p-6
      shadow-[0_8px_16px_rgba(0,0,0,0.08)]
      border border-gray-100
      transform transition-all duration-300
      hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)]
      hover:translate-y-[-2px]"
    >
      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2
        ${isDisclaimer ? 'text-orange-600' : isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {title}
      </h3>
      <ul className="space-y-2">
        {points.map((point, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0
              ${isDisclaimer ? 'bg-orange-500' : isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-700">
              {point.replace(/^\*\s*/, '')} {/* Remove asterisk from the start */}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const parseAnalysis = (analysisText) => {
  const sections = analysisText.split('\n\n');
  const positivePoints = [];
  const negativePoints = [];
  const disclaimerPoints = [];
  let rating = 0;

  sections.forEach(section => {
    if (section.toLowerCase().includes('positive:')) {
      const points = section.replace(/positive:/i, '')
        .split('\n')
        .map(point => point.trim())
        .filter(point => point.length > 0)
        .map(point => point.replace(/^\*\s*/, '')); // Remove asterisk
      positivePoints.push(...points);
    } else if (section.toLowerCase().includes('negative:')) {
      const points = section.replace(/negative:/i, '')
        .split('\n')
        .map(point => point.trim())
        .filter(point => point.length > 0)
        .map(point => point.replace(/^\*\s*/, '')); // Remove asterisk
      negativePoints.push(...points);
    } else if (section.toLowerCase().includes('disclaimer:')) {
      const points = section.replace(/disclaimer:/i, '')
        .split('\n')
        .map(point => point.trim())
        .filter(point => point.length > 0)
        .map(point => point.replace(/^\*\s*/, '')); // Remove asterisk
      disclaimerPoints.push(...points);
    } else if (section.includes('Rating:')) {
      rating = parseFloat(section.match(/Rating:\s*(\d+(\.\d+)?)/)?.[1] || '0');
    }
  });

  return { positivePoints, negativePoints, disclaimerPoints, rating };
};

const RecentScansPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('dateDesc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('All');

  const calendarRef = useRef(null);
  const filterRef = useRef(null);
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    const loadScans = async () => {
      try {
        const data = await fetchRecentScans();
        setScans(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadScans();
  }, []);

  // Handle click outside for calendar
  useClickOutside(calendarRef, () => {
    if (isCalendarOpen) setIsCalendarOpen(false);
  });

  // Handle click outside for filter
  useClickOutside(filterRef, () => {
    if (isFilterOpen) setIsFilterOpen(false);
  });

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  const sortedAndFilteredScans = () => {
    let filtered = currentFilter === 'All' 
      ? scans 
      : scans.filter(scan => scan.category === currentFilter);

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dateAsc':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'dateDesc':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'ratingAsc':
          return a.analysis.match(/Rating:\s*(\d+(\.\d+)?)/)?.[1] - b.analysis.match(/Rating:\s*(\d+(\.\d+)?)/)?.[1];
        case 'ratingDesc':
          return b.analysis.match(/Rating:\s*(\d+(\.\d+)?)/)?.[1] - a.analysis.match(/Rating:\s*(\d+(\.\d+)?)/)?.[1];
        default:
          return 0;
      }
    });
  };

  useEffect(() => {
    if (selectedScan) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSelectedScan(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedScan]);

  const filteredScans = () => {
    return sortedAndFilteredScans().filter(scan => {
      const rating = parseFloat(scan.analysis.match(/Rating:\s*(\d+(\.\d+)?)/)?.[1] || '0');
      return rating > 0;
    });
  };

  const groupedScans = groupScansByDate(filteredScans());

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header - changed from transparent to white */}
      <header className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="ml-4 text-xl font-touche text-gray-900">Recent Scans</h1>
          </div>
          
          <button 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal size={20} className="text-gray-700" />
          </button>
        </div>
      </header>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />

      <AnimatePresence mode="wait">
        {selectedScan && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
            />
            <div className="fixed inset-0 grid place-items-center z-[100] p-4">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-8 right-8 p-2.5 rounded-full bg-white/90 backdrop-blur-sm 
                  shadow-lg hover:bg-white transition-colors"
                onClick={() => setSelectedScan(null)}
              >
                <X size={20} className="text-gray-700" />
              </motion.button>
              
              <motion.div
                layoutId={`scan-card-${selectedScan._id}`}
                ref={ref}
                className="w-full max-w-[600px] h-[85vh] bg-gradient-to-b from-gray-50 to-white 
                  rounded-3xl overflow-hidden shadow-xl flex flex-col mt-16"
              >
                <div className="flex-none p-6 bg-gradient-to-b from-gray-50 to-gray-50/95">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex-shrink-0">
                        <img
                          src={selectedScan.imageUrl}
                          alt={selectedScan.category}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      </div>
                      <div>
                        <motion.h2 layoutId={`title-${selectedScan._id}`} className="text-xl font-semibold">
                          {selectedScan.category}
                        </motion.h2>
                        <p className="text-gray-500">
                          {new Date(selectedScan.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <motion.div layoutId={`rating-${selectedScan._id}`} className="scale-150">
                      <RatingCircle rating={parseAnalysis(selectedScan.analysis).rating} />
                    </motion.div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                  >
                    {/* Analysis Cards */}
                    <AnalysisCard 
                      title="Positive Points"
                      points={parseAnalysis(selectedScan.analysis).positivePoints}
                      isPositive={true}
                    />
                    
                    <AnalysisCard 
                      title="Negative Points"
                      points={parseAnalysis(selectedScan.analysis).negativePoints}
                      isPositive={false}
                    />

                    {/* Disclaimer Card */}
                    <AnalysisCard 
                      title="Disclaimer"
                      points={parseAnalysis(selectedScan.analysis).disclaimerPoints}
                      isDisclaimer={true}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <main className="px-4 pt-2">
        <div className="space-y-8">
          <ScanGroup 
            title="Today" 
            scans={groupedScans.today} 
            setSelectedScan={setSelectedScan} 
          />
          <ScanGroup 
            title="Yesterday" 
            scans={groupedScans.yesterday} 
            setSelectedScan={setSelectedScan} 
          />
          <ScanGroup 
            title="This Week" 
            scans={groupedScans.thisWeek} 
            setSelectedScan={setSelectedScan} 
          />
          <ScanGroup 
            title="This Month" 
            scans={groupedScans.thisMonth} 
            setSelectedScan={setSelectedScan} 
          />

          {/* Update empty state */}
          {Object.values(groupedScans).every(group => !group || group.length === 0) && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No scans found</p>
            </div>
          )}
        </div>
      </main>

      {/* Calendar Modal */}
      <AnimatePresence>
        {isCalendarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalendarOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            
            {/* Calendar Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="bg-[#1a1f2e] p-6 rounded-2xl shadow-xl max-w-[320px] w-full">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  inline
                  fixedHeight
                  calendarClassName="dark-calendar"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ScanDetailsModal
        isOpen={isScanModalOpen}
        onClose={() => {
          setIsScanModalOpen(false);
          setSelectedScan(null);
        }}
        scan={selectedScan}
      />
    </div>
  );
};

export default RecentScansPage;
