import { MouseEvent, useCallback, useRef, useState } from 'react';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);

  const handleMouseDown = useCallback(() => {
    setDrawing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setDrawing(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      if (!drawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, 4, 4);
    },
    [drawing],
  );

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleDrawLetter = (letter: string) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = `${canvas.width + 4}px Arial`;
    ctx.fillStyle = 'black';

    const textMetrics = ctx.measureText(letter);
    const textWidth = textMetrics.width;
    const textHeight =
      textMetrics.actualBoundingBoxAscent +
      textMetrics.actualBoundingBoxDescent;
    const x = (canvas.width - textWidth) / 2;
    const y =
      (canvas.height - textHeight) / 2 + textMetrics.actualBoundingBoxAscent;

    ctx.fillText(letter, x, y);
  };

  const handleAddNoise = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const random = Math.random() * canvas.width;

      data[i] += random;
      data[i + 1] += random;
      data[i + 2] += random;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  return {
    canvasRef,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleClearCanvas,
    handleDrawLetter,
    handleAddNoise,
  };
};
