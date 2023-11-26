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
  type: "quiz" | "code";
  id: string;
}

export interface Lesson {
  questions: Question[];
}

export interface Question {
  question: string;
  content?: string;
  type: "mc" | "fill";
  choices: string[];
  answer: string;
  explanations?: string[];
  rich?: boolean;
}

export interface MultipleChoiceQuestion {
  question: string;
  content?: string;
  type: "mc";
  choices: string[];
  answer: string;
  explanations: string[];
  rich?: boolean;
}
export function randomizeLesson(lesson: Lesson): Lesson {
  // Randomize the order of the questions, and the order of answers within the question and adjust the order of the explanations accordingly.
  let newQuestions: Question[] = lesson.questions.sort(
    () => Math.random() - 0.5
  );
  newQuestions.forEach((question) => {
    if (question.type == "mc") {
      let mcQuestion = question as MultipleChoiceQuestion;
      let indices = Array.from(
        { length: mcQuestion.choices.length },
        (_, i) => i
      );
      indices.sort(() => Math.random() - 0.5);
      let newChoices: string[] = indices.map((i) => mcQuestion.choices[i]);
      let newExplanations: string[] = indices.map(
        (i) => mcQuestion.explanations[i]
      );
      mcQuestion.choices = newChoices;
      mcQuestion.explanations = newExplanations;
    }
  });
  return { questions: newQuestions };
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
