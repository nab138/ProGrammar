import { java } from "@codemirror/lang-java";

export interface Course {
  name: string;
  description: string;
  currentUnit: number;
  currentLesson: number;
  difficulty: number;
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
  type: "mc" | "build" | "text" | "code";
  choices?: string[];
  answer: string | string[];
  id: string;
  explanations?: string[];
  hard?: boolean;
  rich?: boolean;
  template?: string;
  language?: string;
}
export interface BuildQuestion {
  question: string;
  type: "build";
  choices: string[];
  answer: string;
  id: string;
  hard?: boolean;
  rich?: boolean;
}
export interface CodeQuestion {
  question: string;
  type: "code";
  answer: string;
  id: string;
  hard?: boolean;
  rich?: boolean;
  template: string;
  language: string;
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

export interface ProjectLanguage {
  name: string;
  id: string;
  projects: Project[];
}

export interface PistonResponse {
  language: string;
  version: number;
  run: {
    output: string;
    stderr: string;
    stdout: string;
    code: number;
    signal: number | null;
  };
}

export interface Script {
  name: string;
  content: string;
}

export interface ProjectFile {
  name: string;
  template: string;
  task: string;
  id: string;
}
export interface Project {
  name: string;
  difficulty: string;
  id: string;
  files: ProjectFile[];
  autograder: Script;
}
export const difficultyLookup: { [key: number]: string } = {
  0: "Beginner",
  1: "Beginner-Intermediate",
  2: "Intermediate",
  3: "Intermediate-Advanced",
  4: "Advanced",
};

export const langToHighlight: { [key: string]: any } = {
  java,
};

export function randomizeLesson(lesson: Lesson): Lesson {
  let newQuestions: Question[];
  if (lesson.type == "learn") {
    newQuestions = [...lesson.questions];
  } else {
    newQuestions = [...shuffleArray(lesson.questions)];
  }
  // Randomize the order of the questions, and the order of answers within the question and adjust the order of the explanations accordingly.
  newQuestions.forEach((question) => {
    if (question.type == "mc") {
      let mcQuestion = question as MultipleChoiceQuestion;
      let indices = Array.from(
        { length: mcQuestion.choices.length },
        (_, i) => i
      );
      let shuffledIndices = shuffleArray(indices);
      let newChoices: string[] = shuffledIndices.map(
        (i) => mcQuestion.choices[i]
      );
      let newExplanations: string[] = shuffledIndices.map(
        (i) => mcQuestion.explanations[i]
      );
      mcQuestion.choices = newChoices;
      mcQuestion.explanations = newExplanations;
    } else if (question.type == "build") {
      let buildQuestion = question as BuildQuestion;
      buildQuestion.choices = shuffleArray(buildQuestion.choices);
    }
  });
  return {
    questions: newQuestions,
    name: lesson.name,
    type: lesson.type,
    id: lesson.id,
  };
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
export async function loadRichText(
  course: Course,
  unit: Unit,
  lesson: Lesson
): Promise<Lesson> {
  let newQuestions: Question[] = [];
  for (let question of lesson.questions) {
    if (question.rich) {
      let questionModule = await import(
        `../courses/${course.id}/${unit.id}/markdown/${question.question}.md`
      );
      question.content = questionModule.default;
    }
    newQuestions.push(question);
  }
  return {
    questions: newQuestions,
    name: lesson.name,
    type: lesson.type,
    id: lesson.id,
  };
}

export async function addQuestionIds(lesson: Lesson): Promise<Lesson> {
  let newQuestions: Question[] = [];
  for (let i = 0; i < lesson.questions.length; i++) {
    let question = lesson.questions[i];
    question.id = lesson.id + "-q" + i;
    newQuestions.push(question);
  }
  return {
    questions: newQuestions,
    name: lesson.name,
    type: lesson.type,
    id: lesson.id,
  };
}

export async function prepareLesson(
  lesson: Lesson
  // course: Course,
  // unit: Unit
) {
  let lessonWithIds = await addQuestionIds(lesson);
  let radnomizedLesson = randomizeLesson(lessonWithIds);
  //return await loadRichText(course, unit, radnomizedLesson);
  return radnomizedLesson;
}
