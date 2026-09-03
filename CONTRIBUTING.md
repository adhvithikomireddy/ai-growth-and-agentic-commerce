# Contributing to NexCommerce

Thank you for your interest in contributing to **NexCommerce: Autonomous Multi-Agent Commerce Platform**! We welcome contributions from developers, designers, and researchers interested in agentic commerce, fintech, and AI growth.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to the project maintainers.

---

## Development Workflow

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB Atlas** account or local MongoDB instance (v6.0+)
- **Razorpay Test Account** (Key ID & Key Secret)
- **Google Gemini API Key** (optional; deterministic fallback is active by default)

### 2. Fork and Clone
```bash
git clone https://github.com/adhvithikomireddy/ai-growth-and-agentic-commerce.git
cd ai-growth-and-agentic-commerce
```

### 3. Installation
Install all root, backend, and frontend workspace dependencies:
```bash
npm install
```

### 4. Environment Setup
Copy the example environment template and configure your keys:
```bash
cp .env.example backend/.env
```

### 5. Running the Development Server
```bash
# Concurrently start backend (port 5000) and frontend (port 5173)
npm run dev
```

---

## Branching & Commit Conventions

We follow the **Conventional Commits** specification:

- `feat(scope)`: A new feature (e.g., `feat(a2a): add biometric signature verification`)
- `fix(scope)`: A bug fix (e.g., `fix(catalog): resolve category boundary regex collision`)
- `docs(scope)`: Documentation changes (e.g., `docs(api): update A2A packet schema`)
- `refactor(scope)`: Code refactoring without functionality changes
- `test(scope)`: Adding or updating automated tests
- `chore(scope)`: Build tooling, dependencies, or maintenance tasks

### Branch Naming:
- `feature/<short-description>`
- `bugfix/<issue-number>-<short-description>`
- `docs/<short-description>`

---

## Code Style & Standards

- **TypeScript**: Strict type checking is enforced (`"strict": true` in `tsconfig.json`). Avoid using `any` unless dealing with heterogeneous untyped external payloads.
- **Backend Architecture**: Follow the Controller-Service-Model design pattern with Zod schema validation on all inputs.
- **Frontend Architecture**: Functional React components with hooks, Tailwind CSS utility classes, and TypeScript props interfaces.
- **Crash Resilience**: Wrap all asynchronous operations in structured try/catch blocks and preserve fallback states for offline resilience.

---

## Pull Request Guidelines

1. Ensure both backend and frontend compile with zero errors:
   ```bash
   npm run build
   ```
2. Write clean, descriptive pull request titles and include details of:
   - What changed
   - Why the change was made
   - How the change was tested (unit test or manual reproduction steps)
3. Link relevant issues where applicable.

---

## License

By contributing to NexCommerce, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
