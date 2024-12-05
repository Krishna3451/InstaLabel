const API_BASE_URL = 'https://instalabelv0.onrender.com/api';

export const analyzeImage = async (imageBase64, category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        category,
      }),
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to analyze image');
  }
};

export const fetchRecentScans = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/scans`);
    if (!response.ok) {
      throw new Error('Failed to fetch scans');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch recent scans');
  }
}; 
