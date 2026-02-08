
export enum StudentLevel {
  SECONDARY = 'secondary',
  UNIVERSITY = 'university'
}

export type ExamType = 'WAEC' | 'NECO' | 'JAMB' | 'School Exam' | '';

export interface UserContext {
  level: StudentLevel;
  questionCount: number;
  timeLimit?: number; // In minutes
  novelTitle?: string;
  secondaryDetails?: {
    examType: ExamType;
    subject: string;
    topic?: string;
  };
  universityDetails?: {
    universityName: string;
    faculty: string;
    level: string;
    courseCode: string;
    courseName: string;
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudyMaterial {
  title: string;
  description: string;
  link: string;
}

export interface QuizSession {
  questions: QuizQuestion[];
  userAnswers: number[];
  score: number;
  isComplete: boolean;
  timeSpent?: number; // In seconds
  groundingSources?: { title: string; uri: string }[];
  recommendations?: StudyMaterial[];
}
