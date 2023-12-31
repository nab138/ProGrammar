import { useRef, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import "./HighlightedMarkdown.css";
import { Tooltip } from "react-tooltip";
import { flip, offset, shift, size } from "@floating-ui/dom";

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
                      data-tooltip-position-strategy="fixed"
                    >
                      {children}
                    </u>
                    <Tooltip
                      wrapper="span"
                      id={id}
                      openOnClick={true}
                      middlewares={[
                        offset(10),
                        flip(),
                        size({
                          apply: ({
                            availableWidth,
                            availableHeight,
                            elements,
                          }) => {
                            Object.assign(elements.floating.style, {
                              maxWidth: `${Math.max(
                                200,
                                availableWidth - 50
                              )}px`,
                            });
                          },
                        }),
                        shift({ padding: 5 }),
                        flip({
                          fallbackAxisSideDirection: "start",
                        }),
                      ]}
                    />
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
