# BeatyOS Frontend

This project is a frontend application built with Next.js, featuring a dashboard interface with a sidebar, data table, and authentication. It utilizes shadcn/ui for components and Tailwind CSS for styling.

## Features

- **Responsive Sidebar Navigation:** Collapsible sidebar for navigating different sections of the application.
- **Data Table:** Displays paginated data with loading states and skeleton UI.
- **Pagination:** Custom pagination component for navigating through table data.
- **Theme Toggle:** Allows users to switch between light and dark modes.
- **Authentication:** Basic login page setup.
- **UI Components:** Leverages shadcn/ui for pre-built, accessible components like Buttons, Tables, Dropdowns, etc.
- **TypeScript:** Built with TypeScript for type safety.
- **Tailwind CSS:** Styled using Tailwind CSS utility classes.

## Technologies Used

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide React](https://lucide.dev/) (for icons)
- [ESLint](https://eslint.org/) (for linting)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm, pnpm, or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
    cd beatyos-front
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Folder Structure

```
.
├── app/                  # Next.js App Router directory
│   ├── (login)/          # Login page route group
│   ├── dashboard/        # Dashboard route group
│   │   ├── table/        # Data table page
│   │   └── page.tsx      # Dashboard main page
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── auth/             # Authentication related components
│   ├── ui/               # shadcn/ui components and custom UI elements
│   ├── app-sidebar.tsx   # Main application sidebar
│   ├── data-table.tsx    # Data table implementation
│   ├── nav-main.tsx      # Main navigation logic for sidebar
│   ├── table-skeleton.tsx # Skeleton loader for the table page
│   └── ...
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions (e.g., cn for classnames)
├── public/               # Static assets
├── services/             # API service integrations (if any)
├── store/                # State management (if any)
├── middleware.ts         # Next.js middleware for auth/routing
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Key Components

- **`AppSidebar` (`components/app-sidebar.tsx`):** The main sidebar component managing navigation structure.
- **`NavMain` (`components/nav-main.tsx`):** Renders the primary navigation links within the sidebar.
- **`DataTable` (`components/data-table.tsx`):** Core component for displaying tabular data with features like pagination and status badges.
- **`Pagination` (`components/ui/pagination.tsx`):** Reusable pagination controls.
- **`Skeleton` & `SkeletonPagination` (`components/ui/skeleton.tsx`):** Skeleton loading components for improved UX.
- **shadcn/ui components (`components/ui/`):** Various components like `Button`, `Table`, `DropdownMenu`, `Input`, `Label`, etc., used throughout the application.

---

This README provides a basic overview. Feel free to expand it with more details about deployment, specific features, or contribution guidelines.

# BeautyOS-Front
