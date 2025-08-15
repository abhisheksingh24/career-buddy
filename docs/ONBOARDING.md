# Career Buddy - Intern Onboarding Guide

Welcome to Career Buddy! 👋 This guide will help you set up your development environment and understand our development workflow. If you get stuck at any point, don't hesitate to ask for help!

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Environment](#development-environment)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

1. **Git** - Version control system
   - Windows: Download from [git-scm.com](https://git-scm.com/)
   - Mac: Install via Homebrew: `brew install git`
   - Linux: `sudo apt-get install git` (Ubuntu/Debian)

2. **Node.js** - JavaScript runtime (LTS version recommended)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

3. **Docker Desktop** - For running PostgreSQL locally
   - Windows Requirements:
     - Windows 10/11 Pro, Enterprise, or Education (Build 19041 or higher)
     - WSL 2 (Windows Subsystem for Linux 2) must be installed and enabled
     - Enable Hyper-V Windows features
   - Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
   - After installation:
     - Ensure Docker is running
     - On Windows, verify Docker Desktop is using WSL 2 backend
     - Restart your computer if Docker has trouble starting

4. **Code Editor** - We recommend Visual Studio Code
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)
   - Recommended extensions:
     - ESLint
     - Prettier
     - TypeScript and JavaScript Language Features
     - Tailwind CSS IntelliSense
     - Prisma

## Initial Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/career-buddy.git
   cd career-buddy
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy the example environment file:

     ```bash
     # On Windows PowerShell:
     Copy-Item .env.example .env.local

     # OR on Windows Command Prompt:
     copy .env.example .env.local

     # OR on Git Bash:
     cp .env.example .env.local
     ```

   - Update the following variables in `.env.local`:
     - `NEXTAUTH_SECRET`: Generate one using `openssl rand -base64 32`
     - `NEXTAUTH_URL`: Use `http://localhost:3000` for local development
     - For the following variables, reach out to the team lead:
       - `GOOGLE_CLIENT_ID`
       - `GOOGLE_CLIENT_SECRET`
       - `OPENAI_API_KEY`

4. **Database Setup**
   - Start the PostgreSQL database using Docker:
     ```bash
     docker-compose up -d
     ```
   - Run database migrations:
     ```bash
     npx prisma migrate dev
     ```
   - Generate Prisma client:
     ```bash
     npx prisma generate
     ```

## Development Environment

1. **Code Editor Setup**
   - Open VS Code settings (Ctrl + , on Windows, or Cmd + , on Mac)
   - Enable "Format on Save"
   - Set Default Formatter to "Prettier"
   - Enable "ESLint: Auto Fix on Save"

2. **Git Configuration**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

## Running the Application

1. **Start the Development Server**

   ```bash
   npm run dev
   ```

   - Access the application at [http://localhost:3000](http://localhost:3000)
   - The development server will automatically reload when you make changes

2. **Database Management**
   - Access pgAdmin at [http://localhost:5050](http://localhost:5050)
   - Login credentials:
     - Email: admin@careerbuddy.local
     - Password: admin_password
   - To connect to the database:
     - Host: postgres
     - Port: 5432
     - Database: career_buddy_dev
     - Username: career_buddy
     - Password: dev_password

## Development Workflow

1. **Branch Management**
   - Always create a new branch for your work:
     ```bash
     git checkout -b feature/your-feature-name
     ```
   - Keep branches focused on single features/fixes

2. **Making Changes**
   - Write clean, documented code
   - Follow the TypeScript type system
   - Run tests before committing:
     ```bash
     npm run test
     ```
   - Format your code:
     ```bash
     npm run format
     ```
   - Check for linting errors:
     ```bash
     npm run lint
     ```

3. **Committing Changes**
   - Stage your changes:
     ```bash
     git add .
     ```
   - Commit with a descriptive message:
     ```bash
     git commit -m "feat: add user profile page"
     ```
   - Push to your branch:
     ```bash
     git push origin feature/your-feature-name
     ```

4. **Creating Pull Requests**
   - Go to GitHub and create a PR from your branch
   - Fill out the PR template completely
   - Request review from team members
   - Address review comments promptly

## Common Tasks

1. **Database Schema Changes**
   - Edit `prisma/schema.prisma`
   - Create a migration:
     ```bash
     npx prisma migrate dev --name what_changed
     ```

2. **Adding New API Endpoints**
   - Create new route in `src/app/api/`
   - Follow existing patterns for error handling and responses
   - Add appropriate TypeScript types

3. **Adding New Pages**
   - Create new page in `src/app/`
   - Use existing components when possible
   - Follow mobile-first design principles

## Troubleshooting

1. **Windows-Specific Issues**
   - If you get EACCES or permission errors:
     - Run PowerShell/Command Prompt as Administrator
     - Ensure you have write permissions in the project directory
   - If Docker commands fail:
     - Ensure Docker Desktop is running
     - Check that WSL 2 is installed and enabled
     - Restart Docker Desktop
   - If you get EPERM errors during npm install:
     - Delete the problematic directory manually
     - Run `npm cache clean --force`
     - Try again with `npm install`
   - Path issues:
     - Use backslashes (\\) or forward slashes (/) consistently
     - Avoid spaces in file paths
   - Line ending issues:
     - Configure Git to handle line endings:
       ```bash
       git config --global core.autocrlf true
       ```
     - If you see CRLF warnings, this is normal on Windows

2. **Database Connection Issues**
   - Ensure Docker containers are running:
     ```bash
     docker ps
     ```
   - Check container logs:
     ```bash
     docker-compose logs postgres
     ```

3. **Build Errors**
   - Clear Next.js cache:
     ```bash
     # On Windows PowerShell/Command Prompt:
     rmdir /s /q .next
     # OR on Git Bash:
     rm -rf .next
     ```
   - Reinstall dependencies:

     ```bash
     # On Windows PowerShell/Command Prompt:
     rmdir /s /q node_modules
     # OR on Git Bash:
     rm -rf node_modules

     npm install
     ```

4. **Authentication Issues**
   - Verify environment variables
   - Clear browser cookies and local storage
   - Check Google Cloud Console settings

## Best Practices

1. **Code Quality**
   - Write self-documenting code
   - Add comments for complex logic
   - Follow TypeScript best practices
   - Use meaningful variable names

2. **Testing**
   - Write tests for new features
   - Run the full test suite before pushing
   - Test edge cases and error scenarios

3. **Performance**
   - Use appropriate React hooks
   - Optimize database queries
   - Follow Next.js best practices

4. **Security**
   - Never commit sensitive data
   - Validate all user inputs
   - Follow security best practices

## Getting Help

If you're stuck or need clarification:

1. Check the documentation in the `docs/` directory
2. Search existing GitHub issues
3. Ask in the team chat
4. Reach out to your mentor

Remember: There are no silly questions! We're here to help you learn and grow.

---

For any access-related issues (API keys, permissions, etc.), please contact the team lead directly.
