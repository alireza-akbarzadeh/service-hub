export interface AiToolItem {
  id: string
  name: string
  tagline: string
  category: "ide-agents" | "frontend-ui" | "backend-devops" | "models-apis" | "review-testing"
  categoryLabel: string
  url: string
  pricing: "Free / Open Source" | "Freemium" | "Paid" | "Usage API"
  iconBg: string
  bestFor: string[]
  description: string
  workflowTips: string
  quickCommand?: string
}

export const AI_DEVELOPER_TOOLS: AiToolItem[] = [
  // 1. IDEs & Coding Agents
  {
    id: "cursor",
    name: "Cursor",
    tagline: "The AI-First Code Editor built on VS Code",
    category: "ide-agents",
    categoryLabel: "Agentic IDEs & Editors",
    url: "https://cursor.com",
    pricing: "Freemium",
    iconBg: "from-blue-600 to-indigo-600",
    bestFor: ["Full-Stack", "Multi-File Edits", "Semantic Codebase Indexing"],
    description:
      "A fork of VS Code with native AI intelligence. Features Composer for multi-file autonomous edits, `@codebase` indexing to understand your entire project, and predictive inline typing.",
    workflowTips:
      "Use `Ctrl+K` for inline code generation and `Ctrl+I` (Composer) to implement features touching both backend API routes and frontend components simultaneously.",
    quickCommand: "curl -fsSL https://cursor.com/install.sh",
  },
  {
    id: "claude-code",
    name: "Claude Code",
    tagline: "Anthropic's Terminal Agent powered by Claude 3.7 Sonnet",
    category: "ide-agents",
    categoryLabel: "Agentic IDEs & Editors",
    url: "https://anthropic.com/claude-code",
    pricing: "Usage API",
    iconBg: "from-amber-600 to-orange-600",
    bestFor: ["CLI Workflow", "Deep Reasoning", "Repo Refactoring"],
    description:
      "An autonomous agentic coding tool that lives directly in your terminal. It executes shell commands, runs test suites in a feedback loop, and navigates multi-gigabyte repositories with Claude 3.7 Sonnet hybrid reasoning.",
    workflowTips:
      "Run `claude` in your repository root. Ask it to fix broken tests or refactor deprecated libraries — it reads compiler errors and self-corrects autonomously.",
    quickCommand: "npm install -g @anthropic-ai/claude-code",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot & Workspace",
    tagline: "Enterprise-grade AI pair programmer & task agent",
    category: "ide-agents",
    categoryLabel: "Agentic IDEs & Editors",
    url: "https://github.com/features/copilot",
    pricing: "Paid",
    iconBg: "from-slate-800 to-zinc-900",
    bestFor: ["Inline Autocomplete", "PR Summaries", "GitHub Ecosystem"],
    description:
      "Context-aware code completion integrated into VS Code, JetBrains, and GitHub. Copilot Workspace translates GitHub issues directly into code implementation plans with diff review.",
    workflowTips:
      "Write a descriptive comment or function signature, and Copilot will suggest whole implementations with proper error handling and TypeScript types.",
  },
  {
    id: "windsurf",
    name: "Windsurf (Codeium)",
    tagline: "The Agentic IDE with Cascade Flows",
    category: "ide-agents",
    categoryLabel: "Agentic IDEs & Editors",
    url: "https://codeium.com/windsurf",
    pricing: "Freemium",
    iconBg: "from-teal-600 to-cyan-600",
    bestFor: ["Deep Context", "Fast Cascade", "VS Code Extension Support"],
    description:
      "Combines copilot suggestions with autonomous agentic Cascade. It tracks cursor context and understands recent terminal runs to keep coding momentum uninterrupted.",
    workflowTips:
      "Use Cascade when you need to diagnose mysterious runtime bugs that span database queries, API responses, and client UI renders.",
  },
  {
    id: "bolt-new",
    name: "Bolt.new",
    tagline: "Prompt-to-Fullstack in Browser WebContainers",
    category: "ide-agents",
    categoryLabel: "Agentic IDEs & Editors",
    url: "https://bolt.new",
    pricing: "Freemium",
    iconBg: "from-orange-500 to-amber-500",
    bestFor: ["Instant Prototypes", "Next.js/Vite", "Node.js in Browser"],
    description:
      "Spins up Node.js runtimes directly in your browser tab using WebContainers. Generates complete full-stack web apps, installs npm packages, and runs live servers with zero local setup.",
    workflowTips:
      "Ideal for spinning up instant proof-of-concept web apps or reproducing customer bugs in an isolated sandbox with 1 prompt.",
  },

  // 2. Frontend & UI Generation
  {
    id: "v0-vercel",
    name: "v0 by Vercel",
    tagline: "Generative UI for React, Tailwind & shadcn/ui",
    category: "frontend-ui",
    categoryLabel: "Frontend & Generative UI",
    url: "https://v0.dev",
    pricing: "Freemium",
    iconBg: "from-black to-zinc-800",
    bestFor: ["React Components", "shadcn/ui", "Tailwind CSS"],
    description:
      "Generates production-grade accessible React components styled with modern Tailwind CSS and Radix UI primitives. Offers visual click-to-edit inspection and 1-click `npx v0 add` export.",
    workflowTips:
      "Paste your existing component or a screenshot of what you want to achieve. Use `npx v0 add <id>` to instantly import the generated code into your Next.js project.",
    quickCommand: "npx v0 add",
  },
  {
    id: "21st-dev",
    name: "21st.dev",
    tagline: "The npm for Design Engineers & AI Component Hub",
    category: "frontend-ui",
    categoryLabel: "Frontend & Generative UI",
    url: "https://21st.dev",
    pricing: "Free / Open Source",
    iconBg: "from-pink-600 to-rose-600",
    bestFor: ["Motion UI", "Tailwind Animations", "Modern Design Systems"],
    description:
      "A curated open-source collection of stunning interactive components (bento grids, glassmorphism cards, glowing borders, smooth spring animations) ready to drop into Next.js and React apps.",
    workflowTips:
      "Browse component demos, copy the TSX code and Tailwind config, and paste directly into your project components directory.",
  },
  {
    id: "relume",
    name: "Relume",
    tagline: "AI Website Wireframes & Sitemap Generator",
    category: "frontend-ui",
    categoryLabel: "Frontend & Generative UI",
    url: "https://relume.io",
    pricing: "Freemium",
    iconBg: "from-violet-600 to-purple-600",
    bestFor: ["Sitemaps", "Landing Pages", "Figma to Code"],
    description:
      "Generates full website architecture and wireframes in seconds. Exports directly to Figma, React, Webflow, or Tailwind CSS with clean, modular structural components.",
    workflowTips:
      "Use Relume during sprint kickoff to plan marketing pages and customer portal layouts with your product team before writing frontend code.",
  },
  {
    id: "galileo-ai",
    name: "Galileo AI",
    tagline: "Prompt-to-UI for Mobile and Web Applications",
    category: "frontend-ui",
    categoryLabel: "Frontend & Generative UI",
    url: "https://usegalileo.ai",
    pricing: "Paid",
    iconBg: "from-indigo-600 to-blue-600",
    bestFor: ["Mobile App UI", "Figma Components", "Complex Dashboard Layouts"],
    description:
      "Generates high-fidelity UI designs with accompanying copywriting, illustrations, and design tokens from natural language descriptions.",
    workflowTips:
      "Export generated designs directly to Figma or copy auto-generated React native / Tailwind code for rapid UI scaffoldings.",
  },

  // 3. Backend, Database & DevOps
  {
    id: "neon-tech",
    name: "Neon Serverless Postgres & AI Gateway",
    tagline: "Serverless PostgreSQL with instant database branching",
    category: "backend-devops",
    categoryLabel: "Backend, Database & DevOps",
    url: "https://neon.tech",
    pricing: "Freemium",
    iconBg: "from-emerald-600 to-green-600",
    bestFor: ["PostgreSQL", "Database Branching", "Vector Search with pgvector"],
    description:
      "Separates compute and storage for Postgres. Offers instant point-in-time database branching for PR staging, autoscaling compute to zero, and pgvector for AI embedding search.",
    workflowTips:
      "Create a database branch per GitHub pull request to test database schema migrations and seed data in complete isolation without staging conflicts.",
    quickCommand: "npx neonctl branches create",
  },
  {
    id: "supabase-ai",
    name: "Supabase AI",
    tagline: "Postgres Assistant, Vector Embeddings & Edge Runtimes",
    category: "backend-devops",
    categoryLabel: "Backend, Database & DevOps",
    url: "https://supabase.com",
    pricing: "Freemium",
    iconBg: "from-emerald-500 to-teal-600",
    bestFor: ["Postgres Functions", "Row Level Security (RLS)", "SQL Optimization"],
    description:
      "Open-source Firebase alternative with AI SQL generator. Converts English questions into complex SQL queries, generates tight RLS security policies, and optimizes slow query execution plans.",
    workflowTips:
      "Ask Supabase AI to write tricky Row Level Security (RLS) policies based on user session roles to ensure multi-tenant security.",
  },
  {
    id: "ollama",
    name: "Ollama",
    tagline: "Get up and running with large language models locally",
    category: "backend-devops",
    categoryLabel: "Backend, Database & DevOps",
    url: "https://ollama.ai",
    pricing: "Free / Open Source",
    iconBg: "from-zinc-800 to-stone-900",
    bestFor: ["Offline Development", "DeepSeek R1 Local", "Local Embeddings"],
    description:
      "The easiest way to run open-source models (Llama 3.3, DeepSeek R1, Qwen 2.5, Codestral) on macOS, Linux, and Windows with OpenAI-compatible REST APIs.",
    workflowTips:
      "Run `ollama run deepseek-r1` or `ollama run codellama` for private, zero-latency coding assistance without sending any proprietary code to third parties.",
    quickCommand: "ollama run deepseek-r1:8b",
  },
  {
    id: "k8sgpt",
    name: "K8sGPT",
    tagline: "Kubernetes SRE Superpowers & Cluster Diagnostics",
    category: "backend-devops",
    categoryLabel: "Backend, Database & DevOps",
    url: "https://k8sgpt.ai",
    pricing: "Free / Open Source",
    iconBg: "from-blue-600 to-sky-600",
    bestFor: ["Kubernetes", "CrashLoopBackOff", "Cluster Health Triage"],
    description:
      "Scans Kubernetes clusters, detects pod failures, CrashLoopBackOff states, and misconfigurations, and provides actionable remediation advice in plain English.",
    workflowTips:
      "Run `k8sgpt analyze --explain` when microservices fail to schedule or ingress returns 502 Bad Gateway to get the root cause instantly.",
    quickCommand: "k8sgpt analyze --explain",
  },
  {
    id: "groq",
    name: "Groq LPU Inference",
    tagline: "The world's fastest LLM inference engine (<15ms latency)",
    category: "backend-devops",
    categoryLabel: "Backend, Database & DevOps",
    url: "https://groq.com",
    pricing: "Freemium",
    iconBg: "from-red-600 to-orange-600",
    bestFor: ["Sub-second Streaming", "Voice Agents", "Instant JSON Generation"],
    description:
      "Custom Language Processing Units (LPUs) delivering 500+ tokens per second. Provides drop-in OpenAI compatible APIs for Llama 3.3 and Mixtral at blazing speeds.",
    workflowTips:
      "Use Groq whenever you build real-time interactive apps where users need instantaneous token streaming without noticeable latency.",
  },

  // 4. Models & Reasoning Engines
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet (Anthropic)",
    tagline: "The First Hybrid Reasoning Model for Software Engineering",
    category: "models-apis",
    categoryLabel: "Foundation Models & Reasoning",
    url: "https://anthropic.com/news/claude-3-7-sonnet",
    pricing: "Usage API",
    iconBg: "from-amber-600 to-yellow-600",
    bestFor: ["Complex Code Architectures", "Extended Thinking", "Bug Diagnosing"],
    description:
      "Combines instant standard generation with extended thinking reasoning. Capable of planning multi-step refactors, navigating complex legacy codebases, and producing high-elegance TypeScript.",
    workflowTips:
      "Set thinking budget to 4,000-8,000 tokens when prompting for architecture design, API contract specifications, or subtle concurrency bugs.",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1 & V3",
    tagline: "Open-weights reasoning model rivaling OpenAI o1",
    category: "models-apis",
    categoryLabel: "Foundation Models & Reasoning",
    url: "https://deepseek.com",
    pricing: "Free / Open Source",
    iconBg: "from-blue-600 to-cyan-600",
    bestFor: ["Algorithms", "Math Reasoning", "Ultra Low Cost API"],
    description:
      "An open-weights reasoning model utilizing chain-of-thought reinforcement learning. Matches top proprietary models on competitive coding benchmarks at a tiny fraction of the cost.",
    workflowTips:
      "Run DeepSeek R1 locally via Ollama or use their API endpoint with an OpenAI-compatible SDK for cost-effective automated testing and code generation.",
  },
  {
    id: "gemini-2-flash",
    name: "Google Gemini 2.0 Flash",
    tagline: "Ultra-fast multimodal model with 2M token context window",
    category: "models-apis",
    categoryLabel: "Foundation Models & Reasoning",
    url: "https://ai.google.dev",
    pricing: "Freemium",
    iconBg: "from-blue-500 to-purple-600",
    bestFor: ["Entire Monorepo Analysis", "Video/Image Understanding", "Fast Tool Calling"],
    description:
      "Google's next-generation model built for speed and immense context. Can ingest entire codebases, PDFs, videos, and multi-hour audio recordings in a single API call.",
    workflowTips:
      "Use the `@google/genai` SDK with structured outputs (`responseSchema`) to get strictly typed JSON data directly into your backend handlers.",
  },

  // 5. Code Review, Testing & Docs
  {
    id: "coderabbit",
    name: "CodeRabbit",
    tagline: "AI-first Pull Request reviewer that catches subtle bugs",
    category: "review-testing",
    categoryLabel: "Testing, Code Review & Docs",
    url: "https://coderabbit.ai",
    pricing: "Freemium",
    iconBg: "from-rose-600 to-pink-600",
    bestFor: ["Automated Code Review", "PR Summaries", "Security & Performance Checks"],
    description:
      "Installs as a GitHub App on your repositories. Automatically analyzes PR diffs, explains the intent, flags potential security vulnerabilities and performance bottlenecks, and provides one-click commit suggestions.",
    workflowTips:
      "Configure `.coderabbit.yaml` to enforce your team's custom style guidelines, test coverage thresholds, and security checks.",
  },
  {
    id: "mintlify",
    name: "Mintlify",
    tagline: "Automated, beautiful technical documentation for developers",
    category: "review-testing",
    categoryLabel: "Testing, Code Review & Docs",
    url: "https://mintlify.com",
    pricing: "Freemium",
    iconBg: "from-emerald-600 to-teal-600",
    bestFor: ["API Docs", "MDX Component Libraries", "Code-to-Doc Sync"],
    description:
      "Modern documentation platform that syncs directly with GitHub. Features an AI writer that reads TypeScript types and OpenAPI schemas to keep docs updated automatically with every commit.",
    workflowTips:
      "Point Mintlify at your OpenAPI/Swagger schema to generate interactive API reference pages with built-in sandbox requests.",
  },
  {
    id: "qodo",
    name: "Qodo (formerly CodiumAI)",
    tagline: "Generative AI testing, test suite creation & code integrity",
    category: "review-testing",
    categoryLabel: "Testing, Code Review & Docs",
    url: "https://qodo.ai",
    pricing: "Freemium",
    iconBg: "from-indigo-600 to-violet-600",
    bestFor: ["Jest/Vitest Unit Tests", "Edge Case Discovery", "Test-Driven Development"],
    description:
      "Analyzes your code functions and generates comprehensive unit test suites covering tricky edge cases, null pointers, and boundary conditions that developers often miss.",
    workflowTips:
      "Click 'Generate Tests' on critical payment or authentication functions to get ready-to-run Jest/Vitest tests with mocked network calls.",
  },
]

export interface PromptTemplate {
  title: string
  category: string
  prompt: string
  bestModel: string
}

export const DEVELOPER_PROMPTS: PromptTemplate[] = [
  {
    title: "Full-Stack Architecture & Security Review",
    category: "Architecture",
    bestModel: "Claude 3.7 Sonnet / DeepSeek R1",
    prompt: `Analyze the following full-stack architecture for a Next.js (App Router) + PostgreSQL system.
Review:
1. Data security & potential IDOR/authorization leaks between client components and Server Actions.
2. Database query efficiency, N+1 query risks, missing indexes, and transaction safety.
3. Edge caching, revalidation strategies, and optimistic UI resilience.
Provide actionable refactoring diffs formatted in clean TypeScript.`,
  },
  {
    title: "Next.js Server Action with Zod & Optimistic State",
    category: "Frontend/Next.js",
    bestModel: "Claude 3.7 Sonnet / Cursor",
    prompt: `Write a production-ready Next.js Server Action with:
1. Zod schema validation for all form inputs with localized error formatting.
2. User authentication & role verification check.
3. Drizzle ORM transaction with error rollback.
4. Path revalidation (\`revalidatePath\`).
5. Type-safe return format \`{ success: boolean, data?: T, error?: string }\`.`,
  },
  {
    title: "Postgres Migration & High-Performance Indexing",
    category: "Database",
    bestModel: "Claude 3.7 Sonnet / Supabase AI",
    prompt: `Design a high-scale PostgreSQL schema for [Describe Domain].
Include:
1. Foreign key constraints with proper ON DELETE behavior.
2. Composite indexes tailored for frequent query patterns (filtering + sorting).
3. Created_at and updated_at triggers with timezone awareness.
4. Row Level Security (RLS) policies isolating user data.`,
  },
  {
    title: "Docker Multi-Stage Build & Web Performance Audit",
    category: "DevOps",
    bestModel: "Gemini 2.0 Flash / GPT-4o",
    prompt: `Write an optimized multi-stage Dockerfile for a Next.js App Router application.
Ensure:
1. Minimal final image size using node:alpine or distroless.
2. Non-root user execution for security compliance.
3. Correct caching layers for package.json and pnpm/npm locks.
4. Next.js standalone output configuration.`,
  },
]
