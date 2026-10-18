import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  StudentProfile,
  Subject,
  StudyTask,
  Examination,
  Question,
  StudyMaterial,
  ExamAttempt,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROFILES,
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_EXAMINATIONS,
  INITIAL_QUESTIONS,
  INITIAL_MATERIALS,
  INITIAL_ATTEMPTS,
} from '../data/initialData';
import {
  getAuthorizedAdminEmail,
  isAuthorizedAdminEmail,
  isAuthorizedAdmin,
  verifyAdminPasscode,
  getAdminSecurityPin,
} from '../utils/adminAuth';
import { buildCustomExamPaper } from '../utils/customExamGenerator';

interface AppContextType {
  currentUser: User | null;
  currentProfile: StudentProfile | null;
  isAdmin: boolean;
  users: User[];
  profiles: Record<number, StudentProfile>;
  subjects: Subject[];
  tasks: StudyTask[];
  examinations: Examination[];
  questions: Question[];
  materials: StudyMaterial[];
  attempts: ExamAttempt[];
  activeExamId: number | null;
  viewingResultAttemptId: number | null;
  currentView: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setCurrentView: (view: string) => void;
  setActiveExamId: (id: number | null) => void;
  setViewingResultAttemptId: (id: number | null) => void;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: number) => void;
  signup: (formData: any) => boolean;
  updateProfile: (profile: Partial<StudentProfile>) => void;
  // Tasks CRUD
  addTask: (task: Omit<StudyTask, 'id' | 'userId' | 'createdAt'>) => void;
  updateTask: (task: StudyTask) => void;
  deleteTask: (id: number) => void;
  toggleTaskStatus: (id: number) => void;
  // Subjects CRUD
  addSubject: (sub: Omit<Subject, 'id'>) => void;
  updateSubject: (sub: Subject) => void;
  deleteSubject: (id: number) => void;
  // Exams & Questions CRUD
  addExam: (exam: Omit<Examination, 'id' | 'createdAt'>) => void;
  updateExam: (exam: Examination) => void;
  deleteExam: (id: number) => void;
  addQuestion: (q: Omit<Question, 'id'>) => void;
  updateQuestion: (q: Question) => void;
  deleteQuestion: (id: number) => void;
  // Custom Exam Generator
  generateCustomExam: (params: {
    subjectId: number;
    questionCount: number;
    durationMinutes?: number;
    negativeMarking?: number;
    customTitle?: string;
  }) => number;
  // Attempts
  submitExamAttempt: (examId: number, answers: Record<number, { selectedOptionId?: number; isMarkedForReview: boolean }>, timeTaken: number) => number;
  // Materials
  addMaterial: (m: Omit<StudyMaterial, 'id' | 'createdAt' | 'downloadCount' | 'uploadedBy'>) => void;
  deleteMaterial: (id: number) => void;
  incrementDownload: (id: number) => void;
  // Admin Student status
  toggleUserStatus: (userId: number) => void;
  deleteUser: (userId: number) => void;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence in localStorage
  const loadStored = <T,>(key: string, defaultVal: T): T => {
    try {
      const stored = localStorage.getItem(`bca_app_${key}`);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const DEMO_EMAILS = [
    'student@bca-planner.edu',
    'priya.patel@bca-planner.edu',
    'rohan.v@bca-planner.edu',
    'admin@bca-planner.edu',
    'shubham9090w@gmail.com',
  ];

  const [users, setUsers] = useState<User[]>(() => {
    const loadedRaw = loadStored('users', INITIAL_USERS);
    // Purge any legacy demo users from previous storage
    const loaded = loadedRaw.filter(
      (u: User) => !DEMO_EMAILS.includes(u.email.toLowerCase()) && u.id !== 2 && u.id !== 3 && u.id !== 4
    );

    const adminEmail = getAuthorizedAdminEmail();
    const existingAdmin = loaded.find((u: User) => u.email.toLowerCase() === adminEmail);
    if (!existingAdmin) {
      const newAdmin: User = {
        id: 1,
        fullName: 'Shubham Waghmare (Administrator)',
        email: adminEmail,
        role: 'admin',
        accountStatus: 'active',
        createdAt: '2025-01-10 09:00:00',
        password: getAdminSecurityPin(),
      };
      return [newAdmin, ...loaded.filter((u: User) => u.email.toLowerCase() !== adminEmail && u.id !== 1)];
    } else {
      return loaded.map((u: User) => {
        if (u.email.toLowerCase() === adminEmail) {
          return {
            ...u,
            fullName: 'Shubham Waghmare (Administrator)',
            role: 'admin' as const,
            password: u.password === 'Admin@9090' ? getAdminSecurityPin() : (u.password || getAdminSecurityPin()),
          };
        }
        // Demote any other unauthorized users who might have admin role
        if (u.role === 'admin') {
          return { ...u, role: 'student' as const };
        }
        return u;
      });
    }
  });

  const [profiles, setProfiles] = useState<Record<number, StudentProfile>>(() => {
    const loaded = loadStored('profiles', INITIAL_PROFILES);
    // Strip legacy demo profiles 2, 3, 4
    delete loaded[2];
    delete loaded[3];
    delete loaded[4];
    return loaded;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const loaded = loadStored('subjects', INITIAL_SUBJECTS);
    const existingIds = new Set(loaded.map((s: Subject) => s.id));
    const missing = INITIAL_SUBJECTS.filter((s) => !existingIds.has(s.id));
    const updated = loaded.map((s: Subject) => {
      const init = INITIAL_SUBJECTS.find((item) => item.id === s.id);
      if (init && (s.id === 2 || s.id === 5)) {
        return { ...s, subjectName: init.subjectName };
      }
      return s;
    });
    return [...updated, ...missing];
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const loaded = loadStored('tasks', INITIAL_TASKS);
    // Remove tasks associated with legacy demo users
    return loaded.filter((t) => t.userId !== 2 && t.userId !== 3 && t.userId !== 4);
  });

  const [examinations, setExaminations] = useState<Examination[]>(() => {
    const loaded = loadStored('examinations', INITIAL_EXAMINATIONS);
    const existingIds = new Set(loaded.map((e: Examination) => e.id));
    const missing = INITIAL_EXAMINATIONS.filter((e) => !existingIds.has(e.id));
    return [...loaded, ...missing].map((exam) => {
      if (!exam.startAt && !exam.scheduledAt) {
        const init = INITIAL_EXAMINATIONS.find((e) => e.id === exam.id);
        const start = init?.startAt || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
        return { ...exam, startAt: start, scheduledAt: start };
      }
      return exam;
    });
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const loaded = loadStored('questions', INITIAL_QUESTIONS);
    const existingIds = new Set(loaded.map((q: Question) => q.id));
    const missing = INITIAL_QUESTIONS.filter((q) => !existingIds.has(q.id));
    return [...loaded, ...missing];
  });

  const [materials, setMaterials] = useState<StudyMaterial[]>(() => {
    const loaded = loadStored('materials', INITIAL_MATERIALS);
    const existingIds = new Set(loaded.map((m: StudyMaterial) => m.id));
    const missing = INITIAL_MATERIALS.filter((m) => !existingIds.has(m.id));
    return [...loaded, ...missing];
  });

  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => {
    const loaded = loadStored('attempts', INITIAL_ATTEMPTS);
    // Remove attempts associated with legacy demo users
    return loaded.filter((a) => a.userId !== 2 && a.userId !== 3 && a.userId !== 4);
  });

  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem('bca_app_current_user_id');
    const parsed = stored ? Number(stored) : null;
    // Clear out legacy demo user IDs (2, 3, 4)
    if (parsed === 2 || parsed === 3 || parsed === 4) {
      localStorage.removeItem('bca_app_current_user_id');
      return null;
    }
    return parsed;
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeExamId, setActiveExamId] = useState<number | null>(null);
  const [viewingResultAttemptId, setViewingResultAttemptId] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bca_app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('bca_app_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('bca_app_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('bca_app_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('bca_app_examinations', JSON.stringify(examinations));
  }, [examinations]);

  useEffect(() => {
    localStorage.setItem('bca_app_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('bca_app_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('bca_app_attempts', JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    if (currentUserId !== null) {
      localStorage.setItem('bca_app_current_user_id', String(currentUserId));
    } else {
      localStorage.removeItem('bca_app_current_user_id');
    }
  }, [currentUserId]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const currentProfile = currentUserId ? profiles[currentUserId] || null : null;
  const isAdmin = isAuthorizedAdmin(currentUser);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = (email: string, password?: string): boolean => {
    const cleanEmail = email.toLowerCase().trim();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    // If trying to authenticate as Administrator
    if (isAuthorizedAdminEmail(cleanEmail)) {
      const enteredPass = password?.trim() || '';
      const isValidPass =
        (user?.password && user.password === enteredPass) ||
        verifyAdminPasscode(enteredPass);

      if (!isValidPass) return false;

      if (user) {
        if (user.accountStatus !== 'active') return false;
        setCurrentUserId(user.id);
        setCurrentView('admin_dashboard');
        return true;
      } else {
        const newAdmin: User = {
          id: 1,
          fullName: 'Shubham Waghmare (Administrator)',
          email: cleanEmail,
          role: 'admin',
          accountStatus: 'active',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          password: enteredPass,
        };
        setUsers((prev) => [newAdmin, ...prev.filter((u) => u.id !== 1)]);
        setCurrentUserId(1);
        setCurrentView('admin_dashboard');
        return true;
      }
    }

    // Student account login
    if (user) {
      if (user.accountStatus !== 'active') return false;
      if (password && user.password && user.password !== password.trim()) {
        return false;
      }
      setCurrentUserId(user.id);
      setCurrentView('dashboard'); // regular students always navigate to student dashboard
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUserId(null);
    setCurrentView('login');
  };

  const switchUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUserId(user.id);
      setActiveExamId(null);
      setViewingResultAttemptId(null);
      setCurrentView(isAuthorizedAdmin(user) ? 'admin_dashboard' : 'dashboard');
    }
  };

  const signup = (formData: any): boolean => {
    const cleanEmail = formData.email.toLowerCase().trim();
    // Cannot claim admin email via student signup
    if (isAuthorizedAdminEmail(cleanEmail)) {
      return false;
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) return false;

    const newId = Date.now();
    const newUser: User = {
      id: newId,
      fullName: formData.fullName,
      email: formData.email,
      role: 'student', // strictly enforced student role
      accountStatus: 'active',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      password: formData.password || '',
    };

    const newProfile: StudentProfile = {
      userId: newId,
      mobile: formData.mobile || '',
      collegeName: formData.collegeName || '',
      universityName: formData.universityName || '',
      courseName: 'Bachelor of Computer Applications (BCA)',
      bcaYear: formData.bcaYear || 'First Year',
      semester: Number(formData.semester) || 1,
      rollNumber: formData.rollNumber || '',
      preferredStudyTime: 'Evening (5 PM - 9 PM)',
      dailyStudyHours: 3.0,
      preferredSessionDuration: 45,
      profileCompleted: false,
    };

    setUsers((prev) => [...prev, newUser]);
    setProfiles((prev) => ({ ...prev, [newId]: newProfile }));
    setCurrentUserId(newId);
    setCurrentView('complete_profile');
    return true;
  };

  const updateProfile = (updatedData: Partial<StudentProfile>) => {
    if (!currentUserId) return;
    setProfiles((prev) => ({
      ...prev,
      [currentUserId]: {
        ...(prev[currentUserId] || {
          userId: currentUserId,
          mobile: '',
          collegeName: '',
          universityName: '',
          courseName: 'Bachelor of Computer Applications (BCA)',
          bcaYear: 'First Year',
          semester: 1,
          rollNumber: '',
          preferredStudyTime: 'Evening (5 PM - 9 PM)',
          dailyStudyHours: 3.0,
          preferredSessionDuration: 45,
          profileCompleted: true,
        }),
        ...updatedData,
        profileCompleted: true,
      },
    }));
  };

  // Tasks
  const addTask = (taskData: Omit<StudyTask, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUserId) return;
    const newTask: StudyTask = {
      ...taskData,
      id: Date.now(),
      userId: currentUserId,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (updatedTask: StudyTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskStatus = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'Completed' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : undefined,
        };
      })
    );
  };

  // Subjects
  const addSubject = (sub: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...sub,
      id: Date.now(),
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const updateSubject = (sub: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === sub.id ? sub : s)));
  };

  const deleteSubject = (id: number) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // Exams
  const addExam = (exam: Omit<Examination, 'id' | 'createdAt'>) => {
    const newExam: Examination = {
      ...exam,
      id: Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setExaminations((prev) => [newExam, ...prev]);
  };

  const updateExam = (exam: Examination) => {
    setExaminations((prev) => prev.map((e) => (e.id === exam.id ? exam : e)));
  };

  const deleteExam = (id: number) => {
    setExaminations((prev) => prev.filter((e) => e.id !== id));
    setQuestions((prev) => prev.filter((q) => q.examinationId !== id));
  };

  // Questions
  const addQuestion = (q: Omit<Question, 'id'>) => {
    const newQuestion: Question = {
      ...q,
      id: Date.now(),
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const updateQuestion = (q: Question) => {
    setQuestions((prev) => prev.map((item) => (item.id === q.id ? q : item)));
  };

  const deleteQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((item) => item.id !== id));
  };

  // Custom Exam Generator
  const generateCustomExam = (params: {
    subjectId: number;
    questionCount: number;
    durationMinutes?: number;
    negativeMarking?: number;
    customTitle?: string;
  }): number => {
    const subject = subjects.find((s) => s.id === params.subjectId);
    if (!subject) return 0;

    const { exam, questions: newExamQuestions } = buildCustomExamPaper(
      subject,
      params.questionCount,
      questions,
      examinations,
      {
        durationMinutes: params.durationMinutes,
        negativeMarking: params.negativeMarking,
        customTitle: params.customTitle,
      }
    );

    setExaminations((prev) => [exam, ...prev]);
    setQuestions((prev) => [...prev, ...newExamQuestions]);
    return exam.id;
  };

  // Attempt Submission & Evaluation
  const submitExamAttempt = (
    examId: number,
    studentAnswers: Record<number, { selectedOptionId?: number; isMarkedForReview: boolean }>,
    timeTaken: number
  ): number => {
    const exam = examinations.find((e) => e.id === examId);
    if (!exam) return 0;

    const effectiveUserId = currentUserId || 9999;
    const examQuestions = questions.filter((q) => q.examinationId === examId);
    let totalScore = 0;
    const evaluatedAnswers: Record<number, { selectedOptionId?: number; isCorrect?: boolean; marksAwarded: number; isMarkedForReview: boolean }> = {};

    examQuestions.forEach((q) => {
      const studentAns = studentAnswers[q.id];
      const correctOption = q.options.find((opt) => opt.isCorrect);

      if (studentAns && studentAns.selectedOptionId) {
        const isRight = studentAns.selectedOptionId === correctOption?.id;
        const awarded = isRight ? q.marks : -q.negativeMarks;
        totalScore += awarded;
        evaluatedAnswers[q.id] = {
          selectedOptionId: studentAns.selectedOptionId,
          isCorrect: isRight,
          marksAwarded: awarded,
          isMarkedForReview: studentAns.isMarkedForReview,
        };
      } else {
        evaluatedAnswers[q.id] = {
          isCorrect: false,
          marksAwarded: 0,
          isMarkedForReview: studentAns?.isMarkedForReview || false,
        };
      }
    });

    const netScore = Math.max(0, totalScore);
    const percentage = (netScore / exam.totalMarks) * 100;
    const isPassed = netScore >= exam.passingMarks;

    const newAttempt: ExamAttempt = {
      id: Date.now(),
      userId: effectiveUserId,
      examinationId: examId,
      startedAt: new Date(Date.now() - timeTaken * 1000).toISOString().replace('T', ' ').substring(0, 19),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      score: Number(netScore.toFixed(2)),
      totalMarks: exam.totalMarks,
      percentage: Number(percentage.toFixed(1)),
      resultStatus: isPassed ? 'passed' : 'failed',
      timeTakenSeconds: timeTaken,
      answers: evaluatedAnswers,
    };

    setAttempts((prev) => [newAttempt, ...prev]);
    return newAttempt.id;
  };

  // Materials
  const addMaterial = (m: Omit<StudyMaterial, 'id' | 'createdAt' | 'downloadCount' | 'uploadedBy'>) => {
    const newMaterial: StudyMaterial = {
      ...m,
      id: Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      downloadCount: 0,
      uploadedBy: currentUserId || 1,
    };
    setMaterials((prev) => [newMaterial, ...prev]);
  };

  const deleteMaterial = (id: number) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const incrementDownload = (id: number) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, downloadCount: m.downloadCount + 1 } : m)));
  };

  // Users Admin Management
  const toggleUserStatus = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          accountStatus: u.accountStatus === 'active' ? 'inactive' : 'active',
        };
      })
    );
  };

  const deleteUser = (userId: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const resetToSampleData = () => {
    setUsers(INITIAL_USERS);
    setProfiles(INITIAL_PROFILES);
    setSubjects(INITIAL_SUBJECTS);
    setTasks(INITIAL_TASKS);
    setExaminations(INITIAL_EXAMINATIONS);
    setQuestions(INITIAL_QUESTIONS);
    setMaterials(INITIAL_MATERIALS);
    setAttempts(INITIAL_ATTEMPTS);
    setCurrentUserId(2);
    setCurrentView('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentProfile,
        isAdmin,
        users,
        profiles,
        subjects,
        tasks,
        examinations,
        questions,
        materials,
        attempts,
        activeExamId,
        viewingResultAttemptId,
        currentView,
        theme,
        toggleTheme,
        setCurrentView,
        setActiveExamId,
        setViewingResultAttemptId,
        login,
        logout,
        switchUser,
        signup,
        updateProfile,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        addSubject,
        updateSubject,
        deleteSubject,
        addExam,
        updateExam,
        deleteExam,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        generateCustomExam,
        submitExamAttempt,
        addMaterial,
        deleteMaterial,
        incrementDownload,
        toggleUserStatus,
        deleteUser,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
