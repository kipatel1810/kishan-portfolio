import data from './content.json';
import type { Experience, Project, SkillCategory, Tag } from '../api/types';

// API-backed content (also used as the offline fallback). Mirrors server/src/data/content.js.
export const tags = data.tags as Tag[];
export const projects = data.projects as Project[];
export const skills = data.skills as SkillCategory[];
export const experience = data.experience as Experience[];

// Static content that only lives in the frontend.
export const profile = {
  name: 'Kishankumar Patel',
  shortName: 'Kishan',
  initials: 'KP',
  role: 'Software Developer',
  location: 'Windsor, ON, Canada',
  email: 'patelkishan6214@gmail.com',
  github: null as string | null, // TODO: GitHub profile URL (shown as "GitHub" on resume, link not provided)
  linkedin: null as string | null, // TODO: LinkedIn profile URL (shown as "LinkedIn" on resume, link not provided)
  // TODO: add the resume PDF to client/public/ with this filename.
  resumeFile: 'Kishankumar_Patel_Resume.pdf',
  taglines: [
    'REST APIs with C# and .NET',
    'Data pipelines in Python',
    'Distributed systems in C',
    'Interfaces people can use',
  ],
  intro:
    'Master of Applied Computing graduate with 2+ years of professional experience building backend applications and REST APIs with C#, .NET and SQL Server.',
  about: [
    'I’m a software developer based in Windsor, Ontario. I spent two years as a .NET developer at Suryajit Publication in Gujarat, India, building and optimizing REST APIs and SQL Server back ends and improving system performance by 30%.',
    'I then completed a Master of Applied Computing at the University of Windsor, where I worked across Python data pipelines, Java and Spring Boot services, Selenium test automation and a distributed file system written in C.',
    'Most recently I worked as a UI/UX designer at Ottawa Infotainment on a dual-screen automotive dashboard for a real-world project involving Pepsi, running user tests and iterating on the design from their feedback.',
  ],
  facts: [
    { label: 'Based in', value: 'Windsor, ON' },
    { label: 'Experience', value: '2+ years, .NET' },
    { label: 'Degree', value: 'MAC, UWindsor ’26' },
    { label: 'Focus', value: 'Backend & data' },
  ],
};

export const education = [
  {
    degree: 'Master of Applied Computing',
    school: 'University of Windsor',
    location: 'Windsor, ON',
    period: 'Jan 2025 – Apr 2026',
  },
  {
    degree: 'Bachelor of Computer Engineering',
    school: 'Gujarat Technological University',
    location: 'Gujarat, India',
    period: 'Jun 2018 – Jun 2023',
  },
];

// From LinkedIn Learning certificates of completion (newest first). PDFs live in client/public/certificates/.
export const certifications = [
  {
    name: 'Getting Started with Microsoft Azure',
    issuer: 'LinkedIn Learning · Microsoft Press',
    date: 'Jul 2025',
    skills: ['Microsoft Azure'],
    credentialId: '61c6fc688b4e847534df1cf8ee3a92e1ec54e163b9c8ef917aff7c940d51f913',
    completed: 'Jul 15, 2025',
    duration: '2h 57m',
    file: 'certificates/microsoft-azure.pdf',
  },
  {
    name: 'Learning Hadoop',
    issuer: 'LinkedIn Learning',
    date: 'Jun 2025',
    skills: ['Large-scale Data Processing', 'Hadoop'],
    credentialId: 'c915cfdd30599eccf57b08aec650a81807b11c12e08e2add5ac8035bd7e8589c',
    completed: 'Jun 9, 2025',
    duration: '1h 53m',
    file: 'certificates/hadoop.pdf',
  },
  {
    name: 'Unix Essential Training',
    issuer: 'LinkedIn Learning',
    date: 'May 2025',
    skills: ['Unix'],
    credentialId: '6c48374b75ecc0372a261e807ca2cd01f504ed2c5aa2be83123465b8274aeaa1',
    completed: 'May 12, 2025',
    duration: '2h 43m',
    file: 'certificates/unix.pdf',
  },
  {
    name: 'Learning Regular Expressions',
    issuer: 'LinkedIn Learning',
    date: 'Mar 2025',
    skills: ['Regular Expressions'],
    credentialId: 'f5a3a3597feef47d90cfbcfb792b0b694f621741a06c3258dd2e3090a945c645',
    completed: 'Mar 27, 2025',
    duration: '5h 36m',
    file: 'certificates/regular-expressions.pdf',
  },
  {
    name: 'How to Be a Better Professional Speaker in the Workplace',
    issuer: 'LinkedIn Learning',
    date: 'Mar 2025',
    skills: ['Corporate Communications', 'Public Speaking'],
    credentialId: '9a208d0b0d1dc2fb4f03a8c669e4b0773c8f520d2b490bd94c74ca75c94cf502',
    completed: 'Mar 16, 2025',
    duration: '34m',
    file: 'certificates/professional-speaker.pdf',
  },
  {
    name: 'Selenium Essential Training',
    issuer: 'LinkedIn Learning',
    date: 'Feb 2025',
    skills: ['Test Automation', 'Selenium'],
    credentialId: 'cbc336e698890939ed0989504aa85dc7b1384eac4140520e2215efa854594993',
    completed: 'Feb 1, 2025',
    duration: '1h 59m',
    file: 'certificates/selenium.pdf',
  },
];

export const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const;
