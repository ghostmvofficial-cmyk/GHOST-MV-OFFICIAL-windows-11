import React, { useState } from 'react';
import { Calculator as CalcIcon, History, Trash2, Delete, Minus, Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const clearLastDigit = () => {
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      const newValue = calculate(currentValue, inputValue, operator);
      setPrevValue(newValue);
      setDisplay(String(newValue));
      setHistory(prev => [`${currentValue} ${operator} ${inputValue} = ${newValue}`, ...prev]);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (prev: number, current: number, op: string) => {
    switch (op) {
      case '+': return prev + current;
      case '-': return prev - current;
      case '*': return prev * current;
      case '/': return prev / current;
      default: return current;
    }
  };

  const handleEqual = () => {
    const inputValue = parseFloat(display);
    if (operator && prevValue !== null) {
      const newValue = calculate(prevValue, inputValue, operator);
      setDisplay(String(newValue));
      setHistory(prev => [`${prevValue} ${operator} ${inputValue} = ${newValue}`, ...prev]);
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const Button = ({ label, onClick, className, variant = 'default' }: { label: string | React.ReactNode, onClick: () => void, className?: string, variant?: 'default' | 'operator' | 'action' }) => (
    <button
      onClick={onClick}
      className={cn(
        "h-14 rounded-lg text-sm font-medium transition-all active:scale-95",
        variant === 'default' && "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm",
        variant === 'operator' && "bg-blue-500 text-white hover:bg-blue-600 shadow-md",
        variant === 'action' && "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600",
        className
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalcIcon className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-40">Standard</span>
          </div>
          <button onClick={() => setHistory([])} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">
            <History className="w-3.5 h-3.5 opacity-40" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-end items-end mb-8">
          <div className="text-xs opacity-40 mb-1 h-4">
            {prevValue !== null ? `${prevValue} ${operator}` : ''}
          </div>
          <div className="text-5xl font-light tracking-tighter tabular-nums overflow-hidden text-right w-full">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button label="C" onClick={clearDisplay} variant="action" />
          <Button label={<Delete size={18} />} onClick={clearLastDigit} variant="action" />
          <Button label="%" onClick={() => setDisplay(String(parseFloat(display) / 100))} variant="action" />
          <Button label="/" onClick={() => performOperation('/')} variant="operator" />

          <Button label="7" onClick={() => inputDigit('7')} />
          <Button label="8" onClick={() => inputDigit('8')} />
          <Button label="9" onClick={() => inputDigit('9')} />
          <Button label="*" onClick={() => performOperation('*')} variant="operator" />

          <Button label="4" onClick={() => inputDigit('4')} />
          <Button label="5" onClick={() => inputDigit('5')} />
          <Button label="6" onClick={() => inputDigit('6')} />
          <Button label="-" onClick={() => performOperation('-')} variant="operator" />

          <Button label="1" onClick={() => inputDigit('1')} />
          <Button label="2" onClick={() => inputDigit('2')} />
          <Button label="3" onClick={() => inputDigit('3')} />
          <Button label="+" onClick={() => performOperation('+')} variant="operator" />

          <Button label="+/-" onClick={() => setDisplay(String(parseFloat(display) * -1))} />
          <Button label="0" onClick={() => inputDigit('0')} />
          <Button label="." onClick={inputDot} />
          <Button label="=" onClick={handleEqual} variant="operator" />
        </div>
      </div>

      {/* History Sidebar */}
      <div className="w-64 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hidden lg:flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest opacity-40">History</span>
          <button onClick={() => setHistory([])} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            <Trash2 size={12} className="opacity-40" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {history.length === 0 ? (
            <div className="text-[10px] opacity-40 italic mt-4">No history yet</div>
          ) : (
            history.map((item, i) => (
              <div key={i} className="text-right">
                <div className="text-[10px] opacity-40 mb-1">{item.split('=')[0]}=</div>
                <div className="text-sm font-bold">{item.split('=')[1]}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
