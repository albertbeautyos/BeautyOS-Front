# BeatyOS Frontend

This project is the frontend application for BeatyOS, built with Next.js. It features a dashboard interface with a sidebar, data table capabilities, and authentication. It utilizes shadcn/ui for components and Tailwind CSS for styling.

## Features

- **Responsive Sidebar Navigation:** Collapsible sidebar for navigating different sections.
- **Data Table:** Displays paginated data with sorting, filtering (via row actions), loading states, and skeleton UI.
- **Pagination:** Custom pagination component for navigating through table data.
- **Theme Toggle:** Allows users to switch between light and dark modes.
- **Authentication:** Login page setup (`login-form.tsx`) and potentially middleware (`middleware.ts`).
- **UI Components:** Leverages shadcn/ui for pre-built, accessible components.
- **TypeScript:** Built with TypeScript for type safety.
- **Tailwind CSS:** Styled using Tailwind CSS utility classes.
- **State Management:** Uses Redux Toolkit (`store/` directory).
- **API Integration:** Uses Axios (`services/` directory).

## Technologies Used

- **Framework:** [Next.js](https://nextjs.org/) 15 (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) (using Radix UI primitives)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **Data Fetching:** [Axios](https://axios-http.com/)
- **Tables:** [TanStack Table](https://tanstack.com/table/v8)
- **Linting:** [ESLint](https://eslint.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **Other:** date-fns, cmdk, next-themes

## Getting Started

### Prerequisites

- Node.js (v18.18 or later recommended)
- npm, pnpm, or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/albertbeautyos/BeautyOS-Front
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory by copying `.env.example` (if it exists) or by adding the required variables.
    ```bash
    cp .env.example .env.local # If .env.example exists
    ```
    Update the variables in `.env.local` as needed.

### Running the Development Server

Start the development server (with Turbopack):

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `dev`: Runs the app in development mode with Turbopack (`next dev --turbopack`).
- `build`: Builds the app for production (`next build`).
- `start`: Starts the production server (`next start`).
- `lint`: Runs ESLint (`next lint`).

## Folder Structure

```
.
├── app/                  # Next.js App Router directory
│   ├── login/          # Login page route group
│   ├── (protected)/      # Protected routes requiring authentication (e.g., dashboard sections)
│   │   ├── clients/        # Example: Client management section
│   │   ├── users/       # Example: Users section
│   │   ├── dashboard/       # Example: Dashboard section
│   │   └── layout.tsx      # Layout for protected routes (includes Sidebar, Header)
│   ├── legal/            # Legal pages route group
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── favicon.ico       # Favicon
├── components/           # Reusable React components
│   ├── ui/               # Shadcn/ui components (and custom extensions)
│   ├── auth/             # Authentication-related components
│   ├── app-sidebar.tsx
│   ├── data-table.tsx
│   ├── data-table-column-header.tsx
│   ├── data-table-pagination.tsx
│   ├── data-table-row-actions.tsx
│   ├── login-form.tsx
│   ├── nav-main.tsx
│   ├── nav-projects.tsx
│   ├── nav-user.tsx
│   ├── table-skeleton.tsx
│   ├── team-switcher.tsx
│   ├── theme-provider.tsx
│   └── ...               # Other specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions (e.g., cn, date formatting)
├── public/               # Static assets (images, fonts)
├── services/             # API service integrations (e.g., Axios instances)
├── store/                # Redux Toolkit state management (slices, store)
├── helpers/              # General helper functions
├── api/                  # Next.js API route handlers (if used)
├── .next/                # Next.js build artifacts (generated)
├── .git/                 # Git repository data
├── node_modules/         # Project dependencies (managed by npm/yarn/pnpm)
├── .vscode/              # VS Code workspace settings
├── middleware.ts         # Next.js Edge middleware (auth, redirects)
├── next.config.ts        # Next.js configuration file
├── postcss.config.mjs    # PostCSS configuration (for Tailwind CSS)
├── tailwind.config.ts    # Tailwind CSS configuration file (*)
├── components.json       # Shadcn/ui configuration file
├── eslint.config.mjs     # ESLint configuration file
├── package.json          # Project manifest (dependencies, scripts)
├── package-lock.json     # NPM dependency lock file
├── tsconfig.json         # TypeScript configuration file
├── .gitignore            # Specifies intentionally untracked files for Git
├── .env.local            # Local environment variables (untracked)
└── README.md             # This file

(*) Note: `tailwind.config.ts` was inferred based on standard setup; confirm its presence/name.
```

## Key Components

- **`AppSidebar` (`components/app-sidebar.tsx`):** Manages the main sidebar navigation structure.
- **`NavMain`, `NavProjects`, `NavUser` (`components/nav-*.tsx`):** Renders navigation links within the sidebar.
- **`DataTable` (`components/data-table.tsx`):** Core component for displaying tabular data.
- **`DataTablePagination`, `DataTableRowActions`, `DataTableColumnHeader` (`components/data-table-*.tsx`):** Components supporting the data table functionality.
- **`TableSkeleton` (`components/table-skeleton.tsx`):** Skeleton loading component.
- **`LoginForm` (`components/login-form.tsx`):** Handles user login.
- **shadcn/ui components (`components/ui/`):** Various UI primitives used throughout the application.

---
