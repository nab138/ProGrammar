import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { IonInput, IonItem } from "@ionic/react";
import "./OtpInput.css";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ value, onChange }) => {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // Update the state when the external value changes
    setOtpValues(
      value.split("").slice(0, 6).concat(Array(6).fill("")).slice(0, 6)
    );
  }, [value]);

  const handleInputChange = (
    index: number,
    inputValue: string,
    backspace: boolean
  ) => {
    const newOtpValues = [...otpValues];
    let oldVal = newOtpValues[index];
    newOtpValues[index] = inputValue;

    // Join the array values and update the external state
    onChange(newOtpValues.join(""));

    // Move to the next input
    if (!backspace && index < 5 && inputValue !== "") {
      (inputRefs.current[index + 1] as HTMLInputElement).focus();
    } else if (backspace && index > 0 && oldVal === "") {
      (inputRefs.current[index - 1] as HTMLInputElement).focus();
    }

    setOtpValues(newOtpValues);
  };

  return (
    <div className="otp-input-container">
      <div className="otp-input-boxes">
        {otpValues.map((value, index) => (
          <input
            key={index}
            className="otp-input"
            ref={(el) => (inputRefs.current[index] = el!)}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onKeyUp={(e) => {
              const isBackspace = e.key === "Backspace";
              const isNumeric = /^\d$/.test(e.key);
              if (isBackspace) {
                handleInputChange(index, "", true);
              } else if (isNumeric) {
                handleInputChange(index, e.key, false);
              } else {
                const newOtpValues = [...otpValues];
                newOtpValues[index] = otpValues[index];
                setOtpValues(newOtpValues);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default OtpInput;
