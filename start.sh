#!/bin/bash

echo "Starting Rubik's Solver Project..."

# -------------------------
# Start Backend
# -------------------------
echo "Starting Backend Server..."
cd backend

# install python dependencies
pip install -r requirements.txt

# run FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &

# go back to root
cd ..

# -------------------------
# Start Frontend
# -------------------------
echo "Starting Frontend..."
cd frontend

# install node modules
npm install

# start vite dev server
npm run dev