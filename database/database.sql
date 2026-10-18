-- ==========================================================
-- BCA Student Study Planner & Online Examination System
-- Database Schema & Initial Data Seed
-- Target Engine: MySQL 5.7+ / MariaDB 10.3+ / MySQL 8.0+
-- Database Name: bca_study_planner
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `bca_study_planner` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `bca_study_planner`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. Table structure for table `users`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  `account_status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Table structure for table `student_profiles`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `student_profiles`;
CREATE TABLE `student_profiles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `mobile` VARCHAR(20) DEFAULT NULL,
  `college_name` VARCHAR(200) NOT NULL,
  `university_name` VARCHAR(200) NOT NULL,
  `course_name` VARCHAR(100) NOT NULL DEFAULT 'Bachelor of Computer Applications (BCA)',
  `bca_year` ENUM('First Year', 'Second Year', 'Third Year') NOT NULL DEFAULT 'First Year',
  `semester` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `roll_number` VARCHAR(50) DEFAULT NULL,
  `profile_picture` VARCHAR(255) DEFAULT NULL,
  `preferred_study_time` ENUM('Early Morning (5 AM - 8 AM)', 'Morning (8 AM - 12 PM)', 'Afternoon (12 PM - 5 PM)', 'Evening (5 PM - 9 PM)', 'Late Night (9 PM - 1 AM)') DEFAULT 'Evening (5 PM - 9 PM)',
  `daily_study_hours` DECIMAL(3,1) NOT NULL DEFAULT 3.0,
  `preferred_session_duration` INT UNSIGNED NOT NULL DEFAULT 45 COMMENT 'in minutes',
  `target_exam_date` DATE DEFAULT NULL,
  `academic_goals` TEXT DEFAULT NULL,
  `difficult_subjects` TEXT DEFAULT NULL,
  `profile_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Table structure for table `subjects`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `subjects`;
CREATE TABLE `subjects` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `subject_name` VARCHAR(150) NOT NULL,
  `subject_code` VARCHAR(30) NOT NULL UNIQUE,
  `bca_year` ENUM('First Year', 'Second Year', 'Third Year') NOT NULL,
  `semester` TINYINT UNSIGNED NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_sub_year_sem` (`bca_year`, `semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Table structure for table `study_tasks`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `study_tasks`;
CREATE TABLE `study_tasks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `subject_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `topic` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `study_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `priority` ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
  `status` ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
  `completed_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tasks_user_date` (`user_id`, `study_date`),
  CONSTRAINT `fk_tasks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tasks_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. Table structure for table `examinations`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `examinations`;
CREATE TABLE `examinations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `subject_id` INT UNSIGNED NOT NULL,
  `bca_year` ENUM('First Year', 'Second Year', 'Third Year') NOT NULL,
  `semester` TINYINT UNSIGNED NOT NULL,
  `description` TEXT DEFAULT NULL,
  `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 30,
  `total_marks` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  `passing_marks` DECIMAL(5,2) NOT NULL DEFAULT 8.00,
  `negative_marking` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  `exam_category` ENUM('Practice Test', 'Unit Exam', 'Semester Mock', 'Final Assessment') NOT NULL DEFAULT 'Practice Test',
  `start_at` DATETIME DEFAULT NULL,
  `end_at` DATETIME DEFAULT NULL,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_exam_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. Table structure for table `questions`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `examination_id` INT UNSIGNED NOT NULL,
  `question_text` TEXT NOT NULL,
  `question_type` ENUM('mcq_single', 'mcq_multiple', 'true_false') NOT NULL DEFAULT 'mcq_single',
  `marks` DECIMAL(4,2) NOT NULL DEFAULT 2.00,
  `negative_marks` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  `explanation` TEXT DEFAULT NULL,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_question_exam` FOREIGN KEY (`examination_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 7. Table structure for table `question_options`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `question_options`;
CREATE TABLE `question_options` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `question_id` INT UNSIGNED NOT NULL,
  `option_letter` CHAR(1) NOT NULL COMMENT 'A, B, C, D',
  `option_text` TEXT NOT NULL,
  `is_correct` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_option_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 8. Table structure for table `exam_attempts`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `exam_attempts`;
CREATE TABLE `exam_attempts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `examination_id` INT UNSIGNED NOT NULL,
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` DATETIME DEFAULT NULL,
  `score` DECIMAL(5,2) DEFAULT NULL,
  `total_marks` DECIMAL(5,2) NOT NULL,
  `percentage` DECIMAL(5,2) DEFAULT NULL,
  `result_status` ENUM('passed', 'failed', 'pending') NOT NULL DEFAULT 'pending',
  `attempt_status` ENUM('in_progress', 'completed', 'timed_out', 'abandoned') NOT NULL DEFAULT 'in_progress',
  `time_taken_seconds` INT UNSIGNED DEFAULT NULL,
  CONSTRAINT `fk_attempt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attempt_exam` FOREIGN KEY (`examination_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 9. Table structure for table `student_answers`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `student_answers`;
CREATE TABLE `student_answers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `attempt_id` INT UNSIGNED NOT NULL,
  `question_id` INT UNSIGNED NOT NULL,
  `selected_option_id` INT UNSIGNED DEFAULT NULL,
  `is_correct` TINYINT(1) DEFAULT NULL,
  `marks_awarded` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  `is_marked_for_review` TINYINT(1) NOT NULL DEFAULT 0,
  `answered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_attempt_question` (`attempt_id`, `question_id`),
  CONSTRAINT `fk_answer_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_answer_option` FOREIGN KEY (`selected_option_id`) REFERENCES `question_options` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 10. Table structure for table `study_materials`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `study_materials`;
CREATE TABLE `study_materials` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `subject_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL DEFAULT 'application/pdf',
  `file_size_kb` INT UNSIGNED NOT NULL DEFAULT 0,
  `category` ENUM('Lecture Notes', 'Syllabus', 'Previous Year Questions', 'Lab Manual', 'Cheat Sheet') NOT NULL DEFAULT 'Lecture Notes',
  `uploaded_by` INT UNSIGNED NOT NULL,
  `download_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_material_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_material_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 11. Table structure for table `password_reset_tokens`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_token_hash` (`token_hash`),
  CONSTRAINT `fk_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- SEED DATA (Demo BCA Subjects, Admin & Student accounts, Exams, Questions)
-- Note: Passwords use standard bcrypt hash.
-- Default Password for both Admin and Student demo is: "Password@123"
-- Generated via password_hash('Password@123', PASSWORD_BCRYPT)
-- ==========================================================

-- Admin user (email: admin@bca-planner.edu, pass: Password@123)
-- Student user (email: student@bca-planner.edu, pass: Password@123)
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `account_status`, `created_at`) VALUES
(1, 'System Administrator', 'admin@bca-planner.edu', '$2y$10$w09ZlD3Gg9K/4lK1Z3y74uU8R3FwYnJmS89Lp78v4c5rZ8QvX1G2S', 'admin', 'active', NOW()),
(2, 'Aarav Sharma', 'student@bca-planner.edu', '$2y$10$w09ZlD3Gg9K/4lK1Z3y74uU8R3FwYnJmS89Lp78v4c5rZ8QvX1G2S', 'student', 'active', NOW());

-- Student Profile for Aarav Sharma
INSERT INTO `student_profiles` (`user_id`, `mobile`, `college_name`, `university_name`, `course_name`, `bca_year`, `semester`, `roll_number`, `preferred_study_time`, `daily_study_hours`, `preferred_session_duration`, `target_exam_date`, `academic_goals`, `difficult_subjects`, `profile_completed`) VALUES
(2, '+91 9876543210', 'Apex Institute of Computer Studies', 'State Technological University', 'Bachelor of Computer Applications (BCA)', 'Second Year', 3, 'BCA2024-042', 'Evening (5 PM - 9 PM)', 3.5, 50, DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY), 'Score above 85% in 3rd Semester and master Data Structures in C++.', 'Data Structures, Computer Architecture', 1);

-- Subjects for BCA Curriculum
INSERT INTO `subjects` (`id`, `subject_name`, `subject_code`, `bca_year`, `semester`, `description`) VALUES
(1, 'Programming in C & Logic Development', 'BCA-101', 'First Year', 1, 'Core fundamentals of C programming, pointers, structures, file handling, and algorithms.'),
(2, 'Computer Fundamentals & Office Automation', 'BCA-102', 'First Year', 1, 'Hardware basics, computer architecture, memory units, and productivity software.'),
(3, 'Discrete Mathematics', 'BCA-103', 'First Year', 1, 'Set theory, propositional logic, relations, functions, matrices, and graph theory.'),
(4, 'Data Structures using C & C++', 'BCA-201', 'First Year', 2, 'Arrays, stacks, queues, linked lists, trees, graphs, sorting, and searching algorithms.'),
(5, 'Object Oriented Programming with C++', 'BCA-202', 'First Year', 2, 'Classes, objects, inheritance, polymorphism, templates, and exception handling.'),
(6, 'Database Management Systems (DBMS)', 'BCA-301', 'Second Year', 3, 'ER modeling, relational algebra, SQL queries, normalization (1NF-BCNF), and transaction ACID properties.'),
(7, 'Computer Architecture & Organization', 'BCA-302', 'Second Year', 3, 'Instruction set architectures, CPU design, pipeline processing, cache memory hierarchy, and I/O interface.'),
(8, 'Web Technologies & HTML/CSS/JS', 'BCA-303', 'Second Year', 3, 'Client-side web development, semantic markup, responsive design, and dynamic DOM scripting.'),
(9, 'Java Programming', 'BCA-401', 'Second Year', 4, 'JVM internals, OOPs in Java, multithreading, collections framework, and JDBC database access.'),
(10, 'Operating Systems Concepts', 'BCA-402', 'Second Year', 4, 'Process scheduling, deadlocks, virtual memory management, file systems, and Linux shell commands.'),
(11, 'Software Engineering & Agile', 'BCA-501', 'Third Year', 5, 'Software life cycles (SDLC), Agile Scrum, SRS documentation, UML diagrams, and software testing.'),
(12, 'Computer Networks & Security', 'BCA-502', 'Third Year', 5, 'OSI 7-layer model, TCP/IP, IP addressing, routing protocols, cryptography, and network firewalls.'),
(13, 'Python & Machine Learning Foundations', 'BCA-601', 'Third Year', 6, 'Python scripting, NumPy, Pandas, supervised learning models, and model evaluation.');

-- Sample Study Tasks for Student (Aarav)
INSERT INTO `study_tasks` (`user_id`, `subject_id`, `title`, `topic`, `description`, `study_date`, `start_time`, `end_time`, `priority`, `status`, `completed_at`) VALUES
(2, 6, 'SQL Joins & Subqueries Revision', 'Joins (INNER, LEFT, RIGHT, FULL)', 'Practice complex multi-table joins and nested correlated subqueries in MySQL.', CURRENT_DATE, '18:00:00', '19:30:00', 'High', 'Pending', NULL),
(2, 4, 'Binary Search Tree Implementations', 'Trees & BST Traversal', 'Write recursive algorithms for in-order, pre-order, and post-order traversal in C++.', CURRENT_DATE, '20:00:00', '21:00:00', 'Medium', 'In Progress', NULL),
(2, 8, 'JavaScript Event Delegation', 'DOM Events & Closures', 'Build a dynamic student grade calculator using event listener delegation.', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), '17:30:00', '19:00:00', 'High', 'Completed', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 7, 'Pipeline Hazards & Branch Prediction', 'Instruction Pipelining', 'Revise data hazards, structural hazards, and forward operand techniques.', DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), '18:30:00', '20:00:00', 'Medium', 'Pending', NULL);

-- Examinations
INSERT INTO `examinations` (`id`, `title`, `subject_id`, `bca_year`, `semester`, `description`, `duration_minutes`, `total_marks`, `passing_marks`, `negative_marking`, `exam_category`, `start_at`, `status`) VALUES
(1, 'DBMS Mid-Term Practice Assessment', 6, 'Second Year', 3, 'Comprehensive test evaluating SQL, Normalization, Relational Algebra, and Transaction management for BCA Semester 3.', 20, 20.00, 8.00, 0.50, 'Practice Test', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 DAY), 'published'),
(2, 'Data Structures Unit 1 & 2 Quiz', 4, 'First Year', 2, 'Arrays, Linked Lists, Stacks, Queues, and Time Complexity (Big O notation).', 15, 10.00, 4.00, 0.00, 'Unit Exam', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 DAY), 'published'),
(3, 'Web Technologies Interactive Exam', 8, 'Second Year', 3, 'HTML5 semantics, CSS Grid/Flexbox, JavaScript functions, DOM events, and Async/Await.', 25, 20.00, 10.00, 0.25, 'Semester Mock', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY), 'published');

-- Questions for DBMS Examination (id: 1)
INSERT INTO `questions` (`id`, `examination_id`, `question_text`, `question_type`, `marks`, `negative_marks`, `explanation`, `display_order`) VALUES
(1, 1, 'In relational database theory, which normal form (NF) specifically eliminates transitive functional dependencies on the primary key?', 'mcq_single', 2.00, 0.50, 'Third Normal Form (3NF) requires a relation to be in 2NF and have no transitive functional dependency of non-prime attributes on candidate keys.', 1),
(2, 1, 'Which ACID property guarantees that all operations within a database transaction are completed successfully or none are applied?', 'mcq_single', 2.00, 0.50, 'Atomicity ensures all-or-nothing execution of transactions, rolling back upon failure.', 2),
(3, 1, 'What is the primary role of a FOREIGN KEY constraint in a relational database management system?', 'mcq_single', 2.00, 0.50, 'A foreign key enforces referential integrity by ensuring the value corresponds to a valid existing primary/unique key in the referenced table.', 3),
(4, 1, 'Which SQL clause is used to filter records resulting from aggregate functions (such as COUNT, AVG, SUM)?', 'mcq_single', 2.00, 0.50, 'The HAVING clause is evaluated after GROUP BY to filter groups based on aggregate conditions, whereas WHERE filters individual rows before aggregation.', 4),
(5, 1, 'In an Entity-Relationship (ER) diagram, what geometric shape is conventionally used to represent a weak entity set?', 'mcq_single', 2.00, 0.50, 'Weak entities (entities that do not have sufficient attributes to form a primary key on their own) are depicted using double rectangles.', 5);

-- Options for Question 1
INSERT INTO `question_options` (`question_id`, `option_letter`, `option_text`, `is_correct`) VALUES
(1, 'A', 'First Normal Form (1NF)', 0),
(1, 'B', 'Second Normal Form (2NF)', 0),
(1, 'C', 'Third Normal Form (3NF)', 1),
(1, 'D', 'Boyce-Codd Normal Form (BCNF)', 0);

-- Options for Question 2
INSERT INTO `question_options` (`question_id`, `option_letter`, `option_text`, `is_correct`) VALUES
(2, 'A', 'Atomicity', 1),
(2, 'B', 'Consistency', 0),
(2, 'C', 'Isolation', 0),
(2, 'D', 'Durability', 0);

-- Options for Question 3
INSERT INTO `question_options` (`question_id`, `option_letter`, `option_text`, `is_correct`) VALUES
(3, 'A', 'Accelerates index traversal only', 0),
(3, 'B', 'Enforces referential integrity between two related tables', 1),
(3, 'C', 'Prevents NULL values across all fields', 0),
(3, 'D', 'Automatically calculates row size', 0);

-- Options for Question 4
INSERT INTO `question_options` (`question_id`, `option_letter`, `option_text`, `is_correct`) VALUES
(4, 'A', 'WHERE', 0),
(4, 'B', 'GROUP BY', 0),
(4, 'C', 'HAVING', 1),
(4, 'D', 'ORDER BY', 0);

-- Options for Question 5
INSERT INTO `question_options` (`question_id`, `option_letter`, `option_text`, `is_correct`) VALUES
(5, 'A', 'Single Diamond', 0),
(5, 'B', 'Double Rectangle', 1),
(5, 'C', 'Dashed Ellipse', 0),
(5, 'D', 'Double Oval', 0);

-- Sample Study Materials
INSERT INTO `study_materials` (`id`, `subject_id`, `title`, `description`, `file_path`, `file_type`, `file_size_kb`, `category`, `uploaded_by`, `download_count`) VALUES
(1, 6, 'DBMS Complete Handwritten Lecture Notes (Units 1-5)', 'Complete comprehensive notes covering Relational Algebra, ER Models, Normalization proofs, and SQL Query examples.', 'materials/dbms_complete_notes_bca.pdf', 'application/pdf', 3420, 'Lecture Notes', 1, 142),
(2, 6, 'University Previous 5-Year Solved Question Papers', 'Solved papers from 2020-2025 with step-by-step SQL queries, schema decompositions, and BCNF conversion problems.', 'materials/dbms_solved_papers_2020_2025.pdf', 'application/pdf', 1850, 'Previous Year Questions', 1, 230),
(3, 4, 'Data Structures & Algorithms Practical Lab Manual', 'C++ code examples for Stacks, Queues, Doubly Linked Lists, AVL Trees, and Graph BFS/DFS.', 'materials/dsa_cpp_lab_manual.pdf', 'application/pdf', 2140, 'Lab Manual', 1, 98),
(4, 8, 'Full-Stack Web Development Cheat Sheet & Roadmap', 'Quick reference for HTML5 tags, CSS Flexbox/Grid syntax, modern JavaScript ES6+ cheat sheet, and Fetch API.', 'materials/web_tech_cheat_sheet.pdf', 'application/pdf', 840, 'Cheat Sheet', 1, 312);

-- Sample Exam Attempt for Student
INSERT INTO `exam_attempts` (`id`, `user_id`, `examination_id`, `started_at`, `submitted_at`, `score`, `total_marks`, `percentage`, `result_status`, `attempt_status`, `time_taken_seconds`) VALUES
(1, 2, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 12 MINUTE, 18.00, 20.00, 90.00, 'passed', 'completed', 720);

-- Sample Answer details for the attempt
INSERT INTO `student_answers` (`attempt_id`, `question_id`, `selected_option_id`, `is_correct`, `marks_awarded`, `is_marked_for_review`) VALUES
(1, 1, 3, 1, 2.00, 0),
(1, 2, 5, 1, 2.00, 0),
(1, 3, 10, 1, 2.00, 0),
(1, 4, 15, 1, 2.00, 0),
(1, 5, 18, 1, 2.00, 0);

-- ==========================================================
-- END OF DATABASE SCRIPT
-- ==========================================================
