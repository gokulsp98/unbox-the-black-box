export type Episode = {
  num: number;
  slug: string;
  title: string;
  progress: number;
};

export type SeriesTheme = {
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  seriesLabel: string;
  icon: string;
};

export type Series = {
  id: string;
  name: string;
  folder: string;
  hasQuiz: boolean;
  theme: SeriesTheme;
  episodes: Episode[];
};

export const cpuSeries: Series = {
  id: 'cpu',
  name: 'How Your Code Runs',
  folder: 'cpu',
  hasQuiz: true,
  theme: {
    gradientFrom: '#6c5ce7',
    gradientTo: '#0984e3',
    accentColor: '#a29bfe',
    seriesLabel: 'SERIES 01',
    icon: 'CPU',
  },
  episodes: [
    { num: 1, slug: 'part1', title: 'The Brain of Your Computer', progress: 14 },
    { num: 2, slug: 'part2', title: 'The Bigger Picture', progress: 28 },
    { num: 3, slug: 'part3', title: 'C: The Journey to Binary', progress: 42 },
    { num: 4, slug: 'part4', title: 'Java: Binary While Running', progress: 57 },
    { num: 5, slug: 'part5', title: 'Python: Binary One Line At A Time', progress: 71 },
    { num: 6, slug: 'part6', title: 'JavaScript: Binary In Your Browser', progress: 85 },
    { num: 7, slug: 'part7', title: 'The Full Picture', progress: 100 },
  ],
};

export const fastapiSeries: Series = {
  id: 'fastapi',
  name: 'How FastAPI Works',
  folder: 'fastapi',
  hasQuiz: true,
  theme: {
    gradientFrom: '#00b894',
    gradientTo: '#0984e3',
    accentColor: '#55efc4',
    seriesLabel: 'SERIES 02',
    icon: 'API',
  },
  episodes: [
    { num: 1, slug: 'part1', title: 'What Happens When You Hit It', progress: 14 },
    { num: 2, slug: 'part2', title: 'Uvicorn — The Server Behind FastAPI', progress: 28 },
    { num: 3, slug: 'part3', title: 'The Event Loop Inside Uvicorn', progress: 42 },
    { num: 4, slug: 'part4', title: 'Coroutines — async/await', progress: 57 },
    { num: 5, slug: 'part5', title: 'Workers — Scaling Across CPU Cores', progress: 71 },
    { num: 6, slug: 'part6', title: "FastAPI's Magic — Routing & Validation", progress: 85 },
    { num: 7, slug: 'part7', title: 'The Full Production Stack', progress: 100 },
  ],
};

export const claudeCodeSeries: Series = {
  id: 'claude-code',
  name: 'How Claude Code Works',
  folder: 'claude-code',
  hasQuiz: true,
  theme: {
    gradientFrom: '#7b68ee',
    gradientTo: '#4682b4',
    accentColor: '#c5bdff',
    seriesLabel: 'SERIES 03',
    icon: 'AI',
  },
  episodes: [
    { num: 1, slug: 'part1', title: 'What is an LLM?', progress: 14 },
    { num: 2, slug: 'part2', title: 'What is Claude Code?', progress: 28 },
    { num: 3, slug: 'part3', title: 'Sessions & the Request Flow', progress: 42 },
    { num: 4, slug: 'part4', title: 'Why AI Gets Expensive', progress: 57 },
    { num: 5, slug: 'part5', title: 'Prompt Caching', progress: 71 },
    { num: 6, slug: 'part6', title: 'Context Limits & Compaction', progress: 85 },
    { num: 7, slug: 'part7', title: 'The Complete Picture', progress: 100 },
  ],
};

export const frontendSeries: Series = {
  id: 'frontend',
  name: 'How the Frontend Works',
  folder: 'frontend',
  hasQuiz: true,
  theme: {
    gradientFrom: '#e17055',
    gradientTo: '#0984e3',
    accentColor: '#fab1a0',
    seriesLabel: 'SERIES 04',
    icon: 'WEB',
  },
  episodes: [
    { num: 1,  slug: 'part1',  title: 'The Web Before JavaScript',                 progress: 5   },
    { num: 2,  slug: 'part2',  title: 'JavaScript is Born',                        progress: 10  },
    { num: 3,  slug: 'part3',  title: 'Early JavaScript — What It Actually Did',   progress: 14  },
    { num: 4,  slug: 'part4',  title: 'The DOM — The Browser\'s Living Tree',       progress: 18  },
    { num: 5,  slug: 'part5',  title: 'The DOM Standard & Browser Wars',           progress: 23  },
    { num: 6,  slug: 'part6',  title: 'AJAX & jQuery — The Web Comes Alive',       progress: 27  },
    { num: 7,  slug: 'part7',  title: 'ECMAScript — The Standard Behind JavaScript', progress: 32 },
    { num: 8,  slug: 'part8',  title: 'Node.js — JavaScript Escapes the Browser',  progress: 36  },
    { num: 9,  slug: 'part9',  title: 'npm — The Package Manager',                 progress: 41  },
    { num: 10, slug: 'part10', title: 'node_modules — The Downloaded Code',        progress: 45  },
    { num: 11, slug: 'part11', title: 'Why Frameworks Exist',                      progress: 50  },
    { num: 12, slug: 'part12', title: 'Angular, React & Vue',                      progress: 55  },
    { num: 13, slug: 'part13', title: 'TypeScript, JSX & Vue Templates',           progress: 59  },
    { num: 14, slug: 'part14', title: 'Why Build Tools Exist',                     progress: 64  },
    { num: 15, slug: 'part15', title: 'Vite — The Modern Build Tool',              progress: 68  },
    { num: 16, slug: 'part16', title: 'How Vue Files Become JavaScript',           progress: 73  },
    { num: 17, slug: 'part17', title: 'Tailwind CSS',                              progress: 77  },
    { num: 18, slug: 'part18', title: 'ESLint & Stylelint',                        progress: 82  },
    { num: 19, slug: 'part19', title: 'Environment Variables & .env Files',        progress: 86  },
    { num: 20, slug: 'part20', title: 'Authentication & Route Guards',             progress: 91  },
    { num: 21, slug: 'part21', title: 'Production, CDN & Deployment',             progress: 95  },
    { num: 22, slug: 'part22', title: 'The Full Picture',                          progress: 100 },
  ],
};

export const allSeries = [cpuSeries, fastapiSeries, claudeCodeSeries, frontendSeries];
