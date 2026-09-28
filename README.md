# ExpenseFlow 💰📊

> **Track your money. Understand your spending.**
> 
> A modern, responsive Full-Stack Expense Tracker Web Application built for portfolio showcase and assessment in Full Stack Technologies.

---

## 1. Project Overview

**ExpenseFlow** is a web-based financial management platform that empowers users to effortlessly record, track, categorize, and analyze their daily income and expenses. The application bridges the gap between client interactions and database persistence, demonstrating a complete **Frontend → REST API → Express Backend → MongoDB** architecture.

Designed with clean typography, soft card elevations, and a cohesive lavender-purple design system, ExpenseFlow delivers an intuitive personal finance experience without the bloat of heavy front-end frameworks.

---

## 2. Features

- 💼 **Comprehensive Financial Dashboard**: Instant visibility into Total Balance, Total Income, Total Expenses, and Database Transaction Count.
- ⚡ **Seamless Full-Stack CRUD**:
  - **Create**: Add transactions with title, amount, type, category, date, and description.
  - **Read**: Fetch and display dynamic transaction logs directly from MongoDB.
  - **Update**: Edit existing transactions via intuitive modal windows with prefilled data.
  - **Delete**: Safely remove transactions with confirmation modals and auto-refresh.
- 📊 **Visual Spending Analytics**: Interactive category-wise expense breakdown powered by Chart.js with responsive sizing and tooltips.
- 🔍 **Advanced Filtering & Search**:
  - Instant live search across transaction titles, categories, and descriptions.
  - Type-based filtering (`All`, `Income`, `Expense`).
  - Category-based filtering (`Food`, `Transport`, `Shopping`, `Entertainment`, `Bills`, `Education`, `Healthcare`, `Other`).
  - Monthly filtering using native date pickers.
  - Sorting by newest, oldest, highest amount, and lowest amount.
- 📱 **Fully Responsive UI**: Mobile-first design that adapts from high-resolution desktop screens to smartphones with collapsible navigation.
- 🔔 **Interactive Feedback**: Non-intrusive toast notifications confirming actions and providing clear error validation.
- 🛡️ **Defensive Validation**: Client-side and server-side schema validation (no negative amounts, required fields, sanitized inputs).

---

## 3. Tech Stack

### Frontend
- **HTML5**: Semantic document structure.
- **CSS3**: Custom design system featuring CSS variables, grid/flexbox layouts, glassmorphic modals, and responsive media queries.
- **Vanilla JavaScript (ES6+)**: Pure asynchronous JavaScript (`fetch`, async/await, DOM manipulation) without external frameworks.
- **Chart.js**: Lightweight analytics rendering.

### Backend
- **Node.js**: Asynchronous event-driven JavaScript runtime environment.
- **Express.js**: Fast, minimalist web framework for building REST APIs and serving static assets.
- **CORS & Dotenv**: Cross-origin resource sharing and environment variable isolation.

### Database
- **MongoDB**: NoSQL document database.
- **Mongoose**: Elegant MongoDB object modeling for Node.js with strict schema definitions.
- **MongoDB Atlas / Local MongoDB**: Cloud or local database hosting.

### Version Control & Tools
- **Git & GitHub**: Version tracking and source code hosting.
- **VS Code**: Primary development IDE.

---

## 4. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   CLIENT (BROWSER)                     │
│   HTML5 / Modern CSS3 / Vanilla JavaScript (ES6+)      │
│   - Dashboard (index.html)                             │
│   - Transactions Management (transactions.html)        │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTP Requests (JSON / REST API)
                            │
┌───────────────────────────▼────────────────────────────┐
│                  EXPRESS BACKEND                       │
│   Node.js (Port: 5000)                                 │
│   - server.js (Middlewares & Static Serving)           │
│   - routes/transactionRoutes.js                        │
│   - controllers/transactionController.js               │
└───────────────────────────┬────────────────────────────┘
                            │
                   Mongoose ODM Driver
                            │
┌───────────────────────────▼────────────────────────────┐
│                 DATABASE (MONGODB)                     │
│   MongoDB Atlas / Local mongod                         │
│   - Database: expenseflow                              │
│   - Collection: transactions                           │
└────────────────────────────────────────────────────────┘
```

---

## 5. Project Structure

```text
ExpenseFlow/
│
├── backend/
│   ├── config/
│   │   └── db.js                        # MongoDB Mongoose connection handler
│   │
│   ├── controllers/
│   │   └── transactionController.js     # Full CRUD business logic & stats
│   │
│   ├── models/
│   │   └── Transaction.js               # Mongoose transaction schema & model
│   │
│   ├── routes/
│   │   └── transactionRoutes.js         # REST API route declarations
│   │
│   ├── seed.js                          # Database seeder with realistic test data
│   ├── server.js                        # Express server entry point & static host
│   └── .env                             # Environment variables (git-ignored)
│
├── frontend/
│   ├── css/
│   │   └── style.css                    # Professional responsive stylesheet
│   │
│   ├── js/
│   │   ├── dashboard.js                 # Dashboard logic, charts, quick add
│   │   └── transactions.js              # Search, filter, sorting, table view
│   │
│   ├── index.html                       # Main dashboard landing page
│   └── transactions.html                # Dedicated all-transactions view
│
├── .env.example                         # Environment variable template
├── .gitignore                           # Git ignore rules for node_modules and .env
├── package.json                         # Project metadata and dependencies
└── README.md                            # Comprehensive project documentation
```

---

## 6. REST API Endpoints

All transaction endpoints use the base URL: `/api/transactions`

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/transactions` | Retrieve all transactions (supports query filters) | None | `{ success: true, count: N, data: [...] }` |
| **GET** | `/api/transactions/:id` | Retrieve single transaction by ID | None | `{ success: true, data: {...} }` |
| **POST** | `/api/transactions` | Create a new transaction | `{ title, amount, type, category, date, description }` | `{ success: true, message: "...", data: {...} }` |
| **PUT** | `/api/transactions/:id` | Update existing transaction | Updated transaction fields | `{ success: true, message: "...", data: {...} }` |
| **DELETE**| `/api/transactions/:id` | Delete transaction from database | None | `{ success: true, message: "...", data: {} }` |
| **GET** | `/api/transactions/summary/stats` | Pre-computed financial summary & category expenses | None | `{ success: true, data: { totalBalance, ... } }` |
| **GET** | `/api/health` | Server health check | None | `{ status: "online", ... }` |

### Sample Transaction Object
```json
{
  "_id": "673cf910f1c3e26c559584da",
  "title": "Grocery Supermarket",
  "amount": 3200,
  "type": "Expense",
  "category": "Food",
  "date": "2026-09-28T00:00:00.000Z",
  "description": "Weekly organic groceries and fruits",
  "createdAt": "2026-09-28T05:10:00.000Z",
  "updatedAt": "2026-09-28T05:10:00.000Z"
}
```

---

## 7. MongoDB Database Design

- **Database Name**: `expenseflow`
- **Collection Name**: `transactions`

### Schema Validation Rules

| Field | Type | Validation & Constraints |
| :--- | :--- | :--- |
| `title` | `String` | Required, trimmed, max 100 characters |
| `amount` | `Number` | Required, strictly positive (`min: 0.01`) |
| `type` | `String` | Required, Enum: `['Income', 'Expense']` |
| `category` | `String` | Required, Enum: `['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Healthcare', 'Other']` |
| `date` | `Date` | Required, defaults to `Date.now` |
| `description` | `String` | Optional, trimmed, max 300 characters |
| `createdAt` / `updatedAt` | `Date` | Managed automatically by Mongoose timestamps |

---

## 8. Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### Step 1: Clone the Repository
```bash
git clone https://github.com/ramzyyyy1124/expense-tracker.git
cd expense-tracker
```

### Step 2: Install Dependencies
```bash
npm install
```
*(On Windows PowerShell, use `npm.cmd install` if script execution is restricted).*

### Step 3: Configure Environment Variables
Create a `.env` file in the root folder (or inside `backend/`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expenseflow
```
*For MongoDB Atlas, paste your cloud connection string:*
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/expenseflow?retryWrites=true&w=majority
```

### Step 4: Seed Sample Data (Optional but Recommended)
Populate realistic sample records to immediately view dashboard analytics:
```bash
npm run seed
```

---

## 9. How to Run the Application

### Option A: Single Command (Express Hosts Static Frontend)
Run the server:
```bash
npm start
```
Open your browser and navigate to:
- **Dashboard**: [http://localhost:5000](http://localhost:5000)
- **Transactions Page**: [http://localhost:5000/transactions.html](http://localhost:5000/transactions.html)
- **API Endpoint**: [http://localhost:5000/api/transactions](http://localhost:5000/api/transactions)

### Option B: VS Code Live Server
1. Start the backend: `npm start`
2. In VS Code, right-click `frontend/index.html` and choose **"Open with Live Server"**.
*(The frontend automatically detects non-5000 ports and routes API calls to `http://localhost:5000/api/transactions` without any configuration).*

---

## 10. CRUD Demonstration Flow (Viva Presentation)

During an assessment or presentation, demonstrate the four CRUD pillars:

1. **READ**: Open [http://localhost:5000](http://localhost:5000). Show that summary cards, spending doughnut chart, and recent transaction table load live data from MongoDB.
2. **CREATE**: Use the **Quick Add Transaction** form to log an expense (e.g. `Lunch`, `₹250`, `Expense`, `Food`). Note the real-time balance reduction, chart adjustment, and green toast message.
3. **UPDATE**: Click the ✏️ **Edit** button on any transaction. Change the title or amount. Click **Save Changes** to dispatch a `PUT` request and see the updated values instantly.
4. **DELETE**: Click the 🗑️ **Delete** button. Confirm the dialog prompt. Verify that the transaction is purged from MongoDB and financial metrics recalculate immediately.

---

## 11. Future Enhancements

- 🔐 User Authentication (JWT + bcrypt password hashing)
- 👥 Multi-user tenancy and personal workspace switching
- 🎯 Monthly category budgeting with visual progress meters
- 🔁 Recurring transaction scheduling (daily/monthly auto-logging)
- 📥 Export transaction reports to CSV and PDF formats
- ☁️ Production deployment on Render / Vercel with MongoDB Atlas cloud cluster

---

## 12. Author & License

- **Developer**: ExpenseFlow Assessment Team
- **Course**: Portfolio-Driven Assessment in Full Stack Technologies
- **License**: MIT License - Free to use and modify for educational purposes.
