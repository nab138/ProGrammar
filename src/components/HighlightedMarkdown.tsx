import React, { useRef, useEffect, useState } from "react";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import "./HighlightedMarkdown.css";

interface HighlightedMarkdownProps {
  children: string;
  className?: string;
}

export function HighlightedMarkdown({
  children,
  className,
}: HighlightedMarkdownProps) {
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      import("highlight.js/styles/atom-one-dark.css");
    } else {
      import("highlight.js/styles/atom-one-light.css");
    }
  }, []);

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [children]);

  return (
    <div className={className} ref={rootRef}>
      <Markdown>{children}</Markdown>
    </div>
  );
}
