import React from "react";
import "highlight.js/styles/docco.css"; // choose your style
import { HighlightedMarkdown } from "./HighlightedMarkdown";

interface RichDisplayProps {
  content: string;
  richDisplay: boolean;
  className?: string;
  smallHeader?: boolean;
}

const RichDisplay: React.FC<RichDisplayProps> = ({
  content,
  richDisplay,
  className,
  smallHeader,
}) => {
  let classList =
    "rich-display ion-padding" + (className ? " " + className : "");
  if (!richDisplay) {
    if (!smallHeader) {
      return <h1 className={classList}>{content}</h1>;
    } else {
      return <h2 className={classList}>{content}</h2>;
    }
  }

  return (
    <HighlightedMarkdown className={classList}>{content}</HighlightedMarkdown>
  );
};

export default RichDisplay;
