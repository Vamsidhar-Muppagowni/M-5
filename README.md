# Multilingual Digital Marketplace for Indian Farmers

A comprehensive platform connecting farmers directly with buyers, featuring real-time market prices, AI-based price predictions, and multilingual support.

## Tech Stack
- **Backend**: Node.js, Express, PostgreSQL, Redis
- **Frontend**: React Native (Expo)
- **ML Service**: Python (Flask, Scikit-learn)

## Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- PostgreSQL
- Redis Server

## Setup Instructions

### 1. Database Setup
Ensure PostgreSQL and Redis are running.
Create a database named `farmer_marketplace` (or as defined in `backend/.env`).

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The server will run on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npx expo start
```
Scan the QR code with Expo Go app on your phone.

### 4. ML Service Setup
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```
The ML service will run on `http://localhost:5001`.

## Features
- **Multilingual Support**: English, Hindi, Tamil, Telugu
- **Real-time Bidding**: Socket.io integration
- **AI Price Prediction**: Machine learning based market insights
- **SMS Integration**: Offline access for farmers
