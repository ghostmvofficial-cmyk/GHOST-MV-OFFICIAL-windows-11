import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Eraser, Square, Circle, Type, Trash2, Download, Save, Share2, Undo, Redo, Minus, Plus, MousePointer2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Paint: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'rect' | 'circle' | 'text'>('brush');
  const [textInput, setTextInput] = useState<{ x: number, y: number, value: string } | null>(null);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [canvasData, setCanvasData] = useState<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set a fixed canvas size for a "sheet" feel
    canvas.width = 800;
    canvas.height = 600;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    if (textInput) {
      commitText();
    }

    if (tool === 'text') {
      setTextInput({ x, y, value: '' });
      return;
    }

    if (tool === 'rect' || tool === 'circle') {
      setStartPos({ x, y });
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setCanvasData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }
    }

    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setStartPos(null);
    setCanvasData(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if ((tool === 'rect' || tool === 'circle') && startPos && canvasData) {
      ctx.putImageData(canvasData, 0, 0);
      ctx.beginPath();
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = color;
      
      if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const commitText = () => {
    if (!textInput || !textInput.value.trim()) {
      setTextInput(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = `${brushSize * 2}px sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(textInput.value, textInput.x, textInput.y);
    setTextInput(null);
  };

  const drawText = (e: React.FormEvent) => {
    e.preventDefault();
    commitText();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
        {/* Top Bar: File Actions */}
        <div className="flex items-center justify-between px-4 py-1 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">File</button>
            <button className="px-3 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">Edit</button>
            <button className="px-3 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">View</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="Undo">
              <Undo size={14} className="opacity-60" />
            </button>
            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="Redo">
              <Redo size={14} className="opacity-60" />
            </button>
          </div>
        </div>

        {/* Main Toolbar: Tools & Colors */}
        <div className="flex items-center gap-6 px-4 py-3 overflow-x-auto no-scrollbar">
          {/* Tools Group */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setTool('brush')}
                className={cn("p-2.5 rounded-lg transition-all duration-200", tool === 'brush' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400")}
                title="Pencil"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => setTool('eraser')}
                className={cn("p-2.5 rounded-lg transition-all duration-200", tool === 'eraser' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400")}
                title="Eraser"
              >
                <Eraser size={18} />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
              <button 
                onClick={() => setTool('rect')}
                className={cn("p-2.5 rounded-lg transition-all duration-200", tool === 'rect' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400")}
                title="Rectangle"
              >
                <Square size={18} />
              </button>
              <button 
                onClick={() => setTool('circle')}
                className={cn("p-2.5 rounded-lg transition-all duration-200", tool === 'circle' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400")}
                title="Circle"
              >
                <Circle size={18} />
              </button>
              <button 
                onClick={() => setTool('text')}
                className={cn("p-2.5 rounded-lg transition-all duration-200", tool === 'text' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400")}
                title="Text"
              >
                <Type size={18} />
              </button>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-30 text-center">Tools</span>
          </div>

          <div className="h-12 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Color & Size Group */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="relative group">
                <input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white dark:border-slate-700 shadow-sm bg-transparent overflow-hidden"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                </div>
              </div>

              <div className="flex flex-col gap-1 pr-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase opacity-40">Brush Size</span>
                  <span className="text-[9px] font-mono opacity-60">{brushSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus size={12} className="opacity-30" />
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                  <Plus size={12} className="opacity-30" />
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-30 text-center">Appearance</span>
          </div>

          <div className="flex-1" />

          {/* Actions Group */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={clearCanvas}
                className="p-2.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all duration-200"
                title="Clear Canvas"
              >
                <Trash2 size={18} />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
              <button className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-all duration-200" title="Download">
                <Download size={18} />
              </button>
              <button className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-all duration-200" title="Save">
                <Save size={18} />
              </button>
              <button className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-all duration-200" title="Share">
                <Share2 size={18} />
              </button>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-30 text-center">Project</span>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-slate-200 dark:bg-slate-900/50 p-8 overflow-auto flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-sm border border-slate-300 dark:border-slate-800 overflow-hidden relative">
          <canvas 
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="cursor-crosshair touch-none"
          />
          {textInput && (
            <form 
              onSubmit={drawText}
              className="absolute z-20"
              style={{ left: textInput.x, top: textInput.y - (brushSize) }}
            >
              <input 
                autoFocus
                type="text"
                value={textInput.value}
                onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                onBlur={() => !textInput.value && setTextInput(null)}
                className="bg-transparent border-b border-blue-500 outline-none px-1 text-slate-900 dark:text-white"
                style={{ 
                  fontSize: `${brushSize * 2}px`,
                  color: color,
                  minWidth: '100px'
                }}
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
