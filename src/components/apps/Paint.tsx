import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Eraser, Square, Circle, Type, Trash2, Download, Save, Share2, Undo, Redo, Minus, Plus, MousePointer2, Palette, Maximize2, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from 'motion/react';

type Shape = 
  | { type: 'path', points: {x: number, y: number}[], color: string, brushSize: number }
  | { type: 'rect', x: number, y: number, width: number, height: number, color: string, brushSize: number }
  | { type: 'circle', x: number, y: number, radius: number, color: string, brushSize: number }
  | { type: 'text', x: number, y: number, text: string, color: string, fontSize: number, fontStyle: string };

export const Paint: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'rect' | 'circle' | 'text' | 'select'>('brush');
  const [textInput, setTextInput] = useState<{ x: number, y: number, value: string } | null>(null);
  const [fontStyle, setFontStyle] = useState('sans-serif');
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [zoom, setZoom] = useState(1);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [fileName, setFileName] = useState('My Drawing');
  const [selectedShapeIndex, setSelectedShapeIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null);

  const PRESET_COLORS = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#a52a2a', '#808080', '#c0c0c0', '#ffd700', '#4b0082'
  ];

  const renderShapes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
      ctx.lineWidth = shape.brushSize || 1;
      ctx.strokeStyle = shape.color;
      ctx.fillStyle = shape.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (shape.type === 'path') {
        if (shape.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        shape.points.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } else if (shape.type === 'rect') {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape.type === 'text') {
        ctx.font = `${shape.fontSize * 2}px ${shape.fontStyle}`;
        ctx.fillText(shape.text, shape.x, shape.y);
      }
    });

    if (selectedShapeIndex !== null) {
      const shape = shapes[selectedShapeIndex];
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      if (shape.type === 'rect') {
        ctx.strokeRect(shape.x - 5, shape.y - 5, shape.width + 10, shape.height + 10);
      } else if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius + 5, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }, [shapes, selectedShapeIndex]);

  useEffect(() => {
    renderShapes();
  }, [renderShapes, canvasWidth, canvasHeight]);

  const saveToHistory = (newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newShapes);
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setShapes(history[prevIndex]);
      setHistoryIndex(prevIndex);
      setSelectedShapeIndex(null);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setShapes(history[nextIndex]);
      setHistoryIndex(nextIndex);
      setSelectedShapeIndex(null);
    }
  };

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = ('touches' in e) ? e.touches[0].clientX : e.clientX;
    const clientY = ('touches' in e) ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getMousePos(e);

    if (textInput) {
      commitText();
    }

    if (tool === 'select') {
      const index = shapes.findLastIndex(s => {
        if (s.type === 'rect') {
          return x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height;
        } else if (s.type === 'circle') {
          const dist = Math.sqrt(Math.pow(x - s.x, 2) + Math.pow(y - s.y, 2));
          return dist <= s.radius;
        }
        return false;
      });
      
      if (index !== -1) {
        setSelectedShapeIndex(index);
        setIsDragging(true);
        setDragOffset({ x: x - shapes[index].x, y: y - shapes[index].y });
      } else {
        setSelectedShapeIndex(null);
      }
      return;
    }

    if (tool === 'text') {
      setTextInput({ x, y, value: '' });
      return;
    }

    setStartPos({ x, y });
    setIsDrawing(true);

    if (tool === 'brush' || tool === 'eraser') {
      const newShape: Shape = {
        type: 'path',
        points: [{ x, y }],
        color: tool === 'eraser' ? '#ffffff' : color,
        brushSize
      };
      setShapes([...shapes, newShape]);
    } else if (tool === 'rect' || tool === 'circle') {
      const newShape: Shape = tool === 'rect' 
        ? { type: 'rect', x, y, width: 0, height: 0, color, brushSize }
        : { type: 'circle', x, y, radius: 0, color, brushSize };
      setShapes([...shapes, newShape]);
    }
  };

  const stopDrawing = () => {
    if (isDrawing || isDragging) {
      saveToHistory(shapes);
    }
    setIsDrawing(false);
    setIsDragging(false);
    setStartPos(null);
    setDragOffset(null);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getMousePos(e);

    if (isDragging && selectedShapeIndex !== null && dragOffset) {
      const newShapes = [...shapes];
      const shape = { ...newShapes[selectedShapeIndex] };
      if (shape.type !== 'path') {
        shape.x = x - dragOffset.x;
        shape.y = y - dragOffset.y;
        newShapes[selectedShapeIndex] = shape;
        setShapes(newShapes);
      }
      return;
    }

    if (!isDrawing || !startPos) return;

    const newShapes = [...shapes];
    const currentShapeIndex = shapes.length - 1;

    if (tool === 'brush' || tool === 'eraser') {
      const currentShape = newShapes[currentShapeIndex] as any;
      if (currentShape.type === 'path') {
        currentShape.points.push({ x, y });
        setShapes(newShapes);
      }
    } else if (tool === 'rect') {
      const currentShape = newShapes[currentShapeIndex];
      if (currentShape.type === 'rect') {
        currentShape.x = Math.min(x, startPos.x);
        currentShape.y = Math.min(y, startPos.y);
        currentShape.width = Math.abs(x - startPos.x);
        currentShape.height = Math.abs(y - startPos.y);
        setShapes(newShapes);
      }
    } else if (tool === 'circle') {
      const currentShape = newShapes[currentShapeIndex];
      if (currentShape.type === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        currentShape.radius = radius;
        setShapes(newShapes);
      }
    }
  };

  const commitText = () => {
    if (!textInput || !textInput.value.trim()) {
      setTextInput(null);
      return;
    }

    const newText: Shape = {
      type: 'text',
      x: textInput.x,
      y: textInput.y,
      text: textInput.value,
      color,
      fontSize: brushSize,
      fontStyle
    };
    const newShapes = [...shapes, newText];
    setShapes(newShapes);
    saveToHistory(newShapes);
    setTextInput(null);
  };

  const drawText = (e: React.FormEvent) => {
    e.preventDefault();
    commitText();
  };

  const clearCanvas = () => {
    setShapes([]);
    saveToHistory([]);
    setSelectedShapeIndex(null);
  };

  const handleSaveAs = () => {
    const name = prompt('Enter file name:', fileName);
    if (name) setFileName(name);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleResize = () => {
    const w = prompt('Enter width:', canvasWidth.toString());
    const h = prompt('Enter height:', canvasHeight.toString());
    if (w && h) {
      setCanvasWidth(parseInt(w));
      setCanvasHeight(parseInt(h));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
        {/* Top Bar: File Actions */}
        <div className="flex items-center justify-between px-4 py-1 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-blue-500 mr-2">{fileName}</span>
            <button onClick={handleSaveAs} className="px-3 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">Save As</button>
            <button onClick={handleResize} className="px-3 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">Resize Canvas</button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-30" 
              title="Undo"
            >
              <Undo size={14} className="opacity-60" />
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-30" 
              title="Redo"
            >
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
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
              <button 
                onClick={() => setTool('select')}
                className={cn("p-2.5 rounded-lg transition-all duration-200", tool === 'select' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400")}
                title="Select & Move"
              >
                <Move size={18} />
              </button>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-30 text-center">Tools</span>
          </div>

          <div className="h-12 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Color & Size Group */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="relative">
                <button 
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden flex items-center justify-center transition-transform active:scale-95"
                  style={{ backgroundColor: color }}
                >
                  <Palette size={18} className={cn(
                    "drop-shadow-sm",
                    color.toLowerCase() === '#ffffff' ? "text-slate-400" : "text-white/80"
                  )} />
                </button>

                <AnimatePresence>
                  {showColorPicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-20" 
                        onClick={() => setShowColorPicker(false)} 
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-30 w-64"
                      >
                        <div className="flex flex-col gap-4">
                          <HexColorPicker color={color} onChange={setColor} className="!w-full !h-32" />
                          
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase opacity-40">Hex Code</span>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700" style={{ backgroundColor: color }} />
                              <input 
                                type="text" 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase opacity-40">Presets</span>
                            <div className="grid grid-cols-5 gap-2">
                              {PRESET_COLORS.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => setColor(c)}
                                  className={cn(
                                    "w-full aspect-square rounded-md border border-slate-200 dark:border-slate-700 transition-transform active:scale-90",
                                    color === c ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900" : ""
                                  )}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
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

              {tool === 'text' && (
                <div className="flex flex-col gap-1 border-l border-slate-200 dark:border-slate-700 pl-4">
                  <span className="text-[9px] font-bold uppercase opacity-40">Font Style</span>
                  <select 
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-[10px] outline-none"
                  >
                    <option value="sans-serif">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                    <option value="cursive">Cursive</option>
                  </select>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-30 text-center">Appearance</span>
          </div>

          <div className="h-12 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Zoom Group */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                <ZoomOut size={16} className="opacity-60" />
              </button>
              <span className="text-[10px] font-mono font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button 
                onClick={() => setZoom(prev => Math.min(5, prev + 0.1))}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                <ZoomIn size={16} className="opacity-60" />
              </button>
              <button 
                onClick={() => setZoom(1)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[9px] font-bold opacity-40 hover:opacity-100"
              >
                Reset
              </button>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-30 text-center">Zoom</span>
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
              <button onClick={handleDownload} className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-all duration-200" title="Download">
                <Download size={18} />
              </button>
              <button onClick={handleDownload} className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-all duration-200" title="Save">
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
        <div 
          className="bg-white dark:bg-slate-900 shadow-2xl rounded-sm border border-slate-300 dark:border-slate-800 overflow-hidden relative origin-center transition-transform duration-200"
          style={{ 
            width: canvasWidth, 
            height: canvasHeight,
            transform: `scale(${zoom})`
          }}
        >
          <canvas 
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
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
                  fontFamily: fontStyle,
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
