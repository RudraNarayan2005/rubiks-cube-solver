# Rubik's Cube Solver 🧩

A full-stack **Rubik's Cube Solver Web Application** that allows users to select cube size, input cube colors, and generate solving steps.

The project consists of:

* **Backend API** built with Python using FastAPI
* **Frontend UI** built with React and Vite

---

## 🚀 Features

* Select cube size (2×2, 3×3, 4×4)
* Input cube colors
* Generate cube solving moves
* Interactive UI
* Backend API for solving logic

---

## 🛠️ Tech Stack

### Backend

* Python
* FastAPI
* Uvicorn

### Frontend

* React
* Vite
* Axios

### Other Tools

* Git
* Node.js
* npm

---

## 📁 Project Structure

rubiks-cube-solver
│
├── backend
│   ├── main.py
│   ├── requirements.txt
│
├── frontend
│   ├── src
│   ├── package.json
│   ├── vite.config.js
│
├── start.sh
├── README.md
└── .gitignore

---

## ⚙️ Installation

### 1️⃣ Clone the repository

git clone https://github.com/yourusername/rubiks-cube-solver.git

cd rubiks-cube-solver

---

### 2️⃣ Install Backend Dependencies

cd backend

pip install -r requirements.txt

---

### 3️⃣ Run Backend Server

uvicorn main:app --reload --port 8000

Backend will run at:

http://localhost:8000

---

### 4️⃣ Install Frontend Dependencies

cd ../frontend

npm install

---

### 5️⃣ Run Frontend

npm run dev

Frontend will run at:

http://localhost:5173

---

## ▶️ Run Entire Project (Optional)

You can start both backend and frontend using:

./start.sh

---

## 📡 API Endpoint

POST /solve

Example Request:

{
"size": 3,
"faces": {}
}

Example Response:

{
"algorithm": "CFOP",
"moves": ["R","U","R'","U'"]
}

---

## 📸 Screenshots

(Add screenshots of your project UI here)

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repository and submit pull requests.

---

## 📜 License

This project is for educational purposes.

---

## 👨‍💻 Author

Rudra Narayan Rout
