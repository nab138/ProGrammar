export interface Course {
  name: string;
  description: string;
  units: Unit[];
  id: string;
}

export interface Unit {
  name: string;
  description: string;
  id: string;
  lessons: Lesson[];
}

export interface Lesson {
  name: string;
  type: "quiz" | "learn";
  id: string;
  questions: Question[];
}

export interface Question {
  question: string;
  content?: string;
  type: "mc" | "build" | "text";
  choices: string[];
  answer: string;
  id: string;
  explanations?: string[];
  hard?: boolean;
  rich?: boolean;
}
export interface BuildQuestion {
  question: string;
  type: "build";
  choices: string[];
  answer: string;
  id: string;
  hard?: boolean;
}
export interface MultipleChoiceQuestion {
  question: string;
  content?: string;
  type: "mc";
  choices: string[];
  answer: string;
  explanations: string[];
  id: string;
  hard?: boolean;
  rich?: boolean;
}
