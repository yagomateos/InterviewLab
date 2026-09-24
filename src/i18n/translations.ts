// ============================================================
// Translation dictionaries — English and Spanish.
// Only UI chrome (labels, headings, buttons, messages) is translated;
// data coming from the API/DB (question titles, category names, user
// names) is shown as stored, regardless of the selected language.
// ============================================================

export type Language = "en" | "es";

// Explicit shape shared by every language dictionary — plain `string` (not
// literal types) so the `en` and `es` objects, whose values legitimately
// differ, both satisfy it. Deriving this from `typeof translations.en`
// would infer literal string types from the English copy and reject the
// Spanish one.
export interface Translations {
  nav: {
    brand: string;
    dashboard: string;
    questions: string;
    interviews: string;
    statistics: string;
    simulation: string;
    async: string;
  };
  common: {
    loading: string;
    cancel: string;
    create: string;
    creating: string;
    add: string;
    remove: string;
    correct: string;
    incorrect: string;
    easy: string;
    medium: string;
    hard: string;
    noQuestionsFound: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    statQuestions: string;
    statInterviews: string;
    statCorrect: string;
    statSuccessRate: string;
    recentQuestions: string;
    categories: string;
    recentActivity: string;
    newQuestionPrefix: string;
  };
  questions: {
    title: string;
    subtitleTotal: (n: number) => string;
    newQuestion: string;
    createQuestion: string;
    formTitle: string;
    formCategory: string;
    formDifficulty: string;
    formDescription: string;
    titlePlaceholder: string;
    selectPlaceholder: string;
    searchPlaceholder: string;
    allCategories: string;
    allDifficulties: string;
    sortTitle: string;
    sortDifficulty: string;
    sortCategory: string;
    sortDate: string;
    asc: string;
    desc: string;
  };
  interviews: {
    title: string;
    subtitleCount: (n: number) => string;
    explainer: string;
    emptyState: string;
    newInterview: string;
    formTitle: string;
    formUser: string;
    titlePlaceholder: string;
    questionsCount: (n: number) => string;
    status: {
      scheduled: string;
      in_progress: string;
      completed: string;
    };
  };
  interviewDetail: {
    backToInterviews: string;
    addQuestion: string;
    addQuestionToInterview: string;
    selectQuestion: string;
    allAlreadyAdded: string;
    interviewNotFound: string;
  };
  statistics: {
    title: string;
    subtitle: string;
    totalQuestions: string;
    totalInterviews: string;
    correctAnswers: string;
    incorrectAnswers: string;
    successRate: string;
    usersWithoutInterviews: string;
    bestCategory: string;
    hardestDifficulty: string;
    correctSuffix: string;
    byCategory: string;
    byDifficulty: string;
    questionsLabel: string;
    correctLabel: string;
    incorrectLabel: string;
    answeredSuffix: string;
    sqlNoteCategory: string;
    sqlNoteUsers: string;
    usersWithoutInterviewsTitle: string;
    allUsersHaveInterviews: string;
  };
  simulation: {
    title: string;
    subtitle: string;
    configureTitle: string;
    categoryOptional: string;
    difficultyOptional: string;
    allCategories: string;
    allDifficulties: string;
    questionsIncluded: (n: number) => string;
    start: string;
    resultsTitle: string;
    successRate: string;
    total: string;
    correct: string;
    incorrect: string;
    newSimulation: string;
    questionOf: (i: number, n: number) => string;
    previous: string;
    next: string;
    finish: string;
    noMatch: string;
    back: string;
    correctWord: string;
    incorrectWord: string;
    savedTitle: (date: string) => string;
    saving: string;
    savedToInterviews: string;
    saveError: string;
    loginToSave: string;
  };
  asyncDemo: {
    title: string;
    subtitle: string;
    eventLoopTitle: string;
    // The backend always returns the exact same fixed English explanation
    // string (see systemService.ts) for this fixed demo scenario, so it's
    // translated locally instead of over the wire.
    explanationText: string;
    delayLabel: string;
    elapsedLabel: string;
    totalElapsedPrefix: string;
    totalElapsedMid: string;
    totalElapsedSuffix: string;
    allSettledTitle: string;
    allSettledDescPrefix: string;
    allSettledDescSuffix: string;
    items: string;
    allNote1: string;
    allNote2: string;
  };
  questionCard: {
    correct: string;
    incorrect: string;
    remove: string;
    correctAnswer: string;
    yourAnswer: string;
  };
  auth: {
    login: string;
    logout: string;
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    name: string;
    namePlaceholder: string;
    email: string;
    password: string;
    loginButton: string;
    registerButton: string;
    switchToRegister: string;
    switchToLogin: string;
    demoHint: string;
  };
  // Exact-text translations for error messages coming from the backend API
  // or the local mock fallback (both throw/return the same English phrases).
  // Keyed by the original English message; see translateError() below.
  errors: Record<string, string>;
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      brand: "InterviewLab",
      dashboard: "Dashboard",
      questions: "Questions",
      interviews: "Interviews",
      statistics: "Statistics",
      simulation: "Simulation",
      async: "Async",
    },
    common: {
      loading: "Loading...",
      cancel: "Cancel",
      create: "Create",
      creating: "Creating...",
      add: "Add",
      remove: "Remove",
      correct: "Correct",
      incorrect: "Incorrect",
      easy: "easy",
      medium: "medium",
      hard: "hard",
      noQuestionsFound: "No questions found.",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Overview of your interview preparation progress",
      statQuestions: "Questions",
      statInterviews: "Interviews",
      statCorrect: "Correct Answers",
      statSuccessRate: "Success Rate",
      recentQuestions: "Recent Questions",
      categories: "Categories",
      recentActivity: "Recent Activity",
      newQuestionPrefix: "New question:",
    },
    questions: {
      title: "Questions",
      subtitleTotal: (n: number) => `${n} total questions`,
      newQuestion: "New Question",
      createQuestion: "Create Question",
      formTitle: "Title",
      formCategory: "Category",
      formDifficulty: "Difficulty",
      formDescription: "Description (optional)",
      titlePlaceholder: "e.g. Explain the Event Loop",
      selectPlaceholder: "Select...",
      searchPlaceholder: "Search questions...",
      allCategories: "All Categories",
      allDifficulties: "All Difficulties",
      sortTitle: "Sort by Title",
      sortDifficulty: "Sort by Difficulty",
      sortCategory: "Sort by Category",
      sortDate: "Sort by Date",
      asc: "↑ Asc",
      desc: "↓ Desc",
    },
    interviews: {
      title: "Interviews",
      subtitleCount: (n: number) => `${n} interviews`,
      explainer: "Finished Simulation runs are saved here automatically, and you can also put together your own interview by hand.",
      emptyState: "You don't have any interviews yet. Run a Simulation to save your first one here, or create one manually below.",
      newInterview: "New Interview",
      formTitle: "Title",
      formUser: "User",
      titlePlaceholder: "e.g. Senior Frontend Interview",
      questionsCount: (n: number) => `${n} questions`,
      status: {
        scheduled: "scheduled",
        in_progress: "in progress",
        completed: "completed",
      },
    },
    interviewDetail: {
      backToInterviews: "Back to Interviews",
      addQuestion: "Add Question",
      addQuestionToInterview: "Add Question to Interview",
      selectQuestion: "Select a question...",
      allAlreadyAdded: "All questions are already in this interview.",
      interviewNotFound: "Interview not found",
    },
    statistics: {
      title: "Statistics",
      subtitle: "Real statistics from the PostgreSQL database (GROUP BY, HAVING, WHERE, JOINs)",
      totalQuestions: "Total Questions",
      totalInterviews: "Total Interviews",
      correctAnswers: "Correct Answers",
      incorrectAnswers: "Incorrect Answers",
      successRate: "Success Rate",
      usersWithoutInterviews: "Users w/o Interviews",
      bestCategory: "Best Category",
      hardestDifficulty: "Hardest Difficulty",
      correctSuffix: "% correct",
      byCategory: "By Category",
      byDifficulty: "By Difficulty",
      questionsLabel: "questions",
      correctLabel: "correct",
      incorrectLabel: "incorrect",
      answeredSuffix: "answered",
      sqlNoteCategory: "SQL: GROUP BY c.name HAVING COUNT(q.id) >= 1 — only categories with at least 1 question appear.",
      sqlNoteUsers: "SQL: LEFT JOIN interviews ON ... WHERE i.id IS NULL — only possible with LEFT JOIN, not INNER JOIN.",
      usersWithoutInterviewsTitle: "Users Without Interviews",
      allUsersHaveInterviews: "All users have at least one interview.",
    },
    simulation: {
      title: "Interview Simulation",
      subtitle: "Practice with a timed mock interview",
      configureTitle: "Configure your simulation",
      categoryOptional: "Category (optional)",
      difficultyOptional: "Difficulty (optional)",
      allCategories: "All Categories",
      allDifficulties: "All Difficulties",
      questionsIncluded: (n: number) => `${n} questions will be included in this simulation.`,
      start: "Start Simulation",
      resultsTitle: "Simulation Results",
      successRate: "Success Rate",
      total: "Total",
      correct: "Correct",
      incorrect: "Incorrect",
      newSimulation: "New Simulation",
      questionOf: (i: number, n: number) => `Question ${i} of ${n}`,
      previous: "Previous",
      next: "Next",
      finish: "Finish",
      noMatch: "No questions match your filters.",
      back: "Back",
      correctWord: "correct",
      incorrectWord: "incorrect",
      savedTitle: (date: string) => `Simulation — ${date}`,
      saving: "Saving results...",
      savedToInterviews: "Saved to your interviews",
      saveError: "Couldn't save this simulation",
      loginToSave: "Log in to save your results",
    },
    asyncDemo: {
      title: "Async & Promises Demo",
      subtitle: "Live demonstration of the Node.js Event Loop, Promise.all, and Promise.allSettled",
      eventLoopTitle: "Event Loop — Concurrent Async Operations",
      explanationText:
        "All four operations ran concurrently. If they were sequential " +
        "the total time would be 410ms (50+200+10+150). With Promise.all " +
        "they overlap, so the total is ~200ms — the slowest operation.",
      delayLabel: "delay",
      elapsedLabel: "elapsed",
      totalElapsedPrefix: "Total elapsed:",
      totalElapsedMid: "— if these were sequential it would be",
      totalElapsedSuffix:
        "ms. The Event Loop processes async callbacks concurrently without blocking the main thread.",
      allSettledTitle: "Promise.allSettled — External Dashboard",
      allSettledDescPrefix: "Four simulated services are called. One fails intentionally (difficulty-service). With",
      allSettledDescSuffix: ", the endpoint returns all results — including the failure — instead of rejecting entirely.",
      items: "items",
      allNote1: "would have rejected the entire call when the difficulty-service failed — losing the data from the other three services.",
      allNote2: "waits for all promises and reports each one's outcome individually.",
    },
    questionCard: {
      correct: "Correct",
      incorrect: "Incorrect",
      remove: "Remove",
      correctAnswer: "Correct answer",
      yourAnswer: "Your answer",
    },
    auth: {
      login: "Log in",
      logout: "Log out",
      loginTitle: "Log in",
      loginSubtitle: "Log in to see and manage your interviews",
      registerTitle: "Create an account",
      registerSubtitle: "Sign up to start saving your own interviews",
      name: "Name",
      namePlaceholder: "e.g. Alex Rivera",
      email: "Email",
      password: "Password",
      loginButton: "Log in",
      registerButton: "Create account",
      switchToRegister: "Don't have an account? Sign up",
      switchToLogin: "Already have an account? Log in",
      demoHint: "Demo accounts: alice@example.com / bob@example.com / carol@example.com — password: demo1234",
    },
    errors: {
      "Question not found": "Question not found",
      "Interview not found": "Interview not found",
      "Interview or question not found": "Interview or question not found",
      "Question already in interview": "Question already in interview",
      "Question not in interview": "Question not in interview",
      "Invalid interview ID": "Invalid interview ID",
      "Invalid question ID": "Invalid question ID",
      "Association not found": "Association not found",
      "Interview question not found": "Interview question not found",
      "Title is required": "Title is required",
      "Category is required": "Category is required",
      "Question is not part of this interview": "Question is not part of this interview",
      "The requested resource was not found": "The requested resource was not found",
      "Request failed": "Request failed",
      "Error: External difficulty service unavailable": "Error: External difficulty service unavailable",
      "Authentication required": "Authentication required",
      "Name is required": "Name is required",
      "A valid email is required": "A valid email is required",
      "Password must be at least 8 characters": "Password must be at least 8 characters",
      "Email already registered": "Email already registered",
      "Invalid email or password": "Invalid email or password",
    },
  },
  es: {
    nav: {
      brand: "InterviewLab",
      dashboard: "Panel",
      questions: "Preguntas",
      interviews: "Entrevistas",
      statistics: "Estadísticas",
      simulation: "Simulación",
      async: "Async",
    },
    common: {
      loading: "Cargando...",
      cancel: "Cancelar",
      create: "Crear",
      creating: "Creando...",
      add: "Añadir",
      remove: "Eliminar",
      correct: "Correcta",
      incorrect: "Incorrecta",
      easy: "fácil",
      medium: "media",
      hard: "difícil",
      noQuestionsFound: "No se encontraron preguntas.",
    },
    dashboard: {
      title: "Panel",
      subtitle: "Resumen de tu progreso preparando entrevistas",
      statQuestions: "Preguntas",
      statInterviews: "Entrevistas",
      statCorrect: "Respuestas correctas",
      statSuccessRate: "Tasa de éxito",
      recentQuestions: "Preguntas recientes",
      categories: "Categorías",
      recentActivity: "Actividad reciente",
      newQuestionPrefix: "Nueva pregunta:",
    },
    questions: {
      title: "Preguntas",
      subtitleTotal: (n: number) => `${n} preguntas en total`,
      newQuestion: "Nueva pregunta",
      createQuestion: "Crear pregunta",
      formTitle: "Título",
      formCategory: "Categoría",
      formDifficulty: "Dificultad",
      formDescription: "Descripción (opcional)",
      titlePlaceholder: "p. ej. Explica el Event Loop",
      selectPlaceholder: "Selecciona...",
      searchPlaceholder: "Buscar preguntas...",
      allCategories: "Todas las categorías",
      allDifficulties: "Todas las dificultades",
      sortTitle: "Ordenar por título",
      sortDifficulty: "Ordenar por dificultad",
      sortCategory: "Ordenar por categoría",
      sortDate: "Ordenar por fecha",
      asc: "↑ Asc",
      desc: "↓ Desc",
    },
    interviews: {
      title: "Entrevistas",
      subtitleCount: (n: number) => `${n} entrevistas`,
      explainer: "Aquí se guardan automáticamente las simulaciones que completas, y también puedes montar tu propia entrevista a mano.",
      emptyState: "Todavía no tienes entrevistas. Haz una Simulación para guardar aquí la primera, o crea una manualmente debajo.",
      newInterview: "Nueva entrevista",
      formTitle: "Título",
      formUser: "Usuario",
      titlePlaceholder: "p. ej. Entrevista Frontend Senior",
      questionsCount: (n: number) => `${n} preguntas`,
      status: {
        scheduled: "programada",
        in_progress: "en curso",
        completed: "completada",
      },
    },
    interviewDetail: {
      backToInterviews: "Volver a Entrevistas",
      addQuestion: "Añadir pregunta",
      addQuestionToInterview: "Añadir pregunta a la entrevista",
      selectQuestion: "Selecciona una pregunta...",
      allAlreadyAdded: "Todas las preguntas ya están en esta entrevista.",
      interviewNotFound: "Entrevista no encontrada",
    },
    statistics: {
      title: "Estadísticas",
      subtitle: "Estadísticas reales de la base de datos PostgreSQL (GROUP BY, HAVING, WHERE, JOINs)",
      totalQuestions: "Preguntas totales",
      totalInterviews: "Entrevistas totales",
      correctAnswers: "Respuestas correctas",
      incorrectAnswers: "Respuestas incorrectas",
      successRate: "Tasa de éxito",
      usersWithoutInterviews: "Usuarios sin entrevistas",
      bestCategory: "Mejor categoría",
      hardestDifficulty: "Dificultad más difícil",
      correctSuffix: "% correctas",
      byCategory: "Por categoría",
      byDifficulty: "Por dificultad",
      questionsLabel: "preguntas",
      correctLabel: "correctas",
      incorrectLabel: "incorrectas",
      answeredSuffix: "respondidas",
      sqlNoteCategory: "SQL: GROUP BY c.name HAVING COUNT(q.id) >= 1 — solo aparecen categorías con al menos 1 pregunta.",
      sqlNoteUsers: "SQL: LEFT JOIN interviews ON ... WHERE i.id IS NULL — solo posible con LEFT JOIN, no con INNER JOIN.",
      usersWithoutInterviewsTitle: "Usuarios sin entrevistas",
      allUsersHaveInterviews: "Todos los usuarios tienen al menos una entrevista.",
    },
    simulation: {
      title: "Simulación de entrevista",
      subtitle: "Practica con una entrevista simulada cronometrada",
      configureTitle: "Configura tu simulación",
      categoryOptional: "Categoría (opcional)",
      difficultyOptional: "Dificultad (opcional)",
      allCategories: "Todas las categorías",
      allDifficulties: "Todas las dificultades",
      questionsIncluded: (n: number) => `Se incluirán ${n} preguntas en esta simulación.`,
      start: "Empezar simulación",
      resultsTitle: "Resultados de la simulación",
      successRate: "Tasa de éxito",
      total: "Total",
      correct: "Correctas",
      incorrect: "Incorrectas",
      newSimulation: "Nueva simulación",
      questionOf: (i: number, n: number) => `Pregunta ${i} de ${n}`,
      previous: "Anterior",
      next: "Siguiente",
      finish: "Finalizar",
      noMatch: "Ninguna pregunta coincide con tus filtros.",
      back: "Volver",
      correctWord: "correctas",
      incorrectWord: "incorrectas",
      savedTitle: (date: string) => `Simulación — ${date}`,
      saving: "Guardando resultados...",
      savedToInterviews: "Guardado en tus entrevistas",
      saveError: "No se pudo guardar esta simulación",
      loginToSave: "Inicia sesión para guardar tus resultados",
    },
    asyncDemo: {
      title: "Demo de Async y Promesas",
      subtitle: "Demostración en vivo del Event Loop de Node.js, Promise.all y Promise.allSettled",
      eventLoopTitle: "Event Loop — Operaciones asíncronas concurrentes",
      explanationText:
        "Las cuatro operaciones se ejecutaron de forma concurrente. Si fueran " +
        "secuenciales, el tiempo total sería 410ms (50+200+10+150). Con Promise.all " +
        "se solapan, así que el total es ~200ms — el de la operación más lenta.",
      delayLabel: "retardo",
      elapsedLabel: "transcurrido",
      totalElapsedPrefix: "Tiempo total transcurrido:",
      totalElapsedMid: "— si fueran secuenciales sería",
      totalElapsedSuffix:
        "ms. El Event Loop procesa callbacks asíncronos de forma concurrente sin bloquear el hilo principal.",
      allSettledTitle: "Promise.allSettled — Panel externo",
      allSettledDescPrefix: "Se llama a cuatro servicios simulados. Uno falla a propósito (difficulty-service). Con",
      allSettledDescSuffix: ", el endpoint devuelve todos los resultados — incluido el fallo — en lugar de rechazar por completo.",
      items: "elementos",
      allNote1: "habría rechazado toda la llamada cuando difficulty-service falló, perdiendo los datos de los otros tres servicios.",
      allNote2: "espera a todas las promesas e informa del resultado de cada una individualmente.",
    },
    questionCard: {
      correct: "Correcta",
      incorrect: "Incorrecta",
      remove: "Eliminar",
      correctAnswer: "Respuesta correcta",
      yourAnswer: "Tu respuesta",
    },
    auth: {
      login: "Iniciar sesión",
      logout: "Cerrar sesión",
      loginTitle: "Iniciar sesión",
      loginSubtitle: "Inicia sesión para ver y gestionar tus entrevistas",
      registerTitle: "Crear una cuenta",
      registerSubtitle: "Regístrate para empezar a guardar tus propias entrevistas",
      name: "Nombre",
      namePlaceholder: "p. ej. Alex Rivera",
      email: "Correo electrónico",
      password: "Contraseña",
      loginButton: "Iniciar sesión",
      registerButton: "Crear cuenta",
      switchToRegister: "¿No tienes cuenta? Regístrate",
      switchToLogin: "¿Ya tienes cuenta? Inicia sesión",
      demoHint: "Cuentas de demo: alice@example.com / bob@example.com / carol@example.com — contraseña: demo1234",
    },
    errors: {
      "Question not found": "Pregunta no encontrada",
      "Interview not found": "Entrevista no encontrada",
      "Interview or question not found": "Entrevista o pregunta no encontrada",
      "Question already in interview": "La pregunta ya está en la entrevista",
      "Question not in interview": "La pregunta no está en la entrevista",
      "Invalid interview ID": "ID de entrevista no válido",
      "Invalid question ID": "ID de pregunta no válido",
      "Association not found": "Asociación no encontrada",
      "Interview question not found": "Pregunta de la entrevista no encontrada",
      "Title is required": "El título es obligatorio",
      "Category is required": "La categoría es obligatoria",
      "Question is not part of this interview": "La pregunta no forma parte de esta entrevista",
      "The requested resource was not found": "No se encontró el recurso solicitado",
      "Request failed": "La solicitud ha fallado",
      "Error: External difficulty service unavailable": "Error: el servicio externo de dificultad no está disponible",
      "Authentication required": "Es necesario iniciar sesión",
      "Name is required": "El nombre es obligatorio",
      "A valid email is required": "Se requiere un correo electrónico válido",
      "Password must be at least 8 characters": "La contraseña debe tener al menos 8 caracteres",
      "Email already registered": "Ese correo ya está registrado",
      "Invalid email or password": "Correo o contraseña incorrectos",
    },
  },
};

// Looks up a raw error message (from the API or the mock fallback, both in
// English) in the current language's error dictionary. Falls back to the
// original message untranslated for anything not in the map (e.g. a raw
// network error), so an unknown error still displays instead of breaking.
export function translateError(message: string, t: Translations): string {
  return t.errors[message] ?? message;
}

// Translates a difficulty value ("easy" | "medium" | "hard") that arrives
// as a plain string from a raw SQL GROUP BY column (not narrowed to the
// Difficulty union), falling back to the original value for anything else.
export function translateDifficulty(value: string, t: Translations): string {
  return (t.common as Record<string, string>)[value] ?? value;
}
