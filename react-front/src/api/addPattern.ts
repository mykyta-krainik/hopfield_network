export const addPattern = async (pattern: string) => {
  const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/add_pattern`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pattern }),
  });
  const data = await response.json();

  return data.pattern;
};