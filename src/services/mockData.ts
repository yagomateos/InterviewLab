import type {
  Question,
  Category,
  Interview,
  Statistics,
  DashboardData,
  AsyncDemoResult,
  ExternalDashboardData,
  InterviewQuestion,
} from "@/types";

// ============================================================
// Mock data — mirrors the seed data in database/init.sql.
// Used as a fallback when the backend is not reachable (e.g. running
// the frontend standalone without Docker). When Docker is running,
// the real backend takes over automatically.
// ============================================================

const now = new Date().toISOString();

export const mockCategories: Category[] = [
  { id: 1, name: "JavaScript" },
  { id: 2, name: "TypeScript" },
  { id: 3, name: "React" },
  { id: 4, name: "Node.js" },
  { id: 5, name: "SQL" },
  { id: 6, name: "Docker" },
  { id: 7, name: "CSS" },
  { id: 8, name: "Algorithms" },
  { id: 9, name: "System Design" },
  { id: 10, name: "DevOps" },
  { id: 11, name: "Security" },
  { id: 12, name: "Testing" },
  { id: 13, name: "Web Performance" },
];

export const mockQuestions: Question[] = [
  { id: 1,  category_id: 1, category_name: "JavaScript",  title: "What is the Event Loop?",         description: "Explain how the Node.js event loop works and why JS is single-threaded.", difficulty: "medium", created_at: now },
  { id: 2,  category_id: 1, category_name: "JavaScript",  title: "Explain closures",                description: "What is a closure and how does it work in JavaScript?", difficulty: "easy", created_at: now },
  { id: 3,  category_id: 1, category_name: "JavaScript",  title: "What is a Promise?",              description: "Explain Promises and async/await in JavaScript.", difficulty: "easy", created_at: now },
  { id: 4,  category_id: 2, category_name: "TypeScript",  title: "keyof vs typeof",                 description: "Explain the difference between keyof and typeof in TypeScript.", difficulty: "medium", created_at: now },
  { id: 5,  category_id: 2, category_name: "TypeScript",  title: "What are generics?",              description: "Explain TypeScript generics and give an example.", difficulty: "medium", created_at: now },
  { id: 6,  category_id: 3, category_name: "React",       title: "What is useMemo?",                description: "Explain when to use useMemo in React.", difficulty: "easy", created_at: now },
  { id: 7,  category_id: 3, category_name: "React",       title: "useCallback vs useMemo",          description: "What is the difference between useCallback and useMemo?", difficulty: "medium", created_at: now },
  { id: 8,  category_id: 3, category_name: "React",       title: "Explain React.memo",              description: "When should you use React.memo?", difficulty: "easy", created_at: now },
  { id: 9,  category_id: 4, category_name: "Node.js",     title: "What is libuv?",                  description: "Explain the role of libuv in Node.js.", difficulty: "hard", created_at: now },
  { id: 10, category_id: 4, category_name: "Node.js",     title: "Streams in Node.js",              description: "Explain readable and writable streams.", difficulty: "medium", created_at: now },
  { id: 11, category_id: 5, category_name: "SQL",         title: "INNER JOIN vs LEFT JOIN",         description: "Explain the difference between INNER and LEFT JOIN.", difficulty: "medium", created_at: now },
  { id: 12, category_id: 5, category_name: "SQL",         title: "WHERE vs HAVING",                 description: "When would you use HAVING instead of WHERE?", difficulty: "medium", created_at: now },
  { id: 13, category_id: 5, category_name: "SQL",         title: "What is a database index?",       description: "Explain how database indexes work and when to add them.", difficulty: "hard", created_at: now },
  { id: 14, category_id: 6, category_name: "Docker",      title: "Docker vs VMs",                   description: "What are the advantages of Docker over virtual machines?", difficulty: "easy", created_at: now },
  { id: 15, category_id: 6, category_name: "Docker",      title: "docker exec explained",           description: "What does docker exec do and when would you use it?", difficulty: "easy", created_at: now },
  { id: 16, category_id: 7, category_name: "CSS",         title: "CSS specificity",                 description: "Explain CSS specificity rules.", difficulty: "medium", created_at: now },
  { id: 17, category_id: 7, category_name: "CSS",         title: "Flexbox vs Grid",                 description: "When would you choose Flexbox over CSS Grid?", difficulty: "easy", created_at: now },
  { id: 18, category_id: 8, category_name: "Algorithms",  title: "Reverse a linked list",           description: "Write a function to reverse a singly linked list.", difficulty: "hard", created_at: now },
  { id: 19, category_id: 8, category_name: "Algorithms",  title: "Big-O of binary search",          description: "What is the time complexity of binary search?", difficulty: "medium", created_at: now },
  { id: 20, category_id: 8, category_name: "Algorithms",  title: "Implement a stack with arrays",   description: "How would you implement a stack using arrays?", difficulty: "easy", created_at: now },
  // ===== Senior Fullstack: JavaScript (advanced) =====
  { id: 21, category_id: 1, category_name: "JavaScript",  title: "Explain the microtask vs macrotask queue",      description: "What is the difference between microtasks and macrotasks in the Event Loop? Give examples of each.", difficulty: "hard", created_at: now },
  { id: 22, category_id: 1, category_name: "JavaScript",  title: "What is the Proxy object?",                     description: "How do Proxies work in JavaScript and what are real-world use cases (e.g. Vue 3 reactivity, validation)?", difficulty: "hard", created_at: now },
  { id: 23, category_id: 1, category_name: "JavaScript",  title: "Memory leaks in JavaScript",                    description: "What are common causes of memory leaks in a web application and how do you detect them?", difficulty: "hard", created_at: now },
  { id: 24, category_id: 1, category_name: "JavaScript",  title: "Generator functions and iterators",             description: "Explain generator functions (function*) and how they relate to iterators and async iterators.", difficulty: "medium", created_at: now },
  { id: 25, category_id: 1, category_name: "JavaScript",  title: "Event delegation and bubbling",                 description: "Explain event delegation, event bubbling, and event capturing in the DOM.", difficulty: "medium", created_at: now },
  // ===== Senior Fullstack: TypeScript (advanced) =====
  { id: 26, category_id: 2, category_name: "TypeScript",  title: "Conditional types",                             description: "Explain conditional types in TypeScript (T extends U ? X : Y) and give a real use case.", difficulty: "hard", created_at: now },
  { id: 27, category_id: 2, category_name: "TypeScript",  title: "Mapped types",                                  description: "What are mapped types? Show how to create a Readonly<T> or Partial<T> from scratch.", difficulty: "hard", created_at: now },
  { id: 28, category_id: 2, category_name: "TypeScript",  title: "infer keyword",                                 description: "How does the infer keyword work in conditional types? Show an example extracting return types.", difficulty: "hard", created_at: now },
  { id: 29, category_id: 2, category_name: "TypeScript",  title: "Structural typing vs nominal typing",           description: "Explain the difference between structural and nominal typing. Which does TypeScript use and why?", difficulty: "medium", created_at: now },
  // ===== Senior Fullstack: React (advanced) =====
  { id: 30, category_id: 3, category_name: "React",       title: "useReducer vs useState",                        description: "When should you use useReducer instead of useState? What are the trade-offs?", difficulty: "medium", created_at: now },
  { id: 31, category_id: 3, category_name: "React",       title: "Render props vs custom hooks",                  description: "Compare the render props pattern with custom hooks. Which is preferred in modern React and why?", difficulty: "medium", created_at: now },
  { id: 32, category_id: 3, category_name: "React",       title: "Concurrent React and useTransition",            description: "Explain React 18 concurrent features: useTransition, useDeferredValue, and automatic batching.", difficulty: "hard", created_at: now },
  { id: 33, category_id: 3, category_name: "React",       title: "Virtual DOM reconciliation",                    description: "How does React reconciliation work? What is the role of keys in lists?", difficulty: "hard", created_at: now },
  { id: 34, category_id: 3, category_name: "React",       title: "Error boundaries",                              description: "What are error boundaries and how do you implement one in React?", difficulty: "medium", created_at: now },
  { id: 35, category_id: 3, category_name: "React",       title: "Server Components vs Client Components",        description: "Explain the difference between Server Components and Client Components in React 18+.", difficulty: "hard", created_at: now },
  // ===== Senior Fullstack: Node.js (advanced) =====
  { id: 36, category_id: 4, category_name: "Node.js",     title: "Cluster mode vs worker threads",                description: "Compare the cluster module with worker_threads. When would you use each?", difficulty: "hard", created_at: now },
  { id: 37, category_id: 4, category_name: "Node.js",     title: "Memory management and V8 garbage collection",   description: "Explain V8 garbage collection (scavenge vs mark-sweep) and how to profile memory in Node.js.", difficulty: "hard", created_at: now },
  { id: 38, category_id: 4, category_name: "Node.js",     title: "Middleware pipeline pattern",                   description: "How does Express middleware work internally? Explain next() and the chain of responsibility.", difficulty: "medium", created_at: now },
  { id: 39, category_id: 4, category_name: "Node.js",     title: "Graceful shutdown in Node.js",                  description: "How do you implement graceful shutdown in a Node.js server? SIGTERM, draining connections.", difficulty: "medium", created_at: now },
  { id: 40, category_id: 4, category_name: "Node.js",     title: "Process.nextTick vs setImmediate",              description: "What is the difference between process.nextTick, setImmediate, and setTimeout?", difficulty: "hard", created_at: now },
  // ===== Senior Fullstack: SQL (advanced) =====
  { id: 41, category_id: 5, category_name: "SQL",         title: "EXPLAIN and query optimization",                description: "How do you use EXPLAIN ANALYZE to optimize a slow query? What do you look for?", difficulty: "hard", created_at: now },
  { id: 42, category_id: 5, category_name: "SQL",         title: "Transactions and isolation levels",             description: "Explain ACID, the four isolation levels, and phenomena like dirty reads and phantom reads.", difficulty: "hard", created_at: now },
  { id: 43, category_id: 5, category_name: "SQL",         title: "Database normalization (1NF, 2NF, 3NF)",        description: "Explain the first three normal forms with examples. When might you denormalize?", difficulty: "medium", created_at: now },
  { id: 44, category_id: 5, category_name: "SQL",         title: "Connection pooling",                            description: "What is a database connection pool and why is it important for performance?", difficulty: "medium", created_at: now },
  { id: 45, category_id: 5, category_name: "SQL",         title: "CTE vs subquery",                               description: "Compare Common Table Expressions (WITH) with subqueries. When is each preferable?", difficulty: "medium", created_at: now },
  // ===== Senior Fullstack: Docker (advanced) =====
  { id: 46, category_id: 6, category_name: "Docker",      title: "Multi-stage builds",                            description: "Explain Docker multi-stage builds and why they reduce image size.", difficulty: "medium", created_at: now },
  { id: 47, category_id: 6, category_name: "Docker",      title: "Docker networking modes",                       description: "Explain bridge, host, and overlay networks in Docker. When would you use each?", difficulty: "hard", created_at: now },
  { id: 48, category_id: 6, category_name: "Docker",      title: "Docker volumes vs bind mounts",                 description: "What is the difference between volumes and bind mounts? When would you use each?", difficulty: "medium", created_at: now },
  // ===== Senior Fullstack: CSS (advanced) =====
  { id: 49, category_id: 7, category_name: "CSS",         title: "Container queries",                             description: "What are CSS container queries and how do they differ from media queries?", difficulty: "medium", created_at: now },
  { id: 50, category_id: 7, category_name: "CSS",         title: "CSS containment and performance",               description: "Explain the contain property and how it improves rendering performance.", difficulty: "hard", created_at: now },
  // ===== Senior Fullstack: Algorithms (advanced) =====
  { id: 51, category_id: 8, category_name: "Algorithms",  title: "LRU Cache implementation",                      description: "Design and implement an LRU cache with O(1) get and put operations.", difficulty: "hard", created_at: now },
  { id: 52, category_id: 8, category_name: "Algorithms",  title: "Detect a cycle in a linked list",               description: "How do you detect a cycle in a linked list? Explain Floyd's tortoise and hare algorithm.", difficulty: "medium", created_at: now },
  // ===== Senior Fullstack: System Design =====
  { id: 53, category_id: 9, category_name: "System Design",  title: "Design a URL shortener",                        description: "Design a URL shortening service like bit.ly. Cover API, storage, scaling, and caching.", difficulty: "hard", created_at: now },
  { id: 54, category_id: 9, category_name: "System Design",  title: "Design a rate limiter",                         description: "How would you design a rate limiter? Compare token bucket, sliding window, and fixed window.", difficulty: "hard", created_at: now },
  { id: 55, category_id: 9, category_name: "System Design",  title: "Caching strategies (cache-aside, write-through)",description: "Compare cache-aside, write-through, and write-back caching. When would you use each?", difficulty: "hard", created_at: now },
  { id: 56, category_id: 9, category_name: "System Design",  title: "Horizontal vs vertical scaling",                description: "Explain the difference between horizontal and vertical scaling and when to choose each.", difficulty: "medium", created_at: now },
  { id: 57, category_id: 9, category_name: "System Design",  title: "CAP theorem",                                   description: "Explain the CAP theorem. What does eventual consistency mean?", difficulty: "hard", created_at: now },
  { id: 58, category_id: 9, category_name: "System Design",  title: "Design a real-time chat system",                description: "Design a real-time chat application. Cover WebSocket vs polling, message ordering, and scaling.", difficulty: "hard", created_at: now },
  // ===== Senior Fullstack: DevOps =====
  { id: 59, category_id: 10, category_name: "DevOps",     title: "CI/CD pipeline best practices",                 description: "What are best practices for a CI/CD pipeline? How do you handle rollbacks?", difficulty: "medium", created_at: now },
  { id: 60, category_id: 10, category_name: "DevOps",     title: "Blue-green vs canary deployments",              description: "Compare blue-green deployments with canary releases. What are the trade-offs?", difficulty: "medium", created_at: now },
  { id: 61, category_id: 10, category_name: "DevOps",     title: "Infrastructure as Code (Terraform)",            description: "What is Infrastructure as Code? Explain declarative vs imperative IaC.", difficulty: "medium", created_at: now },
  { id: 62, category_id: 10, category_name: "DevOps",     title: "Kubernetes basics (Pod, Service, Deployment)",  description: "Explain the core Kubernetes concepts: Pod, Service, Deployment, and Ingress.", difficulty: "hard", created_at: now },
  // ===== Senior Fullstack: Security =====
  { id: 63, category_id: 11, category_name: "Security",   title: "OWASP Top 10",                                  description: "Name and explain the most critical OWASP Top 10 vulnerabilities.", difficulty: "medium", created_at: now },
  { id: 64, category_id: 11, category_name: "Security",   title: "JWT vs session cookies",                        description: "Compare JWT-based authentication with session cookies. What are the trade-offs?", difficulty: "medium", created_at: now },
  { id: 65, category_id: 11, category_name: "Security",   title: "XSS prevention strategies",                     description: "How do you prevent XSS in a React application? What about dangerouslySetInnerHTML?", difficulty: "hard", created_at: now },
  { id: 66, category_id: 11, category_name: "Security",   title: "CSRF protection",                               description: "What is CSRF and how do you protect against it in a web application?", difficulty: "medium", created_at: now },
  // ===== Senior Fullstack: Testing =====
  { id: 67, category_id: 12, category_name: "Testing",    title: "Unit vs integration vs E2E tests",              description: "Explain the testing pyramid. When should you write unit, integration, and E2E tests?", difficulty: "medium", created_at: now },
  { id: 68, category_id: 12, category_name: "Testing",    title: "Mocking strategies in tests",                   description: "Compare stubs, mocks, and spies in unit testing. When would you use each?", difficulty: "medium", created_at: now },
  { id: 69, category_id: 12, category_name: "Testing",    title: "TDD vs BDD",                                    description: "What is the difference between Test-Driven Development and Behavior-Driven Development?", difficulty: "easy", created_at: now },
  { id: 70, category_id: 12, category_name: "Testing",    title: "Testing async code",                            description: "How do you test async code that uses Promises, timers, and external APIs?", difficulty: "hard", created_at: now },
  // ===== Senior Fullstack: Web Performance =====
  { id: 71, category_id: 13, category_name: "Web Performance", title: "Core Web Vitals",                           description: "What are Core Web Vitals (LCP, FID/INP, CLS)? How do you measure and improve them?", difficulty: "medium", created_at: now },
  { id: 72, category_id: 13, category_name: "Web Performance", title: "Code splitting and lazy loading",           description: "Explain code splitting, dynamic imports, and React.lazy. How do they improve performance?", difficulty: "medium", created_at: now },
  { id: 73, category_id: 13, category_name: "Web Performance", title: "Critical rendering path",                   description: "Explain the critical rendering path and how to optimize first contentful paint.", difficulty: "hard", created_at: now },
  { id: 74, category_id: 13, category_name: "Web Performance", title: "Tree shaking and bundle analysis",          description: "What is tree shaking? How do you analyze and reduce your JavaScript bundle size?", difficulty: "medium", created_at: now },
];

// Interview questions with answers
const iq1: InterviewQuestion[] = [
  { id: 1,  interview_id: 1, question_id: 1,  order: 1, title: "What is the Event Loop?",      category_name: "JavaScript", difficulty: "medium", is_correct: true },
  { id: 2,  interview_id: 1, question_id: 3,  order: 2, title: "What is a Promise?",           category_name: "JavaScript", difficulty: "easy",   is_correct: true },
  { id: 3,  interview_id: 1, question_id: 5,  order: 3, title: "What are generics?",           category_name: "TypeScript", difficulty: "medium", is_correct: true },
  { id: 4,  interview_id: 1, question_id: 6,  order: 4, title: "What is useMemo?",             category_name: "React",      difficulty: "easy",   is_correct: true },
  { id: 5,  interview_id: 1, question_id: 7,  order: 5, title: "useCallback vs useMemo",       category_name: "React",      difficulty: "medium", is_correct: false },
  { id: 6,  interview_id: 1, question_id: 8,  order: 6, title: "Explain React.memo",           category_name: "React",      difficulty: "easy",   is_correct: false },
];
const iq2: InterviewQuestion[] = [
  { id: 7,  interview_id: 2, question_id: 1,  order: 1, title: "What is the Event Loop?",      category_name: "JavaScript", difficulty: "medium", is_correct: null },
  { id: 8,  interview_id: 2, question_id: 4,  order: 2, title: "keyof vs typeof",              category_name: "TypeScript", difficulty: "medium", is_correct: null },
  { id: 9,  interview_id: 2, question_id: 9,  order: 3, title: "What is libuv?",               category_name: "Node.js",    difficulty: "hard",   is_correct: null },
  { id: 10, interview_id: 2, question_id: 10, order: 4, title: "Streams in Node.js",           category_name: "Node.js",    difficulty: "medium", is_correct: null },
  { id: 11, interview_id: 2, question_id: 11, order: 5, title: "INNER JOIN vs LEFT JOIN",      category_name: "SQL",        difficulty: "medium", is_correct: null },
  { id: 12, interview_id: 2, question_id: 12, order: 6, title: "WHERE vs HAVING",              category_name: "SQL",        difficulty: "medium", is_correct: null },
];
const iq3: InterviewQuestion[] = [
  { id: 13, interview_id: 3, question_id: 9,  order: 1, title: "What is libuv?",               category_name: "Node.js",    difficulty: "hard",   is_correct: true },
  { id: 14, interview_id: 3, question_id: 10, order: 2, title: "Streams in Node.js",           category_name: "Node.js",    difficulty: "medium", is_correct: false },
  { id: 15, interview_id: 3, question_id: 11, order: 3, title: "INNER JOIN vs LEFT JOIN",      category_name: "SQL",        difficulty: "medium", is_correct: true },
  { id: 16, interview_id: 3, question_id: 12, order: 4, title: "WHERE vs HAVING",              category_name: "SQL",        difficulty: "medium", is_correct: true },
  { id: 17, interview_id: 3, question_id: 13, order: 5, title: "What is a database index?",    category_name: "SQL",        difficulty: "hard",   is_correct: false },
];

export const mockInterviews: Interview[] = [
  { id: 1, user_id: 1, user_name: "Alice Johnson", title: "Frontend Developer Interview", status: "completed",   created_at: now, question_count: 6, questions: iq1 },
  { id: 2, user_id: 1, user_name: "Alice Johnson", title: "Full-Stack Interview",          status: "in_progress", created_at: now, question_count: 6, questions: iq2 },
  { id: 3, user_id: 2, user_name: "Bob Smith",     title: "Backend Engineer Interview",    status: "completed",   created_at: now, question_count: 5, questions: iq3 },
  { id: 4, user_id: 1, user_name: "Alice Johnson", title: "DevOps Interview",              status: "scheduled",   created_at: now, question_count: 0, questions: [] },
];

export const mockStatistics: Statistics = {
  total_questions: 60,
  total_interviews: 4,
  total_answers: 11,
  correct_answers: 7,
  incorrect_answers: 4,
  success_rate: 64,
  by_category: [
    { category: "JavaScript",      question_count: 8,  correct_count: 2, incorrect_count: 0 },
    { category: "TypeScript",      question_count: 6,  correct_count: 1, incorrect_count: 0 },
    { category: "React",           question_count: 9,  correct_count: 2, incorrect_count: 2 },
    { category: "Node.js",         question_count: 7,  correct_count: 1, incorrect_count: 1 },
    { category: "SQL",             question_count: 8,  correct_count: 2, incorrect_count: 1 },
    { category: "Docker",          question_count: 5,  correct_count: 0, incorrect_count: 0 },
    { category: "CSS",             question_count: 4,  correct_count: 0, incorrect_count: 0 },
    { category: "Algorithms",      question_count: 5,  correct_count: 0, incorrect_count: 0 },
    { category: "System Design",   question_count: 6,  correct_count: 0, incorrect_count: 0 },
    { category: "DevOps",          question_count: 4,  correct_count: 0, incorrect_count: 0 },
    { category: "Security",        question_count: 4,  correct_count: 0, incorrect_count: 0 },
    { category: "Testing",         question_count: 4,  correct_count: 0, incorrect_count: 0 },
    { category: "Web Performance", question_count: 4,  correct_count: 0, incorrect_count: 0 },
  ],
  by_difficulty: [
    { difficulty: "easy",   question_count: 11, correct_count: 3, incorrect_count: 1 },
    { difficulty: "medium", question_count: 30, correct_count: 4, incorrect_count: 2 },
    { difficulty: "hard",   question_count: 19, correct_count: 1, incorrect_count: 1 },
  ],
  users_without_interviews: [
    { id: 3, name: "Carol Davis", email: "carol@example.com" },
  ],
};

export const mockDashboard: DashboardData = {
  stats: mockStatistics,
  recentQuestions: mockQuestions.slice(0, 5),
  categories: mockCategories,
  recentActivity: mockQuestions.slice(0, 10).map((q) => ({
    type: "question",
    description: `New question: ${q.title}`,
    created_at: q.created_at,
  })),
};

export const mockAsyncDemo: AsyncDemoResult = {
  totalElapsedMs: 203,
  operations: [
    { name: "cache-read",   delay: 10,  result: "Completed after 10ms",  elapsedMs: 14 },
    { name: "fast-query",   delay: 50,  result: "Completed after 50ms",  elapsedMs: 53 },
    { name: "external-api", delay: 150, result: "Completed after 150ms", elapsedMs: 152 },
    { name: "slow-query",   delay: 200, result: "Completed after 200ms", elapsedMs: 203 },
  ],
  explanation:
    "All four operations ran concurrently. If they were sequential " +
    "the total time would be 410ms (50+200+10+150). With Promise.all " +
    "they overlap, so the total is ~200ms — the slowest operation.",
};

export const mockExternalDashboard: ExternalDashboardData = {
  services: [
    {
      name: "questions-service",
      status: "fulfilled",
      data: mockQuestions.slice(0, 5),
      error: null,
    },
    {
      name: "statistics-service",
      status: "fulfilled",
      data: mockStatistics,
      error: null,
    },
    {
      name: "recommendations-service",
      status: "fulfilled",
      data: ["Review Docker networking", "Practice Promise.all vs allSettled", "Study SQL JOINs"],
      error: null,
    },
    {
      name: "difficulty-service",
      status: "rejected",
      data: null,
      error: "Error: External difficulty service unavailable",
    },
  ],
};

// Mutable in-memory store for create/update/delete operations in mock mode
let nextQuestionId = 75;
let nextInterviewId = 5;

export const mockStore = {
  questions: [...mockQuestions],
  interviews: [...mockInterviews],
  categories: [...mockCategories],
  nextQuestionId: () => nextQuestionId++,
  nextInterviewId: () => nextInterviewId++,
};
