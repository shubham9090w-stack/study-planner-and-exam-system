export type UserRole = 'student' | 'admin';
export type AccountStatus = 'active' | 'inactive' | 'suspended';
export type BcaYear = 'First Year' | 'Second Year' | 'Third Year';
export type PriorityLevel = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type ExamStatus = 'draft' | 'published' | 'archived';
export type ExamCategory = 'Practice Test' | 'Unit Exam' | 'Semester Mock' | 'Final Assessment';
export type QuestionStatus = 'not_visited' | 'answered' | 'not_answered' | 'marked_for_review';
export type ResultStatus = 'passed' | 'failed' | 'pending';
export type MaterialCategory = 'Lecture Notes' | 'Syllabus' | 'Previous Year Questions' | 'Lab Manual' | 'Cheat Sheet';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  password?: string;
}

export interface StudentProfile {
  userId: number;
  mobile: string;
  collegeName: string;
  universityName: string;
  courseName: string;
  bcaYear: BcaYear;
  semester: number;
  rollNumber: string;
  profilePicture?: string;
  preferredStudyTime: string;
  dailyStudyHours: number;
  preferredSessionDuration: number;
  targetExamDate?: string;
  academicGoals?: string;
  difficultSubjects?: string;
  profileCompleted: boolean;
}

export interface Subject {
  id: number;
  subjectName: string;
  subjectCode: string;
  bcaYear: BcaYear;
  semester: number;
  description: string;
}

export interface StudyTask {
  id: number;
  userId: number;
  subjectId: number;
  title: string;
  topic: string;
  description: string;
  studyDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  priority: PriorityLevel;
  status: TaskStatus;
  completedAt?: string;
  createdAt: string;
}

export interface QuestionOption {
  id: number;
  letter: string; // A, B, C, D
  optionText: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  examinationId: number;
  questionText: string;
  marks: number;
  negativeMarks: number;
  explanation: string;
  displayOrder: number;
  options: QuestionOption[];
}

export interface Examination {
  id: number;
  title: string;
  subjectId: number;
  bcaYear: BcaYear;
  semester: number;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: number;
  examCategory: ExamCategory;
  status: ExamStatus;
  questionsCount?: number;
  scheduledAt?: string;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  isCustom?: boolean;
}

export interface StudentAnswer {
  questionId: number;
  selectedOptionId?: number;
  isMarkedForReview: boolean;
  answeredAt?: string;
}

export interface ExamAttempt {
  id: number;
  userId: number;
  examinationId: number;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  totalMarks: number;
  percentage?: number;
  resultStatus: ResultStatus;
  timeTakenSeconds?: number;
  answers: Record<number, {
    selectedOptionId?: number;
    isCorrect?: boolean;
    marksAwarded: number;
    isMarkedForReview: boolean;
  }>;
}

export interface StudyMaterial {
  id: number;
  subjectId: number;
  title: string;
  description: string;
  filePath: string;
  fileType: string;
  fileSizeKb: number;
  category: MaterialCategory;
  downloadCount: number;
  uploadedBy: number;
  createdAt: string;
  contentPreview?: string;
}
