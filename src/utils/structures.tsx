export interface Course {
  name: string;
  description: string;
  currentUnit: number;
  currentLesson: number;
  units: Unit[];
  id: string;
}

export interface Unit {
  name: string;
  description: string;
  id: string;
  lessons: LessonInfo[];
}

export interface LessonInfo {
  name: string;
  type: "quiz" | "learn";
  id: string;
}

export interface Lesson {
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
export function randomizeLesson(
  lesson: Lesson,
  lessonInfo: LessonInfo
): Lesson {
  let newQuestions: Question[];
  if (lessonInfo.type == "learn") {
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
  return { questions: newQuestions };
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
  return { questions: newQuestions };
}

export async function addQuestionIds(lesson: Lesson, lessonInfo: LessonInfo) {
  let newQuestions: Question[] = [];
  for (let i = 0; i < lesson.questions.length; i++) {
    let question = lesson.questions[i];
    question.id = lessonInfo.id + "-q" + i;
    newQuestions.push(question);
  }
  return { questions: newQuestions };
}

export async function prepareLesson(lesson: Lesson, course: Course, unit: Unit, lessonInfo: LessonInfo) {
  let lessonWithIds = await addQuestionIds(lesson, lessonInfo);
  let radnomizedLesson = randomizeLesson(lessonWithIds, lessonInfo);
  return await loadRichText(course, unit, radnomizedLesson);
}