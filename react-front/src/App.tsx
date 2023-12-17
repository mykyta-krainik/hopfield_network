import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCanvas } from './hooks/useCanvas.ts';
import {
  addPattern,
  getNeuronsNumber,
  getPatterns,
  recognizePattern,
  setNeuronsNumber,
} from './api';

const App = () => {
  const queryClient = useQueryClient();
  const [letter, setLetter] = useState<string>('');
  const {
    canvasRef,
    handleMouseUp,
    handleMouseDown,
    handleMouseMove,
    handleClearCanvas,
    handleAddNoise,
    handleDrawLetter,
  } = useCanvas();
  const neuronsNumberInputRef = useRef<HTMLInputElement | null>(null);
  const { data: patterns, isLoading } = useQuery<string[]>({
    queryKey: ['patterns'],
    queryFn: getPatterns,
  });
  const { data: neuronsNumber = 400 } = useQuery<number>({
    queryKey: ['neurons_number'],
    queryFn: getNeuronsNumber,
  });

  const addPatternMutation = useMutation({
    mutationFn: addPattern,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['patterns'] });
    },
  });

  const { data: recognizedPattern, mutate: sendPatternToRecognize } =
    useMutation({
      mutationFn: recognizePattern,
    });

  const setNeuronsNumMutation = useMutation({
    mutationFn: setNeuronsNumber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
      queryClient.invalidateQueries({ queryKey: ['neurons_number'] });
    },
  });

  const handleAddPattern = async () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const imageUrl = canvas.toDataURL('image/png');

    addPatternMutation.mutate(imageUrl);

    handleClearCanvas();
  };

  const handleRecognizePattern = async () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const imageUrl = canvas.toDataURL('image/png');

    sendPatternToRecognize(imageUrl);

    handleClearCanvas();
  };

  const handleSetNeuronsNumber = async () => {
    if (!neuronsNumberInputRef.current) return;

    setNeuronsNumMutation.mutate(+neuronsNumberInputRef.current.value);
  };

  return (
    <div className="flex flex-col items-center space-y-4 mt-8 text-gray-700 divide-y-2 divide-gray-400">
      <section className="grid grid-cols-2 gap-5 w-full items-center justify-items-center">
        <canvas
          ref={canvasRef}
          width={Math.sqrt(neuronsNumber)}
          height={Math.sqrt(neuronsNumber)}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="border rounded-md justify-self-end"
        />

        <section className="flex flex-row gap-3 justify-self-start">
          <article className="flex flex-col gap-2">
            <input
              type="text"
              name="letter"
              placeholder="f"
              className="border border-gray-400 rounded-md p-1"
              maxLength={1}
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
            />

            <button
              onClick={() => {
                if (letter) {
                  handleDrawLetter(letter);
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Draw Letter
            </button>

            <button
              onClick={handleAddNoise}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Add Noise
            </button>
          </article>

          <article className="flex flex-col gap-2">
            <input
              type="number"
              name="neurons_number"
              placeholder="400"
              className="border border-gray-400 rounded-md p-1"
              min={10}
              max={1000}
              ref={neuronsNumberInputRef}
            />

            <button
              onClick={handleSetNeuronsNumber}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Set Neurons Number
            </button>
          </article>
        </section>
      </section>

      <section className="p-5 flex flex-col gap-3 items-center w-full">
        <div className="flex flex-row gap-2">
          <button
            onClick={handleAddPattern}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Add Pattern
          </button>

          <button
            onClick={handleRecognizePattern}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Recognize Pattern
          </button>

          <button
            onClick={handleClearCanvas}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Clear Canvas
          </button>
        </div>

        <section className="grid grid-cols-2 gap-2 w-full h-full">
          <div className="flex flex-col gap-3 items-center h-full">
            <h2 className="text-lg font-bold">Patterns</h2>

            {!isLoading && patterns && patterns.length > 0 && (
              <ul className="flex flex-row flex-wrap gap-2">
                {patterns.map((pattern, i) => (
                  <li key={i}>
                    <img src={pattern} alt={pattern} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3 items-center">
            <h2 className="text-lg font-bold">Recognized Pattern</h2>

            {recognizedPattern && (
              <img src={recognizedPattern} alt="Recognized Pattern" />
            )}
          </div>
        </section>
      </section>
    </div>
  );
};

export default App;
