import React, { useRef, useState, useEffect } from "react";

// KidsDrawingApp.jsx
// Single-file React component. Uses Tailwind CSS for styling.
// Features: touch + mouse drawing, color palette, brush size, eraser,
// undo, clear, save PNG, simple stickers (emoji), background patterns.

export default function KidsDrawingApp() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#ff3b30");
  const [size, setSize] = useState(12);
  const [isEraser, setIsEraser] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [maxUndo] = useState(20);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const stickers = ["🌟", "🐶", "🚀", "🌈", "🍎", "🎈", "⚽️", "😊"];

  // initialize canvas size
  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    const canvas = canvasRef.current;
    // set initial white background
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushUndo();
    return () => window.removeEventListener("resize", resizeCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resizeCanvas() {
    const canvas = canvasRef.current;
    if (!canvas || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    // preserve current content
    const old = canvas.toDataURL();
    canvas.width = Math.max(600, Math.floor(rect.width));
    canvas.height = Math.max(400, Math.floor(rect.height));
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      // fill white background then draw old content
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = old;
  }

  function getPointerPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const isTouch = e.touches && e.touches[0];
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.round((clientX - rect.left) * (canvas.width / rect.width)),
      y: Math.round((clientY - rect.top) * (canvas.height / rect.height)),
    };
  }

  function startDraw(e) {
    if (selectedSticker) {
      placeSticker(e);
      return;
    }
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPointerPos(e);
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    ctx.strokeStyle = isEraser ? "#fff" : color;
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
  }

  function draw(e) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPointerPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  }

  function endDraw() {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.closePath();
    pushUndo();
  }

  function pushUndo() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    setUndoStack((s) => {
      const next = [...s, url];
      if (next.length > maxUndo) next.shift();
      return next;
    });
  }

  function undo() {
    setUndoStack((s) => {
      if (s.length <= 1) return s; // keep at least one state
      const next = s.slice(0, -1);
      const last = next[next.length - 1];
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = last;
      return next;
    });
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushUndo();
  }

  function saveImage() {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `kids-drawing-${new Date().toISOString()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function placeSticker(e) {
    if (!selectedSticker) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPointerPos(e);
    // draw sticker as text in a big font
    const fontSize = 64;
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(selectedSticker, pos.x, pos.y);
    pushUndo();
    // auto-deselect sticker after placing
    setSelectedSticker(null);
  }

  function setToolColor(c) {
    setColor(c);
    setIsEraser(false);
  }

  return (
    <div className="w-full h-full min-h-[520px] p-4 bg-gradient-to-br from-blue-50 to-pink-50 rounded-2xl shadow-2xl">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold">Fun Drawing — Kids Edition</h1>
          <div className="flex gap-2">
            <button
              onClick={undo}
              className="px-3 py-2 rounded-xl bg-white shadow hover:scale-105 transition"
              aria-label="Undo"
            >
              ↶ Undo
            </button>
            <button
              onClick={clearCanvas}
              className="px-3 py-2 rounded-xl bg-white shadow hover:scale-105 transition"
              aria-label="Clear canvas"
            >
              🗑 Clear
            </button>
            <button
              onClick={saveImage}
              className="px-3 py-2 rounded-xl bg-white shadow hover:scale-105 transition"
              aria-label="Save image"
            >
              💾 Save
            </button>
          </div>
        </header>

        <div className="flex gap-4">
          <aside className="w-64 p-3 bg-white rounded-2xl shadow-md flex flex-col gap-3">
            <div>
              <div className="text-sm font-semibold mb-2">Colors</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "#ff3b30",
                  "#ff9500",
                  "#ffd60a",
                  "#32d74b",
                  "#0a84ff",
                  "#5e5ce6",
                  "#ff2d55",
                  "#000000",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => setToolColor(c)}
                    className={`w-9 h-9 rounded-full border-2 ${c === color ? "ring-4 ring-offset-2" : ""}`}
                    style={{ background: c }}
                    aria-label={`Set color ${c}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Brush Size</div>
              <input
                type="range"
                min="2"
                max="80"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value, 10))}
                className="w-full"
                aria-label="Brush size"
              />
              <div className="text-xs mt-1">Size: {size}px</div>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setIsEraser(false)}
                className={`flex-1 py-2 rounded-xl ${!isEraser ? "bg-yellow-100" : "bg-white"}`}
              >
                ✏️ Draw
              </button>
              <button
                onClick={() => setIsEraser(true)}
                className={`flex-1 py-2 rounded-xl ${isEraser ? "bg-yellow-100" : "bg-white"}`}
              >
                🧽 Eraser
              </button>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Stickers</div>
              <div className="flex flex-wrap gap-2">
                {stickers.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSticker(s)}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center text-center ${selectedSticker === s ? "ring-4" : "bg-white"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="text-xs mt-1 text-gray-500">Tap sticker, then tap canvas to place it.</div>
            </div>

            <div className="mt-auto text-xs text-gray-600">Tip: Use big brush sizes for colorful splashes!</div>
          </aside>

          <main className="flex-1 bg-white rounded-2xl p-3 shadow-inner">
            <div ref={wrapperRef} className="relative w-full h-[520px] rounded-lg overflow-hidden border-4 border-dashed border-gray-200">
              <canvas
                ref={canvasRef}
                className="w-full h-full touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              <div className="absolute right-3 top-3 bg-white bg-opacity-80 rounded-xl p-2">
                <div className="text-xs">Tool preview</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="rounded-full" style={{ width: size / 2, height: size / 2, background: isEraser ? '#fff' : color, border: '1px solid #ccc' }} />
                  <div className="text-xs text-gray-600">{isEraser ? 'Eraser' : 'Brush'}</div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2 items-center justify-between">
              <div className="text-sm text-gray-600">Made for little artists — friendly controls and big buttons.</div>
              <div className="text-xs text-gray-500">Undo steps: {undoStack.length - 1}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

