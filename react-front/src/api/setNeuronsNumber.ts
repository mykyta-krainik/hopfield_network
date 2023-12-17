export const setNeuronsNumber = async (neuronsNumber: number) => {
  const response = await fetch('http://localhost:5000/neurons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ neurons: neuronsNumber }),
  });

  const data = await response.json();

  return data.neurons_number;
};
