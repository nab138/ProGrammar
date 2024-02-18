import React, { useEffect, useState } from "react";
import "./Terminal.css";

interface TerminalProps {
  lastOutput: string;
  onEnter: (input: string) => Promise<string>;
  className?: string;
}
const Terminal: React.FC<TerminalProps> = ({
  onEnter,
  className,
  lastOutput,
}) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>([lastOutput]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (lastOutput === "Running..." || lastOutput === "") {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
    setOutput([lastOutput]);
  }, [lastOutput]);

  const handleKeyDown = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const result = await onEnter(input);
      setOutput((prevOutput) => [...prevOutput, `> ${input}`, result]);
      setInput("");
    }
  };

  return (
    <div className={"terminal " + className}>
      {output.map((line, index) => (
        <div key={index}>
          {line.split("\n").map((text, i) => {
            if (text === "") return null;
            return (
              <React.Fragment key={i}>
                {text}
                <br />
              </React.Fragment>
            );
          })}
        </div>
      ))}
      {!disabled && (
        <input
          value={"> " + input}
          onChange={(e) => setInput(e.target.value.substring(2))}
          onKeyDown={handleKeyDown}
        />
      )}
    </div>
  );
};

export default Terminal;
