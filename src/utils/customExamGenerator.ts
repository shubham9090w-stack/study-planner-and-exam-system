import { Subject, Examination, Question, QuestionOption } from '../types';

/**
 * Natural language intent parser for custom student test queries.
 * Handles inputs like:
 * - "test of dbms student will write i want to give test 10 question"
 * - "i want to give test 10 question"
 * - "give me 10 questions on computer fundamental"
 * - "oops using c++ 10 question"
 * - "test of python 15 questions"
 */
export function parseNaturalTestRequest(
  input: string,
  subjects: Subject[]
): {
  matchedSubject?: Subject;
  questionCount?: number;
  extractedSubjectName?: string;
} {
  const clean = input.toLowerCase().trim();
  if (!clean) return {};

  // Extract number of questions
  let questionCount: number | undefined;

  // Patterns like "10 question", "10 questions", "test 10", "10 q", "10 mcq", or standalone number
  const countMatch = clean.match(/(\d+)\s*(?:questions?|q|marks?|items?|mcqs?)?/i);
  if (countMatch && countMatch[1]) {
    const num = parseInt(countMatch[1], 10);
    if (!isNaN(num) && num > 0 && num <= 100) {
      questionCount = num;
    }
  }

  // Subject alias mapping for natural matching
  const aliases: Array<{ keys: string[]; subjectMatcher: (s: Subject) => boolean }> = [
    {
      keys: ['dbms', 'database', 'sql', 'rdbms', 'relational'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('database') || s.subjectCode.toLowerCase().includes('301'),
    },
    {
      keys: ['computer fundamental', 'computer fundamentals', 'fundamentals', 'digital electronics', 'hardware', 'bca-102'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('fundamental') || s.subjectCode.toLowerCase().includes('102'),
    },
    {
      keys: ['oops using c++', 'oops', 'c++', 'cpp', 'object oriented', 'bca-202'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('oops') || s.subjectName.toLowerCase().includes('object oriented'),
    },
    {
      keys: ['python', 'python programming', 'data analytics', 'bca-601'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('python'),
    },
    {
      keys: ['e business', 'e-business', 'ecommerce', 'e-commerce', 'bca-405'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('e-business') || s.subjectName.toLowerCase().includes('business'),
    },
    {
      keys: ['functional management', 'functional', 'management', 'bca-305'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('functional management'),
    },
    {
      keys: ['entrepreneurship development', 'entrepreneurship', 'entrepreneur', 'startup', 'bca-605'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('entrepreneurship'),
    },
    {
      keys: ['c programming', 'c language', 'bca-101'],
      subjectMatcher: (s) => s.subjectCode === 'BCA-101' || s.subjectName.toLowerCase().includes('programming in c'),
    },
    {
      keys: ['data structures', 'dsa', 'bca-201'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('data structures'),
    },
    {
      keys: ['web technology', 'web technologies', 'javascript', 'html', 'bca-303'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('web technologies'),
    },
    {
      keys: ['java', 'java programming', 'bca-401'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('java'),
    },
    {
      keys: ['operating system', 'operating systems', 'os', 'bca-402'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('operating systems'),
    },
    {
      keys: ['computer network', 'computer networks', 'networking', 'cyber security', 'bca-502'],
      subjectMatcher: (s) => s.subjectName.toLowerCase().includes('computer networks'),
    },
  ];

  let matchedSubject: Subject | undefined;
  let extractedSubjectName: string | undefined;

  for (const item of aliases) {
    if (item.keys.some((k) => clean.includes(k))) {
      matchedSubject = subjects.find(item.subjectMatcher);
      if (matchedSubject) {
        extractedSubjectName = matchedSubject.subjectName;
        break;
      }
    }
  }

  // Fallback: check exact or partial substring match in subjects list
  if (!matchedSubject) {
    for (const sub of subjects) {
      const subLower = sub.subjectName.toLowerCase();
      const codeLower = sub.subjectCode.toLowerCase();
      if (clean.includes(subLower) || clean.includes(codeLower)) {
        matchedSubject = sub;
        extractedSubjectName = sub.subjectName;
        break;
      }
    }
  }

  return {
    matchedSubject,
    questionCount,
    extractedSubjectName,
  };
}

/**
 * Builds a dynamic question pool for any subject if extra questions are needed.
 */
function generateSubjectQuestion(subject: Subject, index: number, examId: number): Question {
  const qId = Date.now() + index * 100 + Math.floor(Math.random() * 90);
  const topics = [
    'fundamental architectural concepts',
    'core principles and standard definitions',
    'operational lifecycle and protocols',
    'industry best practices and problem-solving',
    'system design and theoretical foundations',
    'comparative analysis of algorithms',
    'implementation strategies in modern workflows',
    'security, reliability, and edge-case handling',
  ];
  const topic = topics[index % topics.length];

  return {
    id: qId,
    examinationId: examId,
    questionText: `In the study of ${subject.subjectName} (${subject.subjectCode}), which statement most accurately describes the ${topic}?`,
    marks: 2,
    negativeMarks: 0.5,
    explanation: `For ${subject.subjectName}, mastering ${topic} is an essential curricular competency according to the university BCA syllabus guidelines.`,
    displayOrder: index + 1,
    options: [
      { id: qId * 10 + 1, letter: 'A', optionText: `It establishes the standardized reference paradigm according to ${subject.subjectCode} specifications.`, isCorrect: true },
      { id: qId * 10 + 2, letter: 'B', optionText: `It executes only during legacy offline maintenance routines.`, isCorrect: false },
      { id: qId * 10 + 3, letter: 'C', optionText: `It requires continuous manual administrative bypass on every operation.`, isCorrect: false },
      { id: qId * 10 + 4, letter: 'D', optionText: `It completely bypasses all data integrity and compilation checks.`, isCorrect: false },
    ],
  };
}

/**
 * Creates a student-customized Examination paper with exactly `questionCount` questions.
 */
export function buildCustomExamPaper(
  subject: Subject,
  requestedCount: number,
  allExistingQuestions: Question[],
  allExistingExams: Examination[],
  options?: {
    durationMinutes?: number;
    negativeMarking?: number;
    customTitle?: string;
  }
): { exam: Examination; questions: Question[] } {
  const count = Math.max(1, Math.min(50, requestedCount || 10));
  const examId = Date.now();

  // Find all questions associated with exams for this subject
  const subjectExamIds = new Set(
    allExistingExams.filter((e) => e.subjectId === subject.id).map((e) => e.id)
  );
  const candidateQuestions = allExistingQuestions.filter((q) => subjectExamIds.has(q.examinationId));

  // Shuffle candidates
  const shuffledCandidates = [...candidateQuestions].sort(() => 0.5 - Math.random());

  const finalQuestions: Question[] = [];

  // Take as many real questions as available
  for (let i = 0; i < Math.min(count, shuffledCandidates.length); i++) {
    const orig = shuffledCandidates[i];
    const newQId = Date.now() + i * 50 + Math.floor(Math.random() * 40);
    finalQuestions.push({
      ...orig,
      id: newQId,
      examinationId: examId,
      displayOrder: i + 1,
      options: orig.options.map((opt, oIdx) => ({
        ...opt,
        id: newQId * 10 + (oIdx + 1),
      })),
    });
  }

  // If more questions were requested than exist in the bank, generate supplemental questions
  while (finalQuestions.length < count) {
    const supplement = generateSubjectQuestion(subject, finalQuestions.length, examId);
    finalQuestions.push(supplement);
  }

  const durationMinutes = options?.durationMinutes || Math.max(5, Math.round(count * 1.5));
  const totalMarks = count * 2;
  const passingMarks = Math.ceil(count * 0.8); // 40%
  const negativeMarking = options?.negativeMarking !== undefined ? options.negativeMarking : 0.5;

  const exam: Examination = {
    id: examId,
    title:
      options?.customTitle ||
      `Custom Practice Test: ${subject.subjectName} (${count} Questions)`,
    subjectId: subject.id,
    bcaYear: subject.bcaYear,
    semester: subject.semester,
    description: `Customized student evaluation for ${subject.subjectName} (${subject.subjectCode}) featuring ${count} university-standard questions.`,
    durationMinutes,
    totalMarks,
    passingMarks,
    negativeMarking,
    examCategory: 'Practice Test',
    status: 'published',
    questionsCount: count,
    scheduledAt: new Date().toISOString(),
    startAt: new Date().toISOString(),
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    isCustom: true,
  };

  return { exam, questions: finalQuestions };
}
