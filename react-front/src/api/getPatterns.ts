export const getPatterns = async () => {
  const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/patterns`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();

  return data.patterns;
};