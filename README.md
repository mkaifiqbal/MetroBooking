# 🚇 MoveInSync Metro Booking App - Built with React

Hey there! 👋 Welcome to the **MoveInSync Metro Booking Service**. 

If you are looking for a clean, modern transit app built with React, you are in the right place. This project is a complete front-end solution that includes a smart **journey planner** for passengers to find their way, and a powerful **admin dashboard** to manage the whole metro network. 

Whether you want to explore how an interactive SVG map works in React, or how to manage complex state with Zustand, this project has you covered.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![Zustand](https://img.shields.io/badge/Zustand-5-orange)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)

---
Live Demo - [https://metro-booking-alpha.vercel.app/](https://metro-booking-alpha.vercel.app/)
## 📋 Table of Contents

- [✨ What Can It Do? (Features)](#-what-can-it-do-features)
- [🛠 What's Under the Hood? (Tech Stack)](#-whats-under-the-hood-tech-stack)
- [🚀 How to Run It on Your Computer](#-how-to-run-it-on-your-computer)
- [📁 Simple Project Structure](#-simple-project-structure)
- [🧠 How We Built It (Architecture & Design)](#-how-we-built-it-architecture--design)
- [📊 How to Upload CSV Files](#-how-to-upload-csv-files)

---

## ✨ What Can It Do? (Features)

We divided the app into two main experiences: one for the riders, and one for the network managers.

### 🧍 For Passengers (The Riders)
* **Smart Journey Planner:** Just type in where you are and where you want to go. The app instantly finds the shortest route with the fewest transfers using a Breadth-First Search (BFS) algorithm.
* **Interactive Metro Map:** Zoom in, pan around, and click on stations. It feels just like a real maps app.
* **QR Code Tickets:** Once you book a route, you get a digital ticket with a downloadable QR code.
* **Recent Searches:** It remembers your past trips so you can book them again quickly.
* **Dark & Light Mode:** Easy on the eyes, day or night!

### ⚙️ For Admins (The Managers)
* **Visual Network Builder:** Click anywhere on the map to add a new station exactly where you want it.
* **Draw Metro Lines:** Connect stations by clicking them in order to create a new train line.
* **Easy Editing:** Need to change a station's order? Just drag and drop it in the list.
* **Bulk CSV Upload:** Got a massive list of stations? Upload a simple CSV file to build your network in seconds.

---

## 🛠 What's Under the Hood? (Tech Stack)

We kept the tech stack modern and fast:

| What we used | Why we used it |
| :--- | :--- |
| **React 19 & Vite 7** | For building a super fast and responsive user interface. |
| **Zustand 5** | To manage the app's data (state) easily without the headache of Redux. |
| **React Router DOM 7** | To handle moving between the passenger and admin pages smoothly. |
| **Tailwind CSS** | To style the app quickly with a beautiful "frosted glass" look. |
| **react-zoom-pan-pinch** | To make the metro map interactive and smooth to explore. |
| **@dnd-kit** | To let admins easily drag and drop stations to reorder them. |

---

## 🚀 How to Run It on Your Computer

It's super easy to get this running locally. You just need to have **Node.js** installed on your computer.

**Step 1:** Download the code
~~~bash
git clone https://github.com/mkaifiqbal/MetroBooking
cd MetroBooking
~~~

**Step 2:** Install the tools it needs
~~~bash
npm install
~~~

**Step 3:** Start the app!
~~~bash
npm run dev
~~~
That's it! Open your browser and go to **http://localhost:5173** to see it live.

---

## 📁 Simple Project Structure

We organized the code so it's easy to read and understand. Here is the simplified view:

~~~text
MetroBooking/
├── public/               # Images, icons, and static assets
├── src/
│   ├── components/       # The building blocks of the app
│   │   ├── molecules/    # Small pieces like the Search Bar
│   │   └── organisms/    # Big pieces like the Network Map and Admin Panel
│   ├── data/             # The default metro network data (metroData.json)
│   ├── store/            # Zustand files that hold our app's memory (stations, themes)
│   ├── App.jsx           # The main layout and pages
│   └── index.css         # Global styles and dark/light mode colors
└── package.json          # Project info and dependencies
~~~

---

## 🧠 How We Built It (Architecture & Design)

Here are a few cool things about how the app works behind the scenes:

* **One Source of Truth:** We use Zustand (`useAdminStore`) to hold all the station and line data. If an admin deletes a station, the passenger's search bar updates instantly because everything reads from the same place.
* **Finding the Best Route:** We use a simple algorithm called **Breadth-First Search (BFS)**. Since traveling between any two stops takes about the same amount of time, BFS naturally figures out the path with the fewest stops and transfers.
* **Crisp Maps:** Instead of using heavy image files, the whole map is drawn using **SVG** (Scalable Vector Graphics). This means no matter how far you zoom in, the map never gets blurry.
* **No Backend Required:** Everything runs right in your browser! It loads a default map from a `.json` file when you start it up, making it incredibly easy to host anywhere for free (like GitHub Pages or Vercel).
* **Glass Design:** We used CSS properties to create a modern, semi-transparent frosted glass look (`backdrop-filter: blur`). Switching between light and dark mode just changes a few CSS variables instantly.

---

## 📊 How to Upload CSV Files

If you want to add lots of stations or lines at once in the Admin panel, you can upload a CSV file. The app even checks for mistakes before saving!

### Adding Stations (stations.csv format)
Make sure your file has these columns:

| Column | Is it required? | What is it? |
| :--- | :--- | :--- |
| `id` | Yes | A unique short code (like `s21`) |
| `name` | Yes | The station's name (like `Central Hub`) |
| `x` | Yes | Left-to-right map position (0 to 1000) |
| `y` | Yes | Top-to-bottom map position (0 to 750) |
| `facilities` | No | Extra info separated by a pipe (like `parking|wifi`) |

### Adding Lines (lines.csv format)
Make sure your line files look like this:

| Column | Is it required? | What is it? |
| :--- | :--- | :--- |
| `id` | Yes | A unique short code (like `l7`) |
| `name` | Yes | The line's name (like `Orange Line`) |
| `color` | Yes | A hex color code (like `#f97316`) |
| `stations` | Yes | The station IDs in order, separated by a pipe `|` (e.g., `s1|s2|s3`) |

> **Quick Note:** When you import a new line, the app will make sure all those stations (`s1`, `s2`, etc.) actually exist in the system first!

