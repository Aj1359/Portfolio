# FinFlow — Enterprise Finance Dashboard & AI Chatbot

A premium personal finance management application with an AI-powered chatbot assistant, real-time analytics, and intelligent budget planning.

## 🌟 Features

### 🌟 Novel & Cutting-Edge Features
- **🧠 Regret Index (NLP Sentiment Mining)**: Mines transaction memos to classify emotional registers (`impulse`, `stress-bought`, `treated myself`, `essential`) and calculates category Regret Scores ($0-100\%$).
- **⏳ Future-Self Persona Negotiation**: Conversational pushback from a "Future You" persona before logging high-ratio discretionary expenses ("Shopping sets back your savings goal by 4 days").
- **🧬 Generative Spending DNA Fingerprint**: Abstract SVG radar fingerprint generated algorithmically from 12 polar category spending vectors.
- **🛡️ Privacy-Preserving Local Benchmarking**: Compares spending against regional norms completely client-side with zero server data transmission.

### Core Dashboard
- **Real-Time Financial Overview**: Net balance, income, expenses, and spending health indicator
- **Dynamic Gauge Visualization**: Visual representation of spending rate vs income
- **Category-Based Breakdown**: Detailed spending by categories with color-coded charts
- **Transactional History**: Complete transaction ledger with filtering and sorting
- **Monthly Analytics**: Month-over-month comparisons and trend analysis

### FinBot AI Assistant
The chatbot uses a hybrid approach:
- **AI-Powered Mode**: Gemini API integration for natural language understanding and personalized insights
- **Local Fallback Engine**: Fast, offline-capable pattern-based responses when API is unavailable

### Advanced Analytics
- Budget planning using 50/30/20 rule
- Financial health scoring
- Spending trend detection
- Expense forecasting
- Category-wise analysis

### Admin Features
- Delete/Remove transactions
- Clear new transactions
- Role-based access control

---

## 📱 FinBot Commands Reference

### Balance & Overview
```
"What's my balance?"
"Show net worth"
"How much money do I have left?"
"Current balance"
```
**Response**: Complete financial snapshot with income, expenses, balance, and health status

### Budget Planning
```
"Show budget plan"
"Budget recommendation"
"How should I budget?"
"50 30 20 rule"
```
**Response**: Personalized budget using 50/30/20 rule with category-wise recommendations

### Spending Analysis
```
"Top spending categories"
"Where's my money going?"
"Category breakdown"
"Biggest expenses"
```
**Response**: Top 5 spending categories with amounts and percentage breakdown

### Transactions
```
"Best 3 worthy transactions"
"Top 5 income"
"Worst expenses"
"Bottom 3 transactions"
"Show top 10 transactions"
```
**Response**: Ranked list of transactions by amount with date, category, and description

### Search & Filter
```
"Find coffee transactions"
"Search for food"
"Show grocery purchases"
"Look for Netflix"
"Filter by 500"
```
**Response**: All matching transactions with filters

### Monthly & Comparison
```
"Monthly insights"
"This month vs last month"
"Compare March and February"
"Month-over-month breakdown"
"Previous month report"
```
**Response**: Detailed comparisons with trend indicators

### Forecasting
```
"Forecast next month"
"Project future expenses"
"What will I spend?"
"Budget for next month"
"Predict my spending"
```
**Response**: Predicted spending with trend analysis and safety margin

### Financial Insights
```
"Financial insights"
"Analyze my spending"
"Spending analysis"
"Trends and patterns"
"Financial summary"
```
**Response**: Comprehensive analysis with savings rate, health status, trends, and recent activity

### Transaction Management
```
"Spent 2k on groceries"
"Add expense of ₹500 for Netflix"
"Got paid ₹50,000 salary"
"Log income 5k freelance"
"Entered payment 150 rupees"
```
**Response**: Transaction logged with confirmation details

### Admin Commands (Requires Admin Role)
```
"Delete expense of ₹500"
"Remove coffee transaction"
"Undo last expense"
"Clear new transactions"
```
**Response**: Transaction deleted/cleared with confirmation

### Help & Support
```
"Help"
"What can you do?"
"Commands"
"Guide"
"Tutorial"
```
**Response**: Complete command reference with examples

---

## 🎯 Natural Language Understanding

FinBot understands flexible, natural language inputs:

### Amount Format Recognition
- **Indian Currency**: ₹500, Rs 500, rs. 500
- **Abbreviations**: 5k (5000), 5 thousand, 1 crore
- **Numeric Only**: 500, 1000, 50000

### Category Auto-Detection
Automatically identifies categories:
- **Food**: groceries, restaurant, cafe, coffee, lunch, dinner
- **Housing**: rent, house, apartment, mortgage
- **Transport**: uber, ola, fuel, petrol, bus, metro, cab
- **Entertainment**: netflix, spotify, movie, game, outing
- **Health**: doctor, hospital, medicine, gym, pharma
- **Education**: course, book, study, tuition
- **Shopping**: amazon, flipkart, clothes, shoes
- **Utilities**: electric, water, gas, internet, phone bill
- **Freelance**: freelance, client, project, contract
- **Investments**: dividend, stock, mutual fund

### Transaction Type Detection
- **Income**: "got paid", "earned", "received", "salary", "bonus", "credit"
- **Expense**: "spent", "paid for", "bought", "purchased", "bill", "fee"

---

## 📊 Data Structure

### Transaction Object
```javascript
{
  id: 't001',              // Unique identifier
  date: '2026-03-30',      // YYYY-MM-DD format
  type: 'expense',         // 'income' or 'expense'
  amount: 500,             // Numeric amount
  category: 'Food',        // Transaction category
  desc: 'Grocery shopping' // Description
}
```

### Categories List
```
Salary, Freelance, Investments, Housing, Food, 
Transport, Utilities, Entertainment, Health, 
Education, Shopping, Other
```

---

## 🔐 Configuration

### API Keys (api/config.js)
```javascript
FINFLOW_CONFIG = {
  GEMINI_API_KEY: 'your-api-key-here',
  GEMINI_MODEL: 'gemini-1.5-flash',
  RAG_MAX_TRANSACTIONS: 50,
  BUDGET_ANALYSIS_MONTHS: 3,
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹'
}
```

### Storage
- **localStorage Keys**:
  - `finflow_transactions`: All transactions (JSON)
  - `finflow_role`: User role ('admin' or 'user')
  - `finflow_theme`: Theme preference ('dark' or 'light')

---

## 🚀 Getting Started

### 1. Setup
```bash
# Clone or extract the project
# Place files in your web server

# Update API key in api/config.js (optional for AI mode)
GEMINI_API_KEY: 'AIzaSyAmPtpq62iO8wxgX70x3RkRTaWBlCCXCIQ'
```

### 2. Load the Application
```html
<!-- Required files to load in order -->
<script src="api/config.js"></script>
<script src="app.js"></script>
<script src="js/chatbot.js"></script>
```

### 3. Test Commands
Open browser console and test:
```javascript
// Add a transaction
State.addTx({
  id: 't001',
  date: '2026-03-30',
  type: 'expense',
  amount: 500,
  category: 'Food',
  desc: 'Lunch'
});

// Process message
FinBot.processMessage("Show my balance", State.get('transactions'));

// Clear new transactions
State.clearNewTransactions();
```

---

## 📈 Analytics Features

### Budget Health Indicators
- **🟢 Green Zone**: Spending < 50% of income (Healthy)
- **🟡 Yellow Zone**: Spending 50-75% of income (Caution)
- **🔴 Red Zone**: Spending > 75% of income (High Risk)

### 50/30/20 Rule
- **Needs (50%)**: Housing, Food, Utilities, Transport, Health
- **Wants (30%)**: Entertainment, Shopping, Education
- **Savings (20%)**: Remaining balance

### Category Colors
```javascript
{
  Salary: '#4f46e5',           // Blue
  Freelance: '#06b6d4',        // Cyan
  Investments: '#10b981',      // Green
  Housing: '#f97316',          // Orange
  Food: '#f59e0b',             // Amber
  Transport: '#8b5cf6',        // Purple
  Utilities: '#ec4899',        // Pink
  Entertainment: '#14b8a6',    // Teal
  Health: '#ef4444',           // Red
  Education: '#6366f1',        // Indigo
  Shopping: '#e879f9',         // Fuchsia
  Other: '#94a3b8'             // Gray
}
```

---

## 🤖 Gemini AI Integration

### How It Works
1. User sends a message
2. FinBot detects intent (add, balance, budget, etc.)
3. If Gemini API configured, sends context + message to Gemini
4. Gemini analyzes user's actual financial data
5. Returns personalized response or JSON action
6. Local fallback if API fails

### Data Context Format
```
FINANCIAL DATA CONTEXT:
Total Income: ₹50,000
Total Expenses: ₹25,000
Net Balance: ₹25,000
Savings Rate: 50%

SPENDING BY CATEGORY:
  Housing: ₹10,000
  Food: ₹5,000
  Transport: ₹4,000
  
RECENT TRANSACTIONS (last 10):
  2026-03-30 | EXPENSE | Food | Grocery shopping | ₹500
  ...
```

### AI Response Types
1. **Text Analysis**: Budget advice, insights, trends
2. **Transaction Addition**: JSON action for adding transactions
3. **Forecasting**: Predictions based on historical patterns

---

## 🔧 Technical Details

### File Structure
```
.
├── index.html              # Main UI
├── app.js                  # Core state management
├── style.css               # Styling
├── README.md               # Documentation
├── api/
│   └── config.js           # Configuration & API keys
└── js/
    └── chatbot.js          # FinBot AI engine
```

### Key Technologies
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: Browser localStorage
- **AI**: Google Gemini API (1.5-flash model)
- **Pattern Matching**: Regex-based intent detection
- **Data Visualization**: SVG gauges and charts

### State Management
```javascript
const State = {
  transactions: [],     // Array of transaction objects
  role: 'admin',        // User role
  theme: 'dark',        // UI theme
  sortKey: 'date',      // Sort field
  sortDir: 'desc',      // Sort direction
  filterType: 'all',    // Transaction type filter
  filterCat: 'all',     // Category filter
  search: '',           // Search query
  activeSection: 'dashboard' // Current view
}
```

---

## 📱 Responsive Design
- Mobile-optimized UI
- Touch-friendly controls
- Responsive charts and gauges
- Adaptive layouts

---

## ⚠️ Data Privacy & Security

### Local Storage Only (Default)
- All data stored locally in browser
- No server transmission unless Gemini API is used
- Clear data using: `State.clearNewTransactions()` or `localStorage.clear()`

### API Security
- Gemini API key should be kept private
- Consider using environment variables in production
- Never commit real API keys to public repositories

---

## 🐛 Troubleshooting

### Chatbot Not Responding
1. Check Gemini API key in `api/config.js`
2. Verify network connectivity
3. Check browser console for errors
4. Fallback engine will activate automatically

### Transactions Not Saving
1. Check browser's localStorage is enabled
2. Verify sufficient storage space
3. Clear browser cache if corrupted
4. Use `State.clearNewTransactions()` to reset

### Categories Not Detected
- Use explicit category names in description
- Examples: "Food", "Housing", "Transport"
- Add more keywords in `extractCategory()` function

---

## 🚀 Deployment

FinFlow is designed for zero-configuration, instant deployment:

```bash
# Start the local deployment server
python -m http.server 8080

# Access the dashboard at
http://localhost:8080
```

---

## 🎯 Use Cases

### Personal Finance Management
- Track daily expenses and income
- Monitor spending patterns by category
- Plan monthly budgets using data-driven insights

### Financial Planning
- Analyze spending trends
- Forecast future expenses
- Optimize budget allocation using 50/30/20 rule

### Wealth Building
- Monitor savings rate
- Identify cost-cutting opportunities
- Track investment vs. expense ratio

---

## 📄 License
Premium Finance Dashboard - All Rights Reserved

---

## 👨‍💻 Support & Contact
For issues, suggestions, or feature requests, try the in-app help command or check the chatbot's capabilities.

**Try asking**: "Help" or "What can you do?"


---
*© 2026 FinFlow Enterprise Solutions*
