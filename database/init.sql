-- ============================================================
-- InterviewLab - Database Schema
-- ============================================================

-- Drop in reverse dependency order (safe to re-run)
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS interview_questions CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- users
-- ============================================================
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- categories — lookup table for question categories
-- ============================================================
CREATE TABLE categories (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================================
-- interviews — a technical interview session for a user
-- ============================================================
CREATE TABLE interviews (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'scheduled',  -- scheduled | in_progress | completed
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- questions — technical questions belonging to a category
-- ============================================================
CREATE TABLE questions (
    id           SERIAL PRIMARY KEY,
    category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title        VARCHAR(300) NOT NULL,
    description  TEXT,
    difficulty   VARCHAR(10) NOT NULL DEFAULT 'medium',  -- easy | medium | hard
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- interview_questions — many-to-many between interviews and questions
-- ============================================================
CREATE TABLE interview_questions (
    id            SERIAL PRIMARY KEY,
    interview_id  INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_id   INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    "order"       INTEGER NOT NULL DEFAULT 0,
    UNIQUE(interview_id, question_id)
);

-- ============================================================
-- answers — the answer to a question within an interview
-- ============================================================
CREATE TABLE answers (
    id                     SERIAL PRIMARY KEY,
    interview_question_id  INTEGER NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    is_correct             BOOLEAN NOT NULL DEFAULT false,
    notes                  TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_interviews_user_id       ON interviews(user_id);
CREATE INDEX idx_questions_category_id    ON questions(category_id);
CREATE INDEX idx_questions_difficulty     ON questions(difficulty);
CREATE INDEX idx_interview_questions_int  ON interview_questions(interview_id);
CREATE INDEX idx_interview_questions_q    ON interview_questions(question_id);
CREATE INDEX idx_answers_iq_id            ON answers(interview_question_id);

-- ============================================================
-- Seed data
-- ============================================================
INSERT INTO categories (name) VALUES
    ('JavaScript'),
    ('TypeScript'),
    ('React'),
    ('Node.js'),
    ('SQL'),
    ('Docker'),
    ('CSS'),
    ('Algorithms'),
    ('System Design'),
    ('DevOps'),
    ('Security'),
    ('Testing'),
    ('Web Performance');

INSERT INTO users (name, email) VALUES
    ('Alice Johnson',  'alice@example.com'),
    ('Bob Smith',      'bob@example.com'),
    ('Carol Davis',    'carol@example.com');

INSERT INTO interviews (user_id, title, status) VALUES
    (1, 'Frontend Developer Interview', 'completed'),
    (1, 'Full-Stack Interview',         'in_progress'),
    (2, 'Backend Engineer Interview',   'completed'),
    -- user 3 (Carol) has NO interviews — used to demonstrate LEFT JOIN
    (1, 'DevOps Interview',             'scheduled');

INSERT INTO questions (category_id, title, description, difficulty) VALUES
    (1, 'What is the Event Loop?',                     'Explain how the Node.js event loop works and why JS is single-threaded.', 'medium'),
    (1, 'Explain closures',                            'What is a closure and how does it work in JavaScript?', 'easy'),
    (1, 'What is a Promise?',                          'Explain Promises and async/await in JavaScript.', 'easy'),
    (2, 'keyof vs typeof',                             'Explain the difference between keyof and typeof in TypeScript.', 'medium'),
    (2, 'What are generics?',                          'Explain TypeScript generics and give an example.', 'medium'),
    (3, 'What is useMemo?',                            'Explain when to use useMemo in React.', 'easy'),
    (3, 'useCallback vs useMemo',                      'What is the difference between useCallback and useMemo?', 'medium'),
    (3, 'Explain React.memo',                          'When should you use React.memo?', 'easy'),
    (4, 'What is libuv?',                              'Explain the role of libuv in Node.js.', 'hard'),
    (4, 'Streams in Node.js',                          'Explain readable and writable streams.', 'medium'),
    (5, 'INNER JOIN vs LEFT JOIN',                     'Explain the difference between INNER and LEFT JOIN.', 'medium'),
    (5, 'WHERE vs HAVING',                             'When would you use HAVING instead of WHERE?', 'medium'),
    (5, 'What is a database index?',                   'Explain how database indexes work and when to add them.', 'hard'),
    (6, 'Docker vs VMs',                               'What are the advantages of Docker over virtual machines?', 'easy'),
    (6, 'docker exec explained',                       'What does docker exec do and when would you use it?', 'easy'),
    (7, 'CSS specificity',                             'Explain CSS specificity rules.', 'medium'),
    (7, 'Flexbox vs Grid',                             'When would you choose Flexbox over CSS Grid?', 'easy'),
    (8, 'Reverse a linked list',                       'Write a function to reverse a singly linked list.', 'hard'),
    (8, 'Big-O of binary search',                      'What is the time complexity of binary search?', 'medium'),
    (8, 'Implement a stack with arrays',               'How would you implement a stack using arrays?', 'easy'),
    -- ===== Senior Fullstack: JavaScript (advanced) =====
    (1, 'Explain the microtask vs macrotask queue',      'What is the difference between microtasks and macrotasks in the Event Loop? Give examples of each.', 'hard'),
    (1, 'What is the Proxy object?',                     'How do Proxies work in JavaScript and what are real-world use cases (e.g. Vue 3 reactivity, validation)?', 'hard'),
    (1, 'Memory leaks in JavaScript',                    'What are common causes of memory leaks in a web application and how do you detect them?', 'hard'),
    (1, 'Generator functions and iterators',             'Explain generator functions (function*) and how they relate to iterators and async iterators.', 'medium'),
    (1, 'Event delegation and bubbling',                 'Explain event delegation, event bubbling, and event capturing in the DOM.', 'medium'),
    -- ===== Senior Fullstack: TypeScript (advanced) =====
    (2, 'Conditional types',                             'Explain conditional types in TypeScript (T extends U ? X : Y) and give a real use case.', 'hard'),
    (2, 'Mapped types',                                  'What are mapped types? Show how to create a Readonly<T> or Partial<T> from scratch.', 'hard'),
    (2, 'infer keyword',                                 'How does the infer keyword work in conditional types? Show an example extracting return types.', 'hard'),
    (2, 'Structural typing vs nominal typing',           'Explain the difference between structural and nominal typing. Which does TypeScript use and why?', 'medium'),
    -- ===== Senior Fullstack: React (advanced) =====
    (3, 'useReducer vs useState',                        'When should you use useReducer instead of useState? What are the trade-offs?', 'medium'),
    (3, 'Render props vs custom hooks',                  'Compare the render props pattern with custom hooks. Which is preferred in modern React and why?', 'medium'),
    (3, 'Concurrent React and useTransition',            'Explain React 18 concurrent features: useTransition, useDeferredValue, and automatic batching.', 'hard'),
    (3, 'Virtual DOM reconciliation',                    'How does React reconciliation work? What is the role of keys in lists?', 'hard'),
    (3, 'Error boundaries',                              'What are error boundaries and how do you implement one in React?', 'medium'),
    (3, 'Server Components vs Client Components',        'Explain the difference between Server Components and Client Components in React 18+.', 'hard'),
    -- ===== Senior Fullstack: Node.js (advanced) =====
    (4, 'Cluster mode vs worker threads',                'Compare the cluster module with worker_threads. When would you use each?', 'hard'),
    (4, 'Memory management and V8 garbage collection',   'Explain V8 garbage collection (scavenge vs mark-sweep) and how to profile memory in Node.js.', 'hard'),
    (4, 'Middleware pipeline pattern',                   'How does Express middleware work internally? Explain next() and the chain of responsibility.', 'medium'),
    (4, 'Graceful shutdown in Node.js',                  'How do you implement graceful shutdown in a Node.js server? SIGTERM, draining connections.', 'medium'),
    (4, 'Process.nextTick vs setImmediate',              'What is the difference between process.nextTick, setImmediate, and setTimeout?', 'hard'),
    -- ===== Senior Fullstack: SQL (advanced) =====
    (5, 'EXPLAIN and query optimization',                'How do you use EXPLAIN ANALYZE to optimize a slow query? What do you look for?', 'hard'),
    (5, 'Transactions and isolation levels',             'Explain ACID, the four isolation levels, and phenomena like dirty reads and phantom reads.', 'hard'),
    (5, 'Database normalization (1NF, 2NF, 3NF)',        'Explain the first three normal forms with examples. When might you denormalize?', 'medium'),
    (5, 'Connection pooling',                            'What is a database connection pool and why is it important for performance?', 'medium'),
    (5, 'CTE vs subquery',                               'Compare Common Table Expressions (WITH) with subqueries. When is each preferable?', 'medium'),
    -- ===== Senior Fullstack: Docker (advanced) =====
    (6, 'Multi-stage builds',                            'Explain Docker multi-stage builds and why they reduce image size.', 'medium'),
    (6, 'Docker networking modes',                       'Explain bridge, host, and overlay networks in Docker. When would you use each?', 'hard'),
    (6, 'Docker volumes vs bind mounts',                 'What is the difference between volumes and bind mounts? When would you use each?', 'medium'),
    -- ===== Senior Fullstack: CSS (advanced) =====
    (7, 'Container queries',                             'What are CSS container queries and how do they differ from media queries?', 'medium'),
    (7, 'CSS containment and performance',               'Explain the contain property and how it improves rendering performance.', 'hard'),
    -- ===== Senior Fullstack: Algorithms (advanced) =====
    (8, 'LRU Cache implementation',                      'Design and implement an LRU cache with O(1) get and put operations.', 'hard'),
    (8, 'Detect a cycle in a linked list',               'How do you detect a cycle in a linked list? Explain Floyd\'s tortoise and hare algorithm.', 'medium'),
    -- ===== Senior Fullstack: System Design =====
    (9, 'Design a URL shortener',                        'Design a URL shortening service like bit.ly. Cover API, storage, scaling, and caching.', 'hard'),
    (9, 'Design a rate limiter',                         'How would you design a rate limiter? Compare token bucket, sliding window, and fixed window.', 'hard'),
    (9, 'Caching strategies (cache-aside, write-through)','Compare cache-aside, write-through, and write-back caching. When would you use each?', 'hard'),
    (9, 'Horizontal vs vertical scaling',                'Explain the difference between horizontal and vertical scaling and when to choose each.', 'medium'),
    (9, 'CAP theorem',                                   'Explain the CAP theorem. What does eventual consistency mean?', 'hard'),
    (9, 'Design a real-time chat system',                'Design a real-time chat application. Cover WebSocket vs polling, message ordering, and scaling.', 'hard'),
    -- ===== Senior Fullstack: DevOps =====
    (10, 'CI/CD pipeline best practices',                'What are best practices for a CI/CD pipeline? How do you handle rollbacks?', 'medium'),
    (10, 'Blue-green vs canary deployments',             'Compare blue-green deployments with canary releases. What are the trade-offs?', 'medium'),
    (10, 'Infrastructure as Code (Terraform)',           'What is Infrastructure as Code? Explain declarative vs imperative IaC.', 'medium'),
    (10, 'Kubernetes basics (Pod, Service, Deployment)', 'Explain the core Kubernetes concepts: Pod, Service, Deployment, and Ingress.', 'hard'),
    -- ===== Senior Fullstack: Security =====
    (11, 'OWASP Top 10',                                 'Name and explain the most critical OWASP Top 10 vulnerabilities.', 'medium'),
    (11, 'JWT vs session cookies',                       'Compare JWT-based authentication with session cookies. What are the trade-offs?', 'medium'),
    (11, 'XSS prevention strategies',                    'How do you prevent XSS in a React application? What about dangerouslySetInnerHTML?', 'hard'),
    (11, 'CSRF protection',                              'What is CSRF and how do you protect against it in a web application?', 'medium'),
    -- ===== Senior Fullstack: Testing =====
    (12, 'Unit vs integration vs E2E tests',             'Explain the testing pyramid. When should you write unit, integration, and E2E tests?', 'medium'),
    (12, 'Mocking strategies in tests',                  'Compare stubs, mocks, and spies in unit testing. When would you use each?', 'medium'),
    (12, 'TDD vs BDD',                                   'What is the difference between Test-Driven Development and Behavior-Driven Development?', 'easy'),
    (12, 'Testing async code',                           'How do you test async code that uses Promises, timers, and external APIs?', 'hard'),
    -- ===== Senior Fullstack: Web Performance =====
    (13, 'Core Web Vitals',                              'What are Core Web Vitals (LCP, FID/INP, CLS)? How do you measure and improve them?', 'medium'),
    (13, 'Code splitting and lazy loading',              'Explain code splitting, dynamic imports, and React.lazy. How do they improve performance?', 'medium'),
    (13, 'Critical rendering path',                      'Explain the critical rendering path and how to optimize first contentful paint.', 'hard'),
    (13, 'Tree shaking and bundle analysis',             'What is tree shaking? How do you analyze and reduce your JavaScript bundle size?', 'medium');

-- Link questions to interviews (interview_questions)
-- Interview 1: Frontend (questions 1,3,5,6,7,8)
INSERT INTO interview_questions (interview_id, question_id, "order") VALUES
    (1, 1, 1), (1, 3, 2), (1, 5, 3), (1, 6, 4), (1, 7, 5), (1, 8, 6),
    -- Interview 2: Full-Stack (questions 1,4,9,10,11,12)
    (2, 1, 1), (2, 4, 2), (2, 9, 3), (2, 10, 4), (2, 11, 5), (2, 12, 6),
    -- Interview 3: Backend (questions 9,10,11,12,13)
    (3, 9, 1), (3, 10, 2), (3, 11, 3), (3, 12, 4), (3, 13, 5);

-- Answers for completed interviews (1 and 3)
-- Interview 1: 4 correct, 2 incorrect
INSERT INTO answers (interview_question_id, is_correct, notes) VALUES
    (1,  true,  'Good explanation of event loop phases'),
    (2,  true,  'Correctly explained async/await'),
    (3,  true,  'Solid generics example'),
    (4,  true,  'Clear explanation of useMemo'),
    (5,  false, 'Confused useCallback with useMemo'),
    (6,  false, 'Could not explain when to use React.memo'),
    -- Interview 3: 3 correct, 2 incorrect
    (13, true,  'Explained libuv thread pool'),
    (14, false, 'Missed backpressure concept'),
    (15, true,  'Good INNER vs LEFT JOIN explanation'),
    (16, true,  'Correct on WHERE vs HAVING'),
    (17, false, 'Vague on B-tree indexes');
