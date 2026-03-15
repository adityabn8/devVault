export const API_URL = process.env.REACT_APP_API_URL || '/api';

export const VAULT_COLORS = [
  { value: '#2563EB', label: 'Blue' },
  { value: '#DC2626', label: 'Red' },
  { value: '#16A34A', label: 'Green' },
  { value: '#9333EA', label: 'Purple' },
  { value: '#EA580C', label: 'Orange' },
  { value: '#0891B2', label: 'Cyan' },
  { value: '#4F46E5', label: 'Indigo' },
  { value: '#BE185D', label: 'Pink' },
];

export const VAULT_ICONS = ['folder', 'code', 'book', 'globe', 'database', 'server', 'terminal', 'cpu', 'cloud', 'lock'];

export const RESOURCE_TYPES = [
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'repo', label: 'Repository' },
  { value: 'docs', label: 'Documentation' },
  { value: 'snippet', label: 'Code Snippet' },
  { value: 'course', label: 'Course' },
  { value: 'other', label: 'Other' },
];

export const STATUS_OPTIONS = [
  { value: 'to_read', label: 'To Read', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300' },
];

export const SNIPPET_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'other', label: 'Other' },
];
