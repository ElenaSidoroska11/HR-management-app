# HR Management App

A Next.js application for managing employees, projects, and assignments. Drag employees onto project boards, track vacations, and manage supervisors — all backed by Firebase Firestore.

## Prerequisites

- [Node.js](https://nodejs.org/) 
- [npm](https://www.npmjs.com/)

You do **not** need to create a Firebase account or set up anything in the Firebase Console. The backend is already configured — you only need credentials to connect locally.

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd hr-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get Firebase credentials

To run and test the application locally, you need Firebase environment variables.

**You do not need to set up Firebase yourself.** Email me at [elena.sidoroska2@gmail.com] and I will send you the credentials.

Once you receive them, create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and paste in the values I send you. It should look like this:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

After saving `.env.local`, the app will connect to the shared Firebase project and you can browse, add, and edit data like in a live demo.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command         | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Start the development server   |
| `npm run build` | Build for production           |
| `npm run start` | Run the production build       |
| `npm run lint`  | Run ESLint                     |

## Tech Stack

- **Next.js** (App Router)
- **React**
- **Firebase** (Firestore)
- **Tailwind CSS**
- **@dnd-kit** (drag and drop)


