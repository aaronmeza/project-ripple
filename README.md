# 🎓 Databrook

**Databrook** is a social learning platform for outcome-based education. Our mission is to organize the world's learning outcomes and help learners master them through the best community-curated video explanations.

---

## 🧠 Key Features

- 📚 **Outcome-first learning** – Browse structured learning outcomes by subject or diploma path.
- ▶️ **Video-based mastery** – Watch community-submitted videos that explain each outcome.
- 👍 **Upvoting system** – Learners can upvote the most helpful videos (one vote per user per video).
- 🧭 **Course mapping** – Each outcome is linked to its parent course for easy navigation.
- 🧵 **Playlist UI** – Embedded YouTube player with a curated playlist layout for each outcome.

---

## 🚀 Tech Stack

- **Next.js** (App Router)
- **Supabase** (PostgreSQL + Auth + RPC + Storage)
- **TailwindCSS** (Utility-first styling)
- **TypeScript** (Strong typing)
- **Turbopack** (Blazing fast dev experience)

---

## 🗃️ Database Design

### Tables

- `users` – Linked to Supabase auth users
- `courses` – Collections of learning outcomes
- `outcomes` – Core units of learning, linked to a course
- `videos` – Community-submitted video explanations
- `video_upvotes` – Join table to track user upvotes on videos

### Triggers

- Automatically sync `videos.upvote_count` based on `video_upvotes`

---

## 🔐 Auth

- Google Auth via Supabase
- Authenticated users can submit and upvote videos

---

## 🛠️ Local Development

1. **Install dependencies**

   ```bash
   npm install
	```
2.	**Run locally**

	```bash
	npm run dev
	```
3. **Connect to Supabase**

	Create a .env.local file with your Supabase
	```env
	
	    NEXT_PUBLIC_SUPABASE_URL=your-project-url
	    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
4. **Tailwind config**

Tailwind is configured in tailwind.config.js and used throughout with utility classes.

## Setup Instructions

✅ Setup Instructions
Replace:

your-project-ref with your actual Supabase project ref (you can find this in the Supabase dashboard URL).

your_user:your_password with your DB credentials (ideally set via .env).

Optional: make PG_CONN dynamic by reading from .env.

Run:
	
	bash
	Copy
	Edit
	make install
	make init
	make link
	make pull
	
To update the init sql script with any schema changes:

Run:

	make init-sql
	
To update the seed data from live data:

Run:

	make seed
	

## ✨ Planned Features
- User submissions for new videos
- Personalized progress tracking
- Diploma-level learning paths
- AI-curated video suggestions based on learning style

## 🤝 Contributing
Pull requests are welcome! If you're interested in contributing, feel free to open an issue or reach out.

## 📄 License
MIT License. See LICENSE file for details.

Built with 💚 by lifelong learners.

