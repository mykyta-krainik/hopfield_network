export const getNeuronsNumber = async () => {
  const response = await fetch('http://localhost:5000/neurons', {
    method: 'GET',
  });

  const data = await response.json();

  return data.neurons;
};
