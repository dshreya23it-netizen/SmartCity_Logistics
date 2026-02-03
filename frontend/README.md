# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Smart City Logistics Management System

## Technologies Used
- React (Vite)
- Node.js & Express
- MongoDB
- Firebase Authentication
- Firebase Firestore & Realtime Database

## Features
- Secure login using Firebase Authentication
- Real-time updates using Firebase
- CRUD operations using MongoDB
- Aggregation & indexing in MongoDB
- Smart City sensor-based logistics dashboard

## MongoDB Implementation
- Database: smartcity
- Collections: sensors
- Aggregation using $group
- Index on sensorId for fast queries

## Firebase
- Email/Password Authentication
- Firestore for live data sync
- Realtime DB for sensor updates
- Authenticated access rules

## Screens
1. Login / Signup
2. Sensor Data Entry
3. Logistics Dashboard

## How to Run
### Backend
