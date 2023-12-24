import { createContext } from "react";

export const LessonContext = createContext({
  skipToEnd: () => {},
  setSkipToEnd: (fn: () => void) => {},
});
