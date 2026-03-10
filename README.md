# ⚡ Premium Portfolio & Personal Brand Website

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

> A high-performance, visually stunning portfolio website built with modern web technologies. Designed to showcase projects and skills with a "Cyber-Slate" aesthetic, 3D elements, and seamless animations.

---

## 🚀 Overview

This project is a **Full-Stack Web Application** designed to be the ultimate personal branding tool. It combines a highly interactive React frontend with a robust FastAPI backend, ensuring both visual appeal and technical scalability.

### ✨ Key Features

- **🎨 Cyber-Slate Design**: A unique dark-mode aesthetic with Electric Cyan accents.
- **⚡ High-Performance Architecture**: Powered by React 19 and FastAPI.
- **🎭 Advanced Animations**: Utilizing **GSAP** and **Framer Motion** for butter-smooth transitions and 3D effects.
- **📱 Fully Responsive**: Optimized for all devices using **Tailwind CSS**.
- **🔌 Robust Backend**: Asynchronous API endpoints with **FastAPI** and **MongoDB**.
- **🧩 Component-Driven**: Built with **Radix UI** primitives for accessible and reliable UI components.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Create React App](https://create-react-app.dev/) / Webpack
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Tailwind Merge
- **Animations**: [GSAP](https://greensock.com/gsap/), [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) (Icons)
- **State/Forms**: React Hook Form, Zod

### Backend (Server)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (using Motor for async)
- **Validation**: Pydantic
- **Authentication**: JWT, BCrypt (Ready for implementation)

---

## 🔧 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB** (running locally or a cloud instance)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/portfolio.git
cd portfolio
```

### 2️⃣ Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
# Create a virtual environment (recommended)
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=portfolio_db
CORS_ORIGINS=http://localhost:3000
```

Start the server:

```bash
python server.py
# OR using uvicorn directly
uvicorn server:app --reload
```
The API will be available at `http://localhost:8000` (or the port specified in your console).

### 3️⃣ Frontend Setup

Open a new terminal, navigate to the frontend directory:

```bash
cd frontend
# Install dependencies
npm install
# OR
yarn install
```

Start the development server:

```bash
npm start
# OR
yarn start
```
The application will open at `http://localhost:3000`.

---

## 📂 Project Structure

```plaintext
portfolio/
├── backend/                 # FastAPI Server
│   ├── server.py            # Entry point
│   ├── requirements.txt     # Python dependencies
│   └── ...
├── frontend/                # React Client
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Utilities (utils, styles)
│   │   └── ...
│   ├── package.json         # JS dependencies
│   └── tailwind.config.js   # Tailwind configuration
└── README.md                # Project documentation
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Contact

**Sai Shashank** - [LinkedIn Profile](https://linkedin.com/in/your-profile) - email@example.com

Project Link: [https://github.com/your-username/portfolio](https://github.com/your-username/portfolio)
