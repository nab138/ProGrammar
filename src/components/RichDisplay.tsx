import React from "react";
import "highlight.js/styles/docco.css"; // choose your style
import { HighlightedMarkdown } from "./HighlightedMarkdown";

interface RichDisplayProps {
  content: string;
  richDisplay: boolean;
}

const RichDisplay: React.FC<RichDisplayProps> = ({ content, richDisplay }) => {
  if (!richDisplay)
    return <h1 className="rich-display ion-padding">{content}</h1>;

  return (
    <HighlightedMarkdown className="rich-display ion-padding">
      {content}
    </HighlightedMarkdown>
  );
};

export default RichDisplay;
