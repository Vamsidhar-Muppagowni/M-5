# Backend Master Guide: Multilingual Digital Marketplace for Farmers

This guide is designed for developers and evaluators to understand, run, and extend the backend system.

## 1. Project Structure Analysis

The backend follows a standard **MVC (Model-View-Controller)** architecture built with Node.js and Express.

### Folder Purpose
- **`/config`**: Configuration files (Database, Redis, etc.) keeping sensitive info out of main code.
- **`/controllers`**: The "Brain". Handles logic. It receives requests from routes, talks to models, and sends responses.
- **`/models`**: The "Data Structure". Defines how data (Users, Crops) looks in the database using Sequelize ORM.
- **`/routes`**: The "Traffic Controller". Maps URLs (e.g., `/api/login`) to specific controller functions.
- **`/middleware`**: The "Security Guards". Checks if a user is logged in (`auth.js`), validates data, or handles errors.
- **`/services`**: External integrations (SMS, ML Service, Weather API). Keeping this separate makes the code cleaner.

### Request Flow
1. **Client** (App/Postman) sends HTTP Request -> `POST /api/auth/login`
2. **Server** (`server.js`) receives it and passes it to -> `routes/auth.js`
3. **Route** sends it to -> `controllers/authController.js` (login function)
4. **Controller**:
   - Validates input.
   - Calls **Model** (`models/User.js`) to find user.
   - Compares password.
   - Generates JWT Token.
5. **Response**: Server sends back JSON data + Token.

---

## 2. How to Run Locally

### Prerequisites
- Node.js (v18+)
- Redis (Optional, code handles fallback)
- SQLite (Default) or PostgreSQL

### Setup Steps
1. **Navigate to backend**:
   ```bash
   cd backend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Ensure `USE_SQLITE=true` is set for easiest setup.
4. **Start Server**:
   ```bash
   npm run dev
   ```
   *Note: `npm run dev` uses nodemon to restart on changes.*

---

## 3. API & Architecture Implementation

### Key Features Implemented:
- **Authentication**: JWT-based. Registers users with OTP (simulated in dev), supports Roles (Farmer, Buyer).
- **Marketplace**: 
  - Farmers list crops (`POST /api/market/crop`)
  - Buyers bid (`POST /api/market/bid`)
  - Negotiation flow (`POST /api/market/bid/respond`)
- **ML Integration**:
  - Price Prediction (`POST /api/ml/predict-price`)
  - Crop Recommendation (`POST /api/ml/recommend-crop`)

### Clean Architecture Improvements
- **Service Layer**: Logic for ML and SMS is separated into `services/`, keeping controllers thin.
- **Repository Pattern**: We use Sequelize models directly, which is fine for this scale, but wrapping them in repositories would be the next step for enterprise apps.

---

## 4. Database Schema (PostgreSQL/SQLite)

Table relationships are defined in `models/index.js`.

- **Users**: Central identity (Phone, Name, Role).
- **Profiles**: `FarmerProfile` and `BuyerProfile` extend User.
- **Crops**: Listed items. Linked to Farmer (User).
- **Bids**: Offers on crops. Linked to Buyer (User) and Crop.
- **Transactions**: Configured deals.
- **PriceHistory**: Historical data for ML.

**Relationship Logic:**
- A **Farmer** generally has many **Crops**.
- A **Crop** has many **Bids**.
- A **Transaction** belongs to one **Crop**, one **Buyer**, and one **Farmer**.

---

## 5. ML Service Integration

The backend acts as a **Gateway** to the Python ML Service.

- **Flow**: Node.js Backend receives request -> Prepares data -> Sends HTTP POST to Flask (`http://localhost:5001`) -> Returns prediction to App.
- **Fallback**: If ML service is down, `mlService.js` has a logic-based fallback (e.g., returns average price) so the app doesn't crash.

---

## 6. Testing (Postman)

Import these into Postman.

### A. Auth
**Register Farmer**:
`POST /api/auth/register`
```json
{
  "phone": "9876543210",
  "name": "Ramesh Farmer",
  "password": "password123",
  "user_type": "farmer",
  "language": "hi"
}
```

### B. Market
**List Crop (Token Required)**:
`POST /api/market/crop`
```json
{
  "name": "Wheat",
  "quantity": 100,
  "min_price": 2000,
  "location": { "district": "Punjab" }
}
```

---

## 7. Viva / Interview Prep

**Q: Why Node.js?**
A: Non-blocking I/O handles multiple requests efficiently (good for marketplace traffic). Same language (JS) as frontend.

**Q: How does the ML integration work?**
A: We use a Microservices pattern. The Node backend talks to the Python FLASK service via HTTP REST APIs.

**Q: How do you handle database failures?**
A: We use Sequelize ORM with connection pooling. In local dev, we fallback to SQLite if Postgres is missing.

**Q: Security measures?**
A: 
- **Helmet**: Secures HTTP headers.
- **Rate Limiting**: Prevents DDoS.
- **JWT**: Stateless authentication.
- **Bcrypt**: Password hashing.
