import axios from 'axios';

export const getGoogleReviews = async (stage, lat, lng, name) => {
  try {
    const url = `https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/google/getGoogleReviews?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching Google Reviews:', error);
    return null;
  }
};

