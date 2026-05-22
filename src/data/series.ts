export type Episode = {
  num: number;
  slug: string;
  title: string;
  progress: number;
};

export type Series = {
  id: string;
  name: string;
  folder: string;
  hasQuiz: boolean;
  episodes: Episode[];
};

export const cpuSeries: Series = {
  id: 'cpu',
  name: 'How Your Code Runs',
  folder: 'cpu',
  hasQuiz: true,
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

export const allSeries = [cpuSeries, fastapiSeries];
