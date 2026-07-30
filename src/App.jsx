import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete } from "lucide-react";
import'./index.css'

// ---- Tokens ----
// case:   #262a33 (graphite body)
// panel:  #e4e1d3 (thermal paper)
// ink:    #2a2a28 (paper text)
// key:    #333a47 (number keys)
// accent: #2f6f66 (teal - operators / equals)
// brass:  #b08d57 (clear / percent)

function formatNum(n) {
  if (n === "Error") return "Error";
  const num = parseFloat(n);
  if (Number.isNaN(num)) return "0";
  if (Math.abs(num) >= 1e12) return num.toExponential(4);
  const str = n.toString();
  if (str.length > 12) return num.toPrecision(10).replace(/\.?0+$/, "");
  return str;
}

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(true);
  const [history, setHistory] = useState([]);

  const inputDigit = (d) => {
    if (overwrite) {
      setDisplay(d === "." ? "0." : d);
      setOverwrite(false);
    } else {
      if (d === "." && display.includes(".")) return;
      if (display.replace("-", "").length >= 12) return;
      setDisplay(display + d);
    }
  };

  const clearAll = () => {
    setDisplay("0");
    setPrev(null);
    setOperator(null);
    setOverwrite(true);
  };

  const toggleSign = () => {
    setDisplay((d) => (d.startsWith("-") ? d.slice(1) : d === "0" ? d : "-" + d));
  };

  const percent = () => {
    setDisplay((d) => String(parseFloat(d) / 100));
  };

  const backspace = () => {
    if (overwrite) return;
    setDisplay((d) => (d.length <= 1 ? "0" : d.slice(0, -1)));
  };

  const compute = (a, b, op) => {
    switch (op) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? NaN : a / b;
      default: return b;
    }
  };

  const chooseOperator = (op) => {
    const current = parseFloat(display);
    if (operator && !overwrite) {
      const result = compute(prev, current, operator);
      const line = `${formatNum(prev)} ${operator} ${formatNum(current)} = ${formatNum(result)}`;
      setHistory((h) => [line, ...h].slice(0, 6));
      setDisplay(Number.isNaN(result) ? "Error" : String(result));
      setPrev(Number.isNaN(result) ? null : result);
    } else {
      setPrev(current);
    }
    setOperator(op);
    setOverwrite(true);
  };

  const equals = () => {
    if (operator == null || prev == null) return;
    const current = parseFloat(display);
    const result = compute(prev, current, operator);
    const line = `${formatNum(prev)} ${operator} ${formatNum(current)} = ${formatNum(result)}`;
    setHistory((h) => [line, ...h].slice(0, 6));
    setDisplay(Number.isNaN(result) ? "Error" : String(result));
    setPrev(null);
    setOperator(null);
    setOverwrite(true);
  };

  const shown = formatNum(display);

  return (
    <div className="min-h-[640px] w-full flex items-center justify-center bg-[#1b1e24] p-6">
      <div className="w-[320px] rounded-[28px] bg-[#262a33] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">

        {/* Paper tape history */}
        <div className="relative mb-3 h-28 overflow-hidden rounded-t-md bg-[#e4e1d3]">
          <div className="absolute inset-x-0 top-0 flex flex-col-reverse px-3 py-2 gap-0.5">
            <AnimatePresence initial={false}>
              {history.map((line, i) => (
                <motion.div
                  key={line + i}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 - i * 0.18 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  style={{ transformOrigin: "top" }}
                  className="font-mono text-[11px] text-[#6b6a5f] whitespace-nowrap"
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {/* perforated edge */}
          <div className="absolute bottom-0 inset-x-0 h-2 bg-[#262a33]"
               style={{
                 maskImage: "radial-gradient(circle 4px at 10px 0, transparent 4px, black 4.5px)",
                 maskSize: "20px 8px",
                 maskRepeat: "repeat-x",
                 WebkitMaskImage: "radial-gradient(circle 4px at 10px 0, transparent 4px, black 4.5px)",
                 WebkitMaskSize: "20px 8px",
                 WebkitMaskRepeat: "repeat-x",
               }}
          />
        </div>

        {/* Main display */}
        <div className="mb-4 rounded-b-md bg-[#e4e1d3] px-4 py-5 flex justify-end overflow-hidden">
          <div className="flex text-[#2a2a28]">
            <AnimatePresence mode="popLayout">
              {shown.split("").map((ch, i) => (
                <motion.span
                  key={`${i}-${ch}-${shown.length}`}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="font-mono text-4xl tabular-nums"
                  style={{ display: "inline-block" }}
                >
                  {ch}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2">
          <CalcKey label="C" onClick={clearAll} bg="#b08d57" />
          <CalcKey label="±" onClick={toggleSign} bg="#b08d57" />
          <CalcKey label="%" onClick={percent} bg="#b08d57" />
          <CalcKey label="÷" onClick={() => chooseOperator("÷")} bg="#2f6f66" active={operator === "÷"} />

          <CalcKey label="7" onClick={() => inputDigit("7")} />
          <CalcKey label="8" onClick={() => inputDigit("8")} />
          <CalcKey label="9" onClick={() => inputDigit("9")} />
          <CalcKey label="×" onClick={() => chooseOperator("×")} bg="#2f6f66" active={operator === "×"} />

          <CalcKey label="4" onClick={() => inputDigit("4")} />
          <CalcKey label="5" onClick={() => inputDigit("5")} />
          <CalcKey label="6" onClick={() => inputDigit("6")} />
          <CalcKey label="−" onClick={() => chooseOperator("−")} bg="#2f6f66" active={operator === "−"} />

          <CalcKey label="1" onClick={() => inputDigit("1")} />
          <CalcKey label="2" onClick={() => inputDigit("2")} />
          <CalcKey label="3" onClick={() => inputDigit("3")} />
          <CalcKey label="+" onClick={() => chooseOperator("+")} bg="#2f6f66" active={operator === "+"} />

          <CalcKey label="0" onClick={() => inputDigit("0")} wide />
          <CalcKey label="." onClick={() => inputDigit(".")} />
          <CalcKey icon={<Delete size={16} />} onClick={backspace} />
          <CalcKey label="=" onClick={equals} bg="#2f6f66" emphasis />
        </div>
      </div>
    </div>
  );
}

function CalcKey({ label, icon, onClick, bg = "#333a47", wide = false, active = false, emphasis = false }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92, y: 1 }}
      animate={active ? { scale: 1.04 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      className={`${wide ? "col-span-2" : ""} h-14 rounded-xl font-medium text-lg text-[#f1ece0] flex items-center justify-center select-none`}
      style={{
        background: bg,
        boxShadow: emphasis
          ? "0 4px 0 rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset"
          : "0 3px 0 rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03) inset",
      }}
      whileHover={{ filter: "brightness(1.12)" }}
    >
      {icon || label}
    </motion.button>
  );
}