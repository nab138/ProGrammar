import { useRef, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import "./HighlightedMarkdown.css";
import { Tooltip } from "react-tooltip";

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
      <Markdown
        options={{
          overrides: {
            a: {
              component: ({ href, children }) => {
                let decodedHref = decodeURIComponent(href);
                // replace all spaces with dashes
                let id = decodedHref.replace(/ /g, "-").toLowerCase();
                return (
                  <>
                    <u
                      className="vocab-term"
                      data-tooltip-id={id}
                      data-tooltip-content={decodedHref}
                      data-tooltip-variant="info"
                    >
                      {children}
                    </u>
                    <Tooltip id={id} openOnClick={true} />
                  </>
                );
              },
            },
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
