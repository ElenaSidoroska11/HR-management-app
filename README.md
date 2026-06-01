# HR Management App

A Next.js application for managing employees, projects, and assignments. Drag employees onto project boards, track vacations, and manage supervisors — all backed by Firebase Firestore.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

To run the app locally you need Firebase credentials in a `.env.local` file. You can **use your own Firebase project** (recommended if you want a private backend) or use the shared demo project — see [Get Firebase credentials](#3-get-firebase-credentials) below.

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

The app reads Firebase config from environment variables. Create a `.env.local` file in the project root and add your values — the app will connect to whichever Firebase project those credentials point to.

#### Option A — Your own Firebase project (recommended)

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore** (create a database in test mode for local development, or configure rules that allow your use case).
3. Add a **Web app** to the project and copy the Firebase config object.
4. Create `.env.local` in the project root with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Firestore collections (`employees`, `projects`, `assignments`, `vacations`, `supervisors`) are created automatically when you use the app.

#### Option B — Shared demo credentials

If you prefer not to set up Firebase yourself, email [elena.sidoroska2@gmail.com](mailto:elena.sidoroska2@gmail.com) and I will send credentials for the shared demo project. Paste them into `.env.local` using the same variable names as above.

After saving `.env.local`, restart the dev server if it is already running.

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


