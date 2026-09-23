# HabitFlow AI

HabitFlow AI is an AI-powered habit tracking and coaching web app that helps you build sustainable daily routines through intelligent guidance, daily reflection, and personalized affirmations. It's built as a single, beautifully designed companion that replaces the need for separate habit trackers, journaling apps, and motivational tools.

What It Does

FeatureWhat it lets you doDashboardSee your weekly consistency at a glance — streaks, completion rates, and today's habits in one viewAI CoachChat with a conversational AI coach that adapts its guidance to your actual habits, goals, and reflections (powered by Lovable AI Gateway)HabitsCreate, complete, edit, and track daily habits across wellness, mind, body, and focus categoriesGoalsDefine long-term goals (e.g. "Read 12 books this year") with progress percentages that inform the AI's coachingReflectionWrite daily journal entries and get a short AI-generated insight per reflectionAffirmationsGenerate personalized affirmations from your goals and save your favoritesRemindersSchedule timed cues (e.g. morning check-in, evening reflection) to keep momentum

How It Works Behind the Scenes

Frontend: React 19 + TanStack Start, styled with a dark "glassy premium" theme (deep obsidian-emerald palette, Playfair Display headings, glassmorphism effects)

AI: Your habits, goals, and reflections are sent as context to an AI model via the Lovable AI Gateway, so the coach responds with personalized, relevant guidance rather than generic tips

Data: Everything you track is saved locally in your browser (localStorage) — no account needed, and your data stays private on your device

The Core Idea

Most habit apps fail users by being mechanical and generic. HabitFlow AI solves this by unifying habit tracking, goal-setting, reflection, affirmations, and an always-available AI coach into one experience — giving you a thoughtful, personalized coach that understands your context at zero ongoing cost. please build the application for me

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1f7abbd4-b12e-4a82-81ef-cb6f20c4de06).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
