// Seed content taken from Kishankumar Patel's resume.
// Keep in sync with client/src/data/content.json (enforced by test/content-sync.test.js).

export const TAGS = [
  { id: 'backend', label: 'Backend' },
  { id: 'web', label: 'Web' },
  { id: 'data-ml', label: 'Data & ML' },
  { id: 'systems', label: 'Systems' },
  { id: 'testing', label: 'Testing' },
];

export const projects = [
  {
    id: 'online-banking',
    title: 'Online Banking Management System',
    summary: 'A Spring Boot banking application exposing REST APIs for core banking operations.',
    highlights: [
      'Developed a banking management application using Java and Spring Boot with REST APIs for core banking operations',
      'Implemented account creation, balance transfers, transaction history, and authentication functionalities',
      'Designed MySQL database schemas and integrated backend services using JDBC and Spring Data JPA',
      'Applied object-oriented programming, exception handling, validation, and layered architecture',
    ],
    tech: ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'Spring Data JPA'],
    tags: ['backend', 'web'],
    period: 'Sep 2025 – Dec 2025',
    repoUrl: null, // TODO: GitHub repository URL (listed on resume, link not available)
    featured: true,
  },
  {
    id: 'data-analytics-pipeline',
    title: 'Enterprise Data Analytics & Insights Pipeline',
    summary: 'A data warehouse and ETL pipeline joining 8.6M+ stock market and news sentiment records.',
    highlights: [
      'Designed a data warehouse integrating 8.6M+ stock market and news sentiment records for analytics',
      'Built Python-based ETL workflows using Pandas to clean, transform, and integrate large datasets',
      'Applied sentiment analysis to classify financial news and explore relationships between sentiment and stock trends',
      'Developed data visualizations using Matplotlib to communicate analytical findings and market trends',
    ],
    tech: ['Python', 'Azure SQL', 'Pandas', 'Matplotlib'],
    tags: ['data-ml'],
    period: 'May 2025 – Aug 2025',
    repoUrl: null,
    featured: true,
  },
  {
    id: 'socketfs',
    title: 'SocketFS – Distributed File System',
    summary: 'A multi-server distributed file system in C over TCP sockets with a custom protocol.',
    highlights: [
      'Built a multi-server distributed file system with client-server architecture, concurrent connections, and reliable request handling',
      'Designed a custom communication protocol for distributed file operations with structured error handling and modular components',
      'Implemented file upload, download, deletion, archive extraction, and consolidated file listing operations',
      'Tested concurrent requests and troubleshooting scenarios to improve system reliability and validate distributed data operations',
    ],
    tech: ['C', 'Linux', 'TCP Sockets'],
    tags: ['systems'],
    period: 'May 2025 – Aug 2025',
    repoUrl: null, // TODO: GitHub repository URL
    featured: true,
  },
  {
    id: 'globe-trekker',
    title: 'Globe Trekker – Travel Management Platform',
    summary: 'A full-stack Django travel platform with authentication, roles and a shopping cart.',
    highlights: [
      'Developed a full-stack travel management platform using Django, Python, SQLite, HTML, and CSS',
      'Implemented user authentication, role-based access control, and REST API functionality',
      'Built backend workflows for travel packages, shopping cart operations, and application data management',
      'Applied modular development practices, debugging, and testing to improve application functionality',
    ],
    tech: ['Python', 'Django', 'SQLite', 'HTML', 'CSS'],
    tags: ['web', 'backend'],
    period: 'Jan 2023 – Apr 2023',
    repoUrl: null, // TODO: GitHub repository URL
    featured: false,
  },
  {
    id: 'diabetes-prediction',
    title: 'Diabetes Prediction Analysis',
    summary: 'Classification models trained on ~99,779 rows of cleaned NHANES health survey data.',
    highlights: [
      'Processed and cleaned NHANES health survey data, integrating records into an analytical dataset of approximately 99,779 rows',
      'Performed exploratory data analysis, data preprocessing, and feature preparation for diabetes prediction',
      'Developed and evaluated machine learning classification models using Python and Scikit-learn',
      'Created visualizations to examine dataset patterns, feature relationships, and model evaluation results',
    ],
    tech: ['Python', 'Pandas', 'Scikit-learn', 'Matplotlib'],
    tags: ['data-ml'],
    period: '2025',
    repoUrl: null,
    featured: false,
  },
  {
    id: 'web-automation',
    title: 'Automated Web Testing & Data Extraction',
    summary: 'Selenium WebDriver scripts in Java that extract and validate telecom plan data.',
    highlights: [
      'Developed Selenium WebDriver automation scripts in Java to extract and validate telecom plan information',
      'Automated navigation and data collection across Internet and Bundle Plans pages',
      'Used explicit waits and browser element handling to manage dynamic page content and pop-ups',
      'Validated extracted information and performed debugging to improve automation reliability',
    ],
    tech: ['Java', 'Selenium WebDriver'],
    tags: ['testing'],
    period: 'Apr 2025 – May 2025',
    repoUrl: null, // TODO: GitHub repository URL
    featured: false,
  },
];

export const skills = [
  { category: 'Programming Languages', items: ['C', 'C#', 'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'HTML5', 'CSS3'] },
  { category: 'Frameworks & Libraries', items: ['.NET Core', '.NET Framework', 'ASP.NET MVC', 'Django', 'Spring Boot', 'React', 'jQuery'] },
  { category: 'Backend Development', items: ['REST APIs', 'Web APIs', 'Object-Oriented Programming', 'MVC Architecture', 'JDBC', 'Spring Data JPA'] },
  { category: 'Databases', items: ['Microsoft SQL Server', 'Azure SQL', 'MySQL', 'SQLite', 'Stored Procedures', 'Query Optimization', 'Database Design'] },
  { category: 'Data Analytics & Processing', items: ['Pandas', 'NumPy', 'Matplotlib', 'ETL Pipelines', 'Data Cleaning', 'Data Transformation', 'Exploratory Data Analysis', 'Sentiment Analysis'] },
  { category: 'Testing & Automation', items: ['Unit Testing', 'Integration Testing', 'Selenium WebDriver', 'Functional Testing', 'Regression Testing', 'CI/CD', 'Debugging'] },
  { category: 'Systems & Networking', items: ['Linux', 'TCP/IP', 'TCP Socket Programming', 'Client-Server Architecture', 'Distributed Systems', 'Concurrency'] },
  { category: 'Cloud & DevOps', items: ['Microsoft Azure', 'Azure SQL', 'Azure DevOps', 'Cloud Deployment', 'CI/CD'] },
  { category: 'Tools & Platforms', items: ['Visual Studio', 'SSMS', 'Git', 'GitHub', 'Jira', 'IntelliJ IDEA', 'Jupyter Notebook', 'Figma', 'Unity'] },
  { category: 'Development Practices', items: ['Agile/Scrum', 'SDLC', 'Code Reviews', 'Technical Documentation', 'Performance Optimization', 'Problem Solving'] },
];

export const experience = [
  {
    id: 'ottawa-infotainment',
    role: 'UI/UX Designer',
    company: 'Ottawa Infotainment',
    location: 'Windsor, Canada',
    period: 'Jan 2026 – Apr 2026',
    highlights: [
      'Designed a dual-screen automotive dashboard in Figma, focusing on usability, accessibility, and driver safety',
      'Developed an interactive dashboard simulation in Unity, ensuring critical driving information was visible within approximately one second',
      'Conducted user testing and incorporated feedback to improve interface usability and driver interactions',
      'Collaborated with cross-functional Agile teams using Jira and Git on a real-world project involving Pepsi',
      'Contributed to design reviews, requirements discussions, iterative development, and project presentations',
    ],
  },
  {
    id: 'suryajit-publication',
    role: '.NET Software Developer',
    company: 'Suryajit Publication Private Limited',
    location: 'Gujarat, India',
    period: 'Jan 2023 – Dec 2024',
    highlights: [
      'Developed and optimized backend applications and REST APIs using C#, .NET, ASP.NET MVC, and SQL Server, improving system performance by 30%',
      'Designed and optimized SQL queries and stored procedures to improve database operations and application efficiency',
      'Performed debugging, troubleshooting, unit testing, and integration testing to improve application reliability',
      'Collaborated in Agile development processes using Git, code reviews, and CI/CD practices',
      'Supported cloud deployment activities and mentored junior interns on development workflows and technical tasks',
    ],
  },
];
