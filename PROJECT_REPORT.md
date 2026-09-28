# EXPENSEFLOW – PROJECT REPORT
### Portfolio-Driven Assessment for Full Stack Technologies
**Submission Date: 28 September 2026**

---

## 1. Introduction

Managing personal finances is one of the most critical daily life skills, yet individuals frequently lose track of where their money goes. **ExpenseFlow** is a modern, lightweight, full-stack web application developed to provide users with a clean, intuitive, and real-time interface to record income, log expenses, and analyze spending distributions.

This project was built from the ground up to demonstrate mastery of essential full-stack software development principles: semantic frontend engineering, modern asynchronous JavaScript DOM communication, RESTful API design with Express.js on Node.js, and document-oriented database modeling with MongoDB and Mongoose.

---

## 2. Problem Statement

Manual financial bookkeeping using notebooks or unstructured spreadsheets suffers from several persistent problems:
- **High Friction**: Recording daily micro-transactions (transport, coffee, quick groceries) is tedious and frequently skipped.
- **Lack of Immediate Analytical Feedback**: Spreadsheets do not dynamically visualize category proportions without complex manual formula setups.
- **Data Inconsistencies**: Without schema enforcement and server-side validation, erroneous values (such as negative prices or missing categories) compromise financial records.
- **Inconvenient Multi-Device Access**: Traditional offline files cannot be easily shared or accessed from mobile devices and desktop workstations without synchronization friction.

ExpenseFlow resolves these issues by delivering an accessible, responsive web application backed by an automated database and dynamic analytics.

---

## 3. Project Objectives

The core objectives of the ExpenseFlow system include:
1. **Transaction Tracking**: Provide a fluid user interface to record both credit (Income) and debit (Expense) entries with title, amount, category, date, and description.
2. **Real-Time Financial Metrics**: Automatically compute and display Total Balance (`Total Income - Total Expenses`), Total Income, Total Expenses, and transaction volume.
3. **Categorization & Visual Analytics**: Enable granular categorization across 8 predefined life categories (`Food`, `Transport`, `Shopping`, `Entertainment`, `Bills`, `Education`, `Healthcare`, `Other`) and render an interactive spending distribution chart using Chart.js.
4. **Comprehensive Data Exploration**: Support multi-attribute search and filtering by title, transaction type, category, and month, with flexible sorting capabilities.
5. **Full-Stack Competency Demonstration**: Model an enterprise-grade 3-tier architecture separating the client presentation tier, application API server tier, and database persistence tier.

---

## 4. Technologies Used

| Domain | Technology | Justification / Role in Project |
| :--- | :--- | :--- |
| **Frontend Layout** | HTML5 | Semantic structure (`<header>`, `<main>`, `<section>`, `<table>`, `<dialog>` modal patterns). |
| **Frontend Styling** | CSS3 | Responsive design using CSS Grid, Flexbox, custom CSS variables, lavender/purple color scheme, smooth cubic-bezier transitions, and mobile media queries. |
| **Frontend Logic** | Vanilla JavaScript (ES6+) | Framework-free client-side engineering utilizing `fetch()` API, DOM traversal, event delegation, and real-time state synchronization. |
| **Data Visualization** | Chart.js | Canvas-based rendering of responsive category-wise expense doughnut charts. |
| **Server Runtime** | Node.js (LTS v22) | High-performance asynchronous non-blocking I/O runtime environment. |
| **Backend Framework** | Express.js (v4) | Lightweight HTTP routing framework for constructing RESTful endpoints and serving static assets. |
| **Database** | MongoDB (v7+) / Atlas | High-performance NoSQL document store housing JSON-like transaction collections. |
| **Object Data Modeling** | Mongoose (v8) | Enforces schema validation, data sanitation, type casting, and query helpers. |
| **Version Control** | Git & GitHub | Distributed version control ensuring strict isolation of `.env` credentials and tracked commits. |

---

## 5. System Architecture

ExpenseFlow utilizes a decoupled 3-tier architecture:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                      PRESENTATION TIER                      │
 │   Client Web Browser (Desktop / Tablet / Mobile)            │
 │   - index.html (Summary cards, Doughnut chart, Quick Add)   │
 │   - transactions.html (Search, Multi-filter table view)     │
 │   - CSS3 Design System & Vanilla JS Event Listeners         │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                   HTTP / JSON (REST API Calls)
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │                      APPLICATION TIER                       │
 │   Node.js / Express.js Server (Port: 5000)                  │
 │   - Middleware: cors, express.json(), express.static()      │
 │   - Routes: /api/transactions                               │
 │   - Controller: transactionController.js                    │
 │   - Model: Transaction.js (Mongoose Schema)                 │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                    Mongoose Driver Protocol
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │                        DATABASE TIER                        │
 │   MongoDB Database: "expenseflow"                           │
 │   Collection: "transactions"                                │
 └─────────────────────────────────────────────────────────────┘
```

### Complete Data Flow Lifecycle
1. User enters transaction information in the form and clicks **Save Transaction**.
2. Client-side JavaScript performs immediate input validation (positive amount, non-empty text).
3. JavaScript executes an asynchronous `fetch()` request (`POST /api/transactions`) dispatching the payload as JSON.
4. Express receives the request, parses the JSON body through `express.json()`, and routes it to `transactionController.createTransaction`.
5. The controller runs Mongoose model validation against `Transaction.js`.
6. Mongoose persists the validated document into the MongoDB `transactions` collection.
7. MongoDB returns the newly created document with its auto-generated `_id` and timestamps.
8. Express responds with HTTP 201 Created and JSON status `{ success: true, data: newTransaction }`.
9. The frontend receives the response, triggers a green toast notification, updates the summary cards, and redraws the analytics chart without a browser page reload.

---

## 6. Functional Modules

### 6.1 Dashboard Overview (`index.html`)
- **Key Performance Indicators (KPIs)**: Instant display of Total Balance, Total Income, Total Expenses, and Transaction Count.
- **Spending Overview Chart**: Responsive doughnut chart highlighting expense allocations across categories with custom tooltips.
- **Quick Add Form**: Compact form for rapid single-click entry of expenses or income.
- **Recent Activity Table**: Chronological table showing the 5 most recent records with color-coded badges and inline Edit/Delete actions.

### 6.2 Transaction Management (`transactions.html`)
- **Real-Time Search**: Substring matching across title, note, and category fields.
- **Type Filter**: Instant toggling between `All`, `Income`, and `Expense`.
- **Category Filter**: Filtering across the 8 standardized categories.
- **Month Filter**: Native date month selector allowing users to audit expenses for specific periods.
- **Sorting Options**: Sort by newest date, oldest date, highest value, or lowest value.
- **Filtered Summary Bar**: Dynamically calculates running totals for the currently matched search results.

### 6.3 Add & Edit Modals
- Modal dialogs with dark translucent backdrops and smooth spring animations.
- Prefilled inputs during Edit operations (`PUT /api/transactions/:id`).
- Dynamic segmented toggle between Income and Expense modes.

### 6.4 Delete Confirmation Dialog
- Safe two-step deletion workflow with explicit confirmation prompt before issuing `DELETE /api/transactions/:id`.

---

## 7. Database Design

- **Database Name**: `expenseflow`
- **Collection**: `transactions`

### Schema Attributes & Constraints

```javascript
const transactionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a transaction title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    required: [true, 'Please specify transaction type'],
    enum: ['Income', 'Expense']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Healthcare', 'Other']
  },
  date: {
    type: Date,
    required: [true, 'Please select a date'],
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters'],
    default: ''
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});
```

---

## 8. REST API Documentation

Base URI: `http://localhost:5000/api/transactions`

### 1. Retrieve Transactions
- **Route**: `GET /api/transactions`
- **Query Parameters**: `search`, `type`, `category`, `startDate`, `endDate`, `sortBy`, `limit`
- **Response Code**: `200 OK`
- **Response Format**:
  ```json
  {
    "success": true,
    "count": 10,
    "data": [ ... ]
  }
  ```

### 2. Retrieve Single Transaction
- **Route**: `GET /api/transactions/:id`
- **Response Code**: `200 OK` (or `404 Not Found`)
- **Response Format**:
  ```json
  {
    "success": true,
    "data": { "_id": "...", "title": "Lunch", "amount": 250, ... }
  }
  ```

### 3. Create Transaction
- **Route**: `POST /api/transactions`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "title": "Monthly Salary",
    "amount": 50000,
    "type": "Income",
    "category": "Other",
    "date": "2026-09-28",
    "description": "Salary credited"
  }
  ```
- **Response Code**: `201 Created`

### 4. Update Transaction
- **Route**: `PUT /api/transactions/:id`
- **Headers**: `Content-Type: application/json`
- **Payload**: Updated fields
- **Response Code**: `200 OK`

### 5. Delete Transaction
- **Route**: `DELETE /api/transactions/:id`
- **Response Code**: `200 OK`
- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Transaction deleted successfully!",
    "data": {}
  }
  ```

---

## 9. Viva & Practical Assessment Demonstration Flow

Follow this exact sequence during the practical exam or viva demonstration:

1. **Server Initialization**:
   Execute `npm start` in the terminal to demonstrate that Express boots up on port 5000 and establishes a successful connection to MongoDB (`✅ MongoDB Connected: 127.0.0.1`).
2. **Dashboard Demonstration (READ)**:
   Open `http://localhost:5000`. Show the evaluator the live calculated Total Balance, Income, Expense, transaction count, and the dynamic Chart.js doughnut chart.
3. **Transaction Creation (CREATE)**:
   Use the **Quick Add Transaction** form to enter:
   - Title: `College Project Book`
   - Amount: `₹450`
   - Type: `Expense`
   - Category: `Education`
   - Click **Save Transaction**. Show that a success toast appears, total expenses increase by ₹450, total balance decreases by ₹450, and the chart updates immediately.
4. **Database Inspection**:
   Open MongoDB Compass or terminal shell, query `db.transactions.find({ title: "College Project Book" })` to show the physical document stored in MongoDB.
5. **Modification (UPDATE)**:
   Navigate to the **Transactions** page (`http://localhost:5000/transactions.html`). Locate the newly added transaction. Click ✏️ **Edit**. Change amount to `₹500`. Save changes. Show that the update is reflected both in the UI and in the database.
6. **Deletion (DELETE)**:
   Click 🗑️ **Delete** on the transaction. Confirm the dialog prompt. Point out that the record is purged and all totals recalculate.
7. **Filter & Search Demonstration**:
   Type `Food` in the search box to filter results in real time. Switch category dropdown to `Transport`. Show the live filtered count and sub-totals.
8. **Git & Code Architecture**:
   Display `git log -n 5` to show disciplined commits, and demonstrate clean separation of MVC folders (`backend/config`, `backend/models`, `backend/controllers`, `backend/routes`, `frontend/`).

---

## 10. Conclusion

The **ExpenseFlow** project satisfies all requirements set forth in the Full Stack Technologies assessment brief. It provides a clean, user-friendly, responsive single-page experience using semantic HTML5, modern CSS3, and Vanilla JavaScript, paired with a scalable Node.js and Express.js REST API layer that interacts securely with a MongoDB database.

The architecture emphasizes modularity, separation of concerns, defensive validation, and visual polish, resulting in a production-ready application suitable for viva examination, academic grading, and professional portfolio demonstration.
