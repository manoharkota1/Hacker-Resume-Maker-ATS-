# Smart Resume Builder

A powerful resume builder with live template preview, AI-powered content suggestions, ATS score analysis, and cloud storage. Built with Next.js 16, Tailwind CSS v4, Zustand, and Appwrite.

## ✨ Features

### Core Features

- **Dual-pane builder**: Left input forms, right live preview
- **6 Premium Templates**: Modern, Minimal, Classic, Executive, Creative, Tech
- **Drag & drop section ordering**: Customize your resume layout
- **Custom sections**: Add unlimited custom sections
- **PDF & DOCX export**: Download your resume instantly

### AI Features (Premium)

- **AI Resume Writer**: Generate and improve bullet points
- **Smart Summary Generator**: AI-powered professional summaries
- **Skill Suggestions**: Get relevant skill recommendations
- **Job-tailored content**: Optimize content for specific job descriptions

### ATS Score Analysis

- **Keyword matching**: Compare resume against job descriptions
- **Score breakdown**: Detailed analysis of each section
- **Missing keywords**: See what keywords to add
- **Improvement suggestions**: Actionable tips to improve your score

### Cloud Storage (Appwrite)

- **Save to cloud**: Store multiple resumes online
- **Auto-sync**: Changes saved automatically
- **Multiple resumes**: Create and manage different versions

### Customization Options

- **3 Font families**: Geist, Inter, Serif
- **3 Header layouts**: Left, Center, Split
- **2 Density modes**: Cozy, Compact
- **Section dividers**: Toggle horizontal lines on/off
- **Resizable sidebar**: Drag to adjust panel width

## 🚀 Quickstart

```bash
npm install
npm run dev
# open http://localhost:3000
```

## ⚙️ Environment Setup

Copy `.env.local.example` to `.env.local` and configure:

```env
# Appwrite Configuration (for cloud storage)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=resume-builder
```

### Appwrite Setup

1. Create account at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a new project
3. Create a database named `resume-builder`
4. Create a collection named `resumes` with attributes:
   - `userId` (string, required)
   - `title` (string, required)
   - `data` (string, required) - JSON stringified resume
   - `isDefault` (boolean)
5. Add your project ID to `.env.local`

## 📜 Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run lint`  | Run ESLint               |
| `npm run start` | Start production server  |

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **State**: Zustand with persist middleware
- **Backend**: Appwrite (Database, Auth)
- **ATS Analysis**: Local NLP (no API required!)
- **Export**: Browser print API (PDF), HTML blob (DOCX)

## 📁 Project Structure

```
├── app/
│   └── page.tsx             # Main builder page
├── lib/
│   └── ats/
│       └── localAnalyzer.ts # Local ATS analysis engine
├── components/builder/
│   ├── ATSAnalyzerV2.tsx    # ATS score analyzer (local NLP)
│   ├── CloudSave.tsx        # Appwrite storage
│   └── ResumePreview.tsx    # Template rendering
├── lib/
│   ├── appwrite/            # Appwrite client & hooks
│   ├── export/              # PDF/DOCX export
│   └── state/               # Zustand store
└── types/                   # TypeScript types
```

## 🎨 Templates

| Template  | Description                        |
| --------- | ---------------------------------- |
| Modern    | Clean with accent colors and pills |
| Minimal   | Simple left-border design          |
| Classic   | Traditional serif typography       |
| Executive | Bold headers, accent bar           |
| Creative  | Gradient header, colorful tags     |
| Tech      | Developer-focused, code styling    |

## 📝 License

MIT
