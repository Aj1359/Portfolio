/* ═══════════════════════════════════════════════════════════
   FinFlow — RAG Chatbot Engine  |  js/chatbot.js
   Retrieval-Augmented Generation using transaction data +
   optional Gemini API for AI-powered responses.
   ═══════════════════════════════════════════════════════════ */

'use strict';

const FinBot = (() => {

  // ── Intent detection patterns ────────────────────────────────
  const INTENTS = [
    { name: 'add_income',  patterns: [/(?:add|create|record|log|entered|got).*(?:income|earn|deposit|salary|bonus|payment|credit)/i, /got paid|received|earned|salary|deposit|credited|added income/i] },
    { name: 'add_expense', patterns: [/(?:add|create|record|log|entered|spent).*(?:expense|spend|bill|cost|pay|payment|paid|charge)/i, /spent|paid for|bought|purchase|bill|fee|cost me|charged/i] },
    { name: 'balance',     patterns: [/balance|how much.*(have|left|do i have|remaining|available)/i, /total|net worth|how much money|current balance|savings/i] },
    { name: 'top_spend',   patterns: [/top spend|most spent|highest.*categor|where.*money.*going|biggest expense|spending breakdown|category breakdown/i] },
    { name: 'top_tx',      patterns: [/best.*(transaction|tx|income|expense)|top.*(transaction|tx|income|expense)|worthy|highest|biggest.*transaction|largest.*amount/i] },
    { name: 'worst_tx',    patterns: [/worst.*transaction|lowest.*income|smallest.*amount|least spent|bottom.*transaction|lowest earnings/i] },
    { name: 'budget',      patterns: [/budget|plan|how much.*should|recommend|advice|50[.\/]?30[.\/]?20|saving goal|expense plan/i] },
    { name: 'insight',     patterns: [/insight|analys|summar|overview|trend|pattern|report|analysis|statistics|performance/i] },
    { name: 'monthly',     patterns: [/this month|last month|monthly|month report|march|february|january|previous month|month comparison/i] },
    { name: 'category',    patterns: [/category|food|housing|transport|entertainment|health|education|shopping|utilities|breakdown by category/i] },
    { name: 'search',      patterns: [/search|find|look for|show.*transaction|filter|where.*spend/i] },
    { name: 'comparison',  patterns: [/compare|vs|versus|difference|growth|change|increase|decrease between|month over month/i] },
    { name: 'forecast',    patterns: [/forecast|predict|project|estimate.*future|next month|trending|will spend/i] },
    { name: 'regret',      patterns: [/regret|emotion|impulse|feeling|tone|why.*spend|guilt|sentiment/i] },
    { name: 'benchmark',   patterns: [/benchmark|compare.*peer|peer|percentile|similar|others|national average/i] },
    { name: 'delete',      patterns: [/delete|remove|undo|erase|clear.*transaction|forget|cancel.*transaction/i] },
    { name: 'help',        patterns: [/help|what can you|commands|hi|hello|hey|assist|support|guide|tutorial/i] },
  ];

  // ── Privacy-Preserving Benchmark Reference Norms ──────────────
  const BENCHMARK_DATA = {
    Housing: 28, Food: 18, Transport: 10, Utilities: 8,
    Entertainment: 8, Shopping: 10, Health: 6, Education: 5, Savings: 20
  };

  // ── Regret & Sentiment Mining Engine ─────────────────────────
  function extractSentiment(desc) {
    if (!desc) return { emotion: 'neutral', regretScore: 10 };
    const text = desc.toLowerCase();
    if (/impulse|stress|bored|guilt|regret|waste|unnecessary|dumb|overpaid|late fee|useless|mistake/i.test(text)) {
      return { emotion: 'impulse/regret', regretScore: 90 };
    }
    if (/treat|splurge|party|fancy|expensive|outing|luxury|desire|weekend|gift/i.test(text)) {
      return { emotion: 'splurge', regretScore: 50 };
    }
    if (/grocery|rent|bill|medicine|hospital|tuition|essential|need|maintenance|electric|water|fuel/i.test(text)) {
      return { emotion: 'essential', regretScore: 5 };
    }
    return { emotion: 'neutral', regretScore: 15 };
  }

  // ── Value scoring system (Cost vs Utility vs Regret) ──────────
  function getValueScore(tx) {
    const valueByCategory = {
      Housing: 90, Health: 85, Utilities: 80, Education: 85, Food: 60,
      Entertainment: 20, Shopping: 30, Transport: 50,
      Salary: 100, Freelance: 95, Investments: 90, Other: 50
    };
    
    const categoryValue = valueByCategory[tx.category] || 50;
    const amountScore = Math.max(0, 100 - (tx.amount / 100));
    const sentiment = extractSentiment(tx.desc);
    const regretPenalty = (sentiment.regretScore / 100) * 25; // Sentiment penalty
    
    return Math.max(0, (categoryValue * 0.6) + (amountScore * 0.25) - regretPenalty);
  }

  // ── Extract amount from text ─────────────────────────────────
  function extractAmount(text) {
    // Matches amounts like "₹500", "500", "500k", "5 thousand", "1.5L", "2 crore", etc.
    const m = text.match(/(?:₹|rs|rs\.)?[\s]*(\d[\d,\.]*)\s*(?:k|K|lakh|lakhs|thousand|crore)?/i);
    if (!m) return null;
    let val = parseFloat(m[1].replace(/,/g, ''));
    if (/k|thousand/i.test(m[0])) val *= 1000;
    if (/lakh/i.test(m[0])) val *= 100000;
    if (/crore/i.test(m[0])) val *= 10000000;
    return Math.round(val);
  }

  // ── Extract category ─────────────────────────────────────────
  function extractCategory(text) {
    const cats = ['Salary','Freelance','Investments','Housing','Food','Transport','Utilities','Entertainment','Health','Education','Shopping'];
    for (const c of cats) {
      if (new RegExp('\\b' + c + '\\b', 'i').test(text)) return c;
    }
    // Expanded smart category keyword detection
    if (/grocer|restaurant|cafe|coffee|lunch|dinner|food|swiggy|zomato|blinkit|zepto|instamart|eatfit|dhab/i.test(text)) return 'Food';
    if (/rent|house|apartment|mortgage|pg|flat|maintenance/i.test(text)) return 'Housing';
    if (/uber|ola|fuel|petrol|diesel|bus|metro|cab|rapido|auto|toll|parking|fastag/i.test(text)) return 'Transport';
    if (/netflix|spotify|movie|game|outing|cinema|bookmyshow|prime|hotstar|youtube|steam/i.test(text)) return 'Entertainment';
    if (/doctor|hospital|medicine|gym|pharma|apollo|1mg|cultfit|pharmacy|clinic/i.test(text)) return 'Health';
    if (/course|book|study|tuition|udemy|coursera|college|school|fee|exam/i.test(text)) return 'Education';
    if (/amazon|flipkart|shopping|clothes|shoes|myntra|meesho|nykaa|mall|store|zara/i.test(text)) return 'Shopping';
    if (/electric|water|gas|internet|phone bill|wifi|recharge|dth|broadband|bill/i.test(text)) return 'Utilities';
    if (/freelance|client|project|contract|upwork|fiverr|gig/i.test(text)) return 'Freelance';
    if (/divid|stock|mutual fund|invest|zerodha|groww|upstox|sip|nps|ppf|crypto/i.test(text)) return 'Investments';
    return 'Other';
  }

  // ── Detect intent ─────────────────────────────────────────────
  function detectIntent(text) {
    for (const { name, patterns } of INTENTS) {
      if (patterns.some(p => p.test(text))) return name;
    }
    return 'general';
  }

  // ── Build RAG context from transactions ───────────────────────
  function buildContext(txs, maxTx) {
    const cfg = window.FINFLOW_CONFIG || {};
    const limit = cfg.RAG_MAX_TRANSACTIONS || 50;
    const recent = [...txs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);

    // Aggregate stats
    const income   = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance  = income - expenses;

    // Category breakdown
    const catMap = {};
    txs.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    const catSummary = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([k,v]) => `  ${k}: ₹${v}`).join('\n');

    // Dynamically extract latest 3 months present in transaction records
    const allMonths = [...new Set(txs.map(t => t.date.slice(0,7)))].sort().reverse();
    const months = allMonths.length > 0 ? allMonths.slice(0, 3) : [new Date().toISOString().slice(0,7)];
    const monthSummary = months.map(m => {
      const mInc = txs.filter(t=>t.type==='income'&&t.date.startsWith(m)).reduce((s,t)=>s+t.amount,0);
      const mExp = txs.filter(t=>t.type==='expense'&&t.date.startsWith(m)).reduce((s,t)=>s+t.amount,0);
      return `  ${m}: Income ₹${mInc}, Expenses ₹${mExp}, Saved ₹${mInc-mExp}`;
    }).join('\n');

    return `
FINANCIAL DATA CONTEXT:
Total Income: ₹${income}
Total Expenses: ₹${expenses}
Net Balance: ₹${balance}
Savings Rate: ${income > 0 ? ((balance/income)*100).toFixed(1) : 0}%

SPENDING BY CATEGORY:
${catSummary || '  No expenses yet'}

MONTHLY SUMMARY (last 3 months):
${monthSummary}

RECENT TRANSACTIONS (last ${Math.min(recent.length, 10)}):
${recent.slice(0,10).map(t=>`  ${t.date} | ${t.type.toUpperCase()} | ${t.category} | ${t.desc} | ₹${t.amount}`).join('\n')}
`;
  }

  // ── Budget recommendation (50-30-20 rule adapted) ─────────────
  function buildBudgetPlan(txs) {
    const cfg = window.FINFLOW_CONFIG || {};
    const months = cfg.BUDGET_ANALYSIS_MONTHS || 3;

    // Get all unique months from transactions, then use last N months
    const allMonthsInData = [...new Set(txs.map(t => t.date.slice(0,7)))].sort();
    const analysisMonths = allMonthsInData.slice(-Math.max(months, 1));
    
    // If not enough data, use what's available
    const avgInc = analysisMonths.length > 0
      ? analysisMonths.map(m => txs.filter(t=>t.type==='income'&&t.date.startsWith(m)).reduce((s,t)=>s+t.amount,0)).reduce((a,b)=>a+b,0) / analysisMonths.length
      : 0;

    // Average category spending from analysis period
    const catMap = {};
    const recentTxs = txs.filter(t => t.type==='expense' && analysisMonths.some(m=>t.date.startsWith(m)));
    recentTxs.forEach(t => { catMap[t.category] = (catMap[t.category]||0) + t.amount; });
    Object.keys(catMap).forEach(k => { catMap[k] = catMap[k] / Math.max(analysisMonths.length, 1); });

    const needs = (catMap.Housing||0) + (catMap.Food||0) + (catMap.Utilities||0) + (catMap.Transport||0) + (catMap.Health||0);
    const wants = (catMap.Entertainment||0) + (catMap.Shopping||0) + (catMap.Education||0);
    const actual_savings = avgInc - needs - wants;

    const budget50 = avgInc * 0.50;
    const budget30 = avgInc * 0.30;
    const budget20 = avgInc * 0.20;

    const fmt = n => `₹${Math.round(n).toLocaleString('en-IN')}`;

    const lines = [];
    lines.push(`📊 **Budget Plan** (based on last ${analysisMonths.length} month${analysisMonths.length!==1?'s':''} average income: ${fmt(avgInc)})`);
    lines.push('');
    lines.push('**50/30/20 Rule Recommendation:**');
    lines.push(`• **Needs** (50%): ${fmt(budget50)} → You spent ${fmt(needs)} ${needs>budget50?'⚠️ Over!':'✅ Good'}`);
    lines.push(`• **Wants** (30%): ${fmt(budget30)} → You spent ${fmt(wants)} ${wants>budget30?'⚠️ Over!':'✅ Good'}`);
    lines.push(`• **Savings** (20%): ${fmt(budget20)} → Actual ${fmt(actual_savings)} ${actual_savings<budget20?'⚠️ Low!':'✅ Great'}`);
    lines.push('');

    // Category-level tips
    const tips = [];
    if ((catMap.Food||0) > 3000) tips.push('🍽  Food spending is high — try meal prepping');
    if ((catMap.Entertainment||0) > 1000) tips.push('🎬 Entertainment is a big chunk — review subscriptions');
    if ((catMap.Shopping||0) > 1500) tips.push('🛍 Shopping trend up — try 24-hour rule before purchases');
    if (actual_savings < budget20 && avgInc>0) tips.push(`💰 Boost savings by cutting ${fmt(budget20-actual_savings)} from wants`);
    if (tips.length) { lines.push('**Personalized Tips:**'); tips.forEach(t => lines.push(t)); }

    return lines.join('\n');
  }

  // ── Local pattern-based response generator ────────────────────
  function localResponse(intent, userMsg, txs) {
    const income   = txs.filter(t => t.type==='income').reduce((s,t)=>s+t.amount,0);
    const expenses = txs.filter(t => t.type==='expense').reduce((s,t)=>s+t.amount,0);
    const balance  = income - expenses;
    const pct      = income > 0 ? (expenses/income*100).toFixed(1) : 0;
    const fmtN     = n => `₹${Math.round(n).toLocaleString('en-IN')}`;

    // Category map
    const catMap = {};
    txs.filter(t=>t.type==='expense').forEach(t=>{ catMap[t.category]=(catMap[t.category]||0)+t.amount; });
    const topCat = Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0];

    function healthEmoji(p) { return p < 50 ? '🟢' : p < 75 ? '🟡' : '🔴'; }

    switch(intent) {
      case 'balance':
        return '💰 **Your Financial Snapshot**\n• Net Balance: **' + fmtN(balance) + '**\n• Total Income: ' + fmtN(income) + '\n• Total Expenses: ' + fmtN(expenses) + '\n• Spending rate: ' + pct + '% of income ' + healthEmoji(+pct);

      case 'top_spend': {
        if (!topCat) return '📊 No expense data yet. Add some transactions first!';
        const topList = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5)
          .map(([k,v],i)=>`${i+1}. **${k}**: ${fmtN(v)}`).join('\n');
        return '📊 **Top Spending Categories:**\n' + topList + '\n\n💡 Your biggest expense is **' + topCat[0] + '** at ' + fmtN(topCat[1]);
      }

      case 'top_tx': {
        // Extract number: "best 3 transactions", "top 5 income", etc.
        const numMatch = userMsg.match(/(\d+)/);
        const num = numMatch ? Math.min(parseInt(numMatch[1]), 10) : 3;
        
        // Determine type: income, expense, or all
        let filtered = txs;
        if (/income/i.test(userMsg)) filtered = txs.filter(t => t.type === 'income');
        else if (/expense/i.test(userMsg)) filtered = txs.filter(t => t.type === 'expense');
        
        // Sort by value score (best = low cost + good service)
        const topTxs = [...filtered].sort((a, b) => getValueScore(b) - getValueScore(a)).slice(0, num);
        
        if (topTxs.length === 0) {
          return `📋 No transactions found. Try adding some first!`;
        }
        
        const list = topTxs.map((t, i) => {
          const score = getValueScore(t);
          const scoreEmoji = score > 70 ? '⭐⭐⭐' : score > 50 ? '⭐⭐' : '⭐';
          return `${i+1}. **${t.date}** | ${t.type === 'income' ? '📈' : '📉'} ${t.category} | **${fmtN(t.amount)}** | ${t.desc} ${scoreEmoji}`;
        }).join('\n');
        
        return `⭐ **Best ${num} Value Transactions (Low Cost + Good Service):**\n${list}`;
      }

      case 'worst_tx': {
        // Extract number: "worst 3 transactions", "bottom 5 expenses", etc.
        const numMatch = userMsg.match(/(\d+)/);
        const num = numMatch ? Math.min(parseInt(numMatch[1]), 10) : 3;
        
        // Determine type: income, expense, or all
        let filtered = txs;
        if (/income/i.test(userMsg)) filtered = txs.filter(t => t.type === 'income');
        else if (/expense/i.test(userMsg)) filtered = txs.filter(t => t.type === 'expense');
        
        // Sort by value score (worst = high cost + poor service)
        const worstTxs = [...filtered].sort((a, b) => getValueScore(a) - getValueScore(b)).slice(0, num);
        
        if (worstTxs.length === 0) {
          return `📋 No transactions found. Try adding some first!`;
        }
        
        const list = worstTxs.map((t, i) => {
          const score = getValueScore(t);
          const scoreEmoji = score < 30 ? '❌❌❌' : score < 50 ? '❌❌' : '❌';
          return `${i+1}. **${t.date}** | ${t.type === 'income' ? '📈' : '📉'} ${t.category} | **${fmtN(t.amount)}** | ${t.desc} ${scoreEmoji}`;
        }).join('\n');
        
        return `📉 **Worst ${num} Value Transactions (High Cost + Poor Service):**\n${list}\n\n💡 **Tip:** Consider alternatives for these categories to get better value.`;
      }

      case 'search': {
        const searchTerm = userMsg.replace(/(?:search|find|look for|show|filter|where)/gi, '').trim();
        if (!searchTerm) return `🔍 What would you like to search for? (category, description, amount, date)`;
        
        const results = txs.filter(t => 
          new RegExp(searchTerm, 'i').test(t.desc) || 
          new RegExp(searchTerm, 'i').test(t.category) ||
          t.amount.toString() === searchTerm
        ).slice(0, 10);
        
        if (results.length === 0) return `❌ No transactions found matching "${searchTerm}"`;
        
        const list = results.map((t, i) => 
          `${i+1}. **${t.date}** | ${t.type === 'income' ? '📈' : '📉'} ${t.category} | **${fmtN(t.amount)}** | ${t.desc}`
        ).join('\n');
        
        return `🔍 **Found ${results.length} transaction${results.length!==1?'s':''}:**\n${list}`;
      }

      case 'comparison': {
        const months = [...new Set(txs.map(t => t.date.slice(0,7)))].sort().reverse();
        if (months.length < 2) return `📊 Need at least 2 months of data to perform comparison.`;
        const comparisons = [];
        
        for (let i = 0; i < Math.min(months.length - 1, 3); i++) {
          const m1 = months[i], m2 = months[i+1];
          const exp1 = txs.filter(t => t.type === 'expense' && t.date.startsWith(m1)).reduce((s, t) => s + t.amount, 0);
          const exp2 = txs.filter(t => t.type === 'expense' && t.date.startsWith(m2)).reduce((s, t) => s + t.amount, 0);
          const inc1 = txs.filter(t => t.type === 'income' && t.date.startsWith(m1)).reduce((s, t) => s + t.amount, 0);
          const inc2 = txs.filter(t => t.type === 'income' && t.date.startsWith(m2)).reduce((s, t) => s + t.amount, 0);
          
          const expChange = exp1 - exp2;
          const incChange = inc1 - inc2;
          
          comparisons.push(`**${m1} vs ${m2}:**\n• Expenses: ${fmtN(exp1)} → ${fmtN(exp2)} (${expChange >= 0 ? '📈 +' : '📉 '}${fmtN(Math.abs(expChange))})\n• Income: ${fmtN(inc1)} → ${fmtN(inc2)} (${incChange >= 0 ? '📈 +' : '📉 '}${fmtN(Math.abs(incChange))})\n`);
        }
        
        return `📊 **Month-over-Month Comparison:**\n${comparisons.join('\n')}`;
      }

      case 'forecast': {
        const months = [...new Set(txs.map(t => t.date.slice(0,7)))].sort().slice(-3);
        if (months.length < 2) return `📈 Not enough data to forecast. Add more transactions!`;
        
        const expenses = months.map(m => txs.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0));
        const avgMonthlyExp = expenses.reduce((a, b) => a + b, 0) / expenses.length;
        const trend = expenses[expenses.length - 1] > expenses[expenses.length - 2] ? 'increasing' : 'decreasing';
        
        const projected = avgMonthlyExp * 1.1; // 10% buffer
        
        return `📈 **Expense Forecast (Next Month):**\n• Average Monthly: ${fmtN(avgMonthlyExp)}\n• Trend: ${trend} 📊\n• Projected: ${fmtN(projected)}\n\n💡 **Tip:** Budget around ${fmtN(projected)} to be safe.`;
      }

      case 'budget':
        return buildBudgetPlan(txs);

      case 'insight': {
        const savingsRate = income>0?((balance/income)*100).toFixed(1):0;
        const recent = [...txs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
        return `🔍 **Financial Insights**\n\n• **Savings Rate**: ${savingsRate}%\n• **Spending Health**: ${pct<50?'🟢 Healthy':pct<75?'🟡 Caution':'🔴 High Risk'} (${pct}%)\n• **Biggest Category**: ${topCat?topCat[0]+' ('+fmtN(topCat[1])+')':'N/A'}\n• **Transactions**: ${txs.length} total\n\n**Recent Activity:**\n${recent.map(t=>`• ${t.date}: ${t.desc} ${t.type==='income'?'+':'-'}${fmtN(t.amount)}`).join('\n')}`;
      }

      case 'monthly': {
        const months = [...new Set(txs.map(t => t.date.slice(0,7)))].sort().reverse().slice(0, 3);
        const out = months.map(m => {
          const mI = txs.filter(t=>t.type==='income'&&t.date.startsWith(m)).reduce((s,t)=>s+t.amount,0);
          const mE = txs.filter(t=>t.type==='expense'&&t.date.startsWith(m)).reduce((s,t)=>s+t.amount,0);
          const d = new Date(m + '-01');
          const label = !isNaN(d) ? d.toLocaleString('default', { month: 'long', year: 'numeric' }) : m;
          return `**${label}**: Inc ${fmtN(mI)} | Exp ${fmtN(mE)} | Saved ${fmtN(mI-mE)}`;
        });
        const curM = months[0] || '';
        const prevM = months[1] || '';
        const curExp = txs.filter(t=>t.date.startsWith(curM)&&t.type==='expense').reduce((s,t)=>s+t.amount,0);
        const prevExp = txs.filter(t=>t.date.startsWith(prevM)&&t.type==='expense').reduce((s,t)=>s+t.amount,0);
        return `📅 **Monthly Breakdown:**\n${out.join('\n')}\n\n📈 Trend: ${curExp < prevExp ? 'Expenses ↓ down this month ✅':'Expenses ↑ up this month ⚠️'}`;
      }

      case 'regret': {
        const expenses = txs.filter(t => t.type === 'expense');
        if (expenses.length === 0) return '🧠 No expense data available to analyze regret score.';
        
        let totalRegret = 0;
        const regretList = expenses.map(t => {
          const sent = extractSentiment(t.desc);
          totalRegret += sent.regretScore;
          return { tx: t, sentiment: sent };
        }).sort((a,b) => b.sentiment.regretScore - a.sentiment.regretScore);

        const avgRegret = Math.round(totalRegret / expenses.length);
        const topRegrets = regretList.slice(0, 3);

        const list = topRegrets.map(r => 
          `• **${r.tx.desc}** (${r.tx.category}) — ₹${r.tx.amount} | Regret: ${r.sentiment.regretScore}% [${r.sentiment.emotion}]`
        ).join('\n');

        return `🧠 **NLP Regret Index & Sentiment Analysis:**\n• **Overall Regret Score**: **${avgRegret}%** ${avgRegret > 40 ? '⚠️ High impulse signals detected' : '🟢 Healthy, mindful spending'}\n\n**Highest Regret Memo Signals:**\n${list}\n\n💡 *Tip: FinBot mines memo language to identify emotional vs necessary purchases.*`;
      }

      case 'benchmark': {
        if (income === 0) return '📊 Add some income records to see your local benchmark comparisons.';
        
        const comparisons = Object.entries(BENCHMARK_DATA).map(([cat, normPct]) => {
          const actualAmt = txs.filter(t => t.category === cat && t.type === 'expense').reduce((s,t) => s + t.amount, 0);
          const actualPct = ((actualAmt / income) * 100).toFixed(1);
          const diff = (actualPct - normPct).toFixed(1);
          const status = diff > 3 ? '🔴 Above norm' : diff < -3 ? '🟢 Below norm' : '🟡 On benchmark';
          return `• **${cat}**: Yours **${actualPct}%** vs Norm **${normPct}%** (${status})`;
        }).join('\n');

        return `🛡️ **Privacy-Preserving Local Benchmarking (Zero Server Transmission):**\nCompared to regional income norms:\n\n${comparisons}\n\n💡 *All calculations computed 100% locally in your browser.*`;
      }

      case 'help':
        const apiStatus = isApiKeyConfigured() ? '✅ **AI-Powered Mode** (Gemini API enabled)' : '⚙️ **Local Mode** (No AI configured)';
        return `Welcome to **FinBot**, your enterprise financial assistant.\n${apiStatus}\n\n**ANALYTICS & NOVEL FEATURES:**\n• "Regret index" / "Analyze my emotional spending"\n• "Compare to peers" / "Local benchmarks"\n• "What's my balance?"\n• "Show budget plan"\n• "Monthly insights"\n• "Forecast next month"\n\n**TRANSACTION MANAGEMENT:**\n• "Spent 2k on groceries"\n• "Add income of 5k"\n• "Log expense 500 for Netflix"\n\n**ADMIN ONLY:**\n${State.get('role')==='admin'?'• "Remove expense of ₹500"\n• "Clear new transactions"\n':''}`;

      default:
        return `🤔 I'm not sure about that. Try asking:\n• "What's my balance?"\n• "Show budget plan"\n• "Top spending categories"\n• "Monthly insights"\n\nOr type **help** for all commands.`;
    }
  }

  // ── Gemini API call with debugging ──────────────────────────
  async function callGemini(userMsg, context) {
    const cfg = window.FINFLOW_CONFIG || {};
    const key   = cfg.GEMINI_API_KEY;
    const model = cfg.GEMINI_MODEL || 'gemini-1.5-flash';

    // Validate API key
    if (!key || key.trim().length < 10) {
      throw new Error('❌ Invalid API Key: Check api/config.js - GEMINI_API_KEY is missing or too short');
    }

    const systemPrompt = `You are FinBot, an expert personal finance assistant embedded in the FinFlow dashboard.
Your role is to help users track expenses, understand spending patterns, plan budgets, and get actionable financial insights.

CRITICAL INSTRUCTIONS:
1. Always be concise, friendly, and professional
2. Use ₹ for currency and Indian numbering (₹5,00,000 for 5 lakhs)
3. When user asks to ADD a transaction, ALWAYS respond with ONLY a JSON object like:
   {"action":"add_transaction","type":"expense","amount":500,"category":"Food","desc":"Grocery shopping","date":"2026-03-30"}
4. For all other requests (balance, budget, insights, top transactions, monthly), provide a helpful analysis
5. Use markdown for formatting with bold, bullet points, and emojis
6. Always reference actual numbers from the provided financial data
7. Be specific with recommendations based on the user's actual spending patterns

USER'S FINANCIAL DATA:
${context}

When analyzing:
- If spending > 75% of income: ⚠️ Red zone
- If spending 50-75%: 🟡 Caution zone
- If spending < 50%: 🟢 Safe zone

Provide personalized, actionable advice based on their specific data.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMsg }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errData = await res.text();
        try {
          const jsonErr = JSON.parse(errData);
          const errorMsg = jsonErr.error?.message || JSON.stringify(jsonErr);
          
          if (res.status === 401) {
            throw new Error(`❌ API Authentication Failed: Check your GEMINI_API_KEY in api/config.js\n${errorMsg}`);
          } else if (res.status === 403) {
            throw new Error(`❌ API Permission Denied: Your API key may not have the required permissions\n${errorMsg}`);
          } else if (res.status === 429) {
            throw new Error(`⏱️ Rate Limited: Too many requests. Try again in a moment.\n${errorMsg}`);
          } else if (res.status === 400) {
            throw new Error(`❌ Bad Request: Check your message format\n${errorMsg}`);
          } else {
            throw new Error(`❌ API Error (${res.status}): ${errorMsg}`);
          }
        } catch (e) {
          throw new Error(`❌ Gemini API Error (${res.status}): ${errData || 'Unknown error'}`);
        }
      }

      const data = await res.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('❌ Invalid API Response: No content generated. Try again.');
      }

      return data.candidates[0].content.parts[0].text || '❌ Empty response from API.';
    } catch (error) {
      // Re-throw with more context
      console.error('Gemini API Debug:', error);
      throw error;
    }
  }

  // ── Validate API Key Configuration ──────────────────────────
  function isApiKeyConfigured() {
    const cfg = window.FINFLOW_CONFIG || {};
    const key = cfg.GEMINI_API_KEY;
    return key && typeof key === 'string' && key.trim().length > 10;
  }

  // ── Parse AI action response ─────────────────────────────────
  function parseAction(text) {
    // Attempt 1: Raw JSON block format
    const jsonBlock = text.match(/```(?:json)?\s*(\{.*?"action"\s*:\s*"add_transaction".*?\})\s*```/is);
    if (jsonBlock) {
      try { return JSON.parse(jsonBlock[1]); } catch {}
    }
    // Attempt 2: Inline object format
    const m = text.match(/\{[^}]*"action"\s*:\s*"add_transaction"[^}]*\}/is);
    if (m) {
      try { return JSON.parse(m[0]); } catch {}
    }
    return null;
  }

  let pendingTx = null; // State for interactive confirmation

  // ── Main process message ─────────────────────────────────────
  async function processMessage(userMsg, txs, onAction) {
    // 0. Interactive State Handling (Red Zone Confirmation)
    if (pendingTx) {
      if (/^(yes|y|sure|ok|do it|confirm|yeah|yep)/i.test(userMsg.trim())) {
        const tx = pendingTx;
        pendingTx = null;
        if (onAction) onAction({ action: 'add_transaction', tx });
        return {
          text: `✅ **Confirmed!** Transaction Logged.\n• **📉 Expense**: ₹${tx.amount.toLocaleString('en-IN')}\n• **Category**: ${tx.category}\n• **Description**: ${tx.desc}`,
          action: { type: 'add_transaction', tx }
        };
      } else {
        pendingTx = null;
        return { text: `❌ **Cancelled.** Expense not added.`, action: null };
      }
    }

    const intent  = detectIntent(userMsg);
    const context = buildContext(txs);
    const cfg     = window.FINFLOW_CONFIG || {};

    // Helper: Check Red Zone
    const checkRedZone = (tx) => {
      if (tx.type !== 'expense') return false;
      const inc = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
      const exp = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
      return inc > 0 && ((exp + tx.amount) / inc) >= 0.75;
    };

    // Helper: Future-Self Persona Negotiation (Pre-Red Zone Pushback)
    const checkFutureSelfNegotiation = (tx) => {
      if (tx.type !== 'expense') return null;
      const discretionaryCats = ['Entertainment', 'Shopping', 'Other'];
      if (!discretionaryCats.includes(tx.category)) return null;

      const inc = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
      const exp = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
      const bal = inc - exp;
      const spendingPct = inc > 0 ? Math.round(((exp + tx.amount) / inc) * 100) : 100;

      if (tx.amount > bal * 0.10 || spendingPct >= 50) {
        const daysImpact = Math.max(1, Math.round(tx.amount / (inc / 30 || 1000)));
        return `⏳ **Future-Self Persona Negotiation**:\n"Hey! Future You here 🔮. You're currently at **${spendingPct}%** of your total income.\nLogging **₹${tx.amount.toLocaleString('en-IN')}** for **${tx.desc}** (${tx.category}) will reduce your net balance to **₹${(bal - tx.amount).toLocaleString('en-IN')}**, setting back your monthly savings goal by approx **${daysImpact} days**!\n\nAre you sure you want to go ahead with this discretionary purchase? (Yes / No)"`;
      }
      return null;
    };

    // Helper: Check Balance
    const hasBalance = (tx) => {
      if (tx.type !== 'expense') return true;
      const bal = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0) -
                  txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
      return tx.amount <= bal;
    };

    // 1. Gemini API path (Priority if key provided & configured)
    if (isApiKeyConfigured()) {
      try {
        const aiText = await callGemini(userMsg, context);
        const action = parseAction(aiText);

        // Handle transaction addition (with JSON action)
        if (action && action.action === 'add_transaction') {
          if (!hasBalance(action)) {
            const bal = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0) - txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
            return { text: `❌ **Insufficient balance!**\nAvailable: ₹${bal.toLocaleString('en-IN')}\nRequested: ₹${action.amount.toLocaleString('en-IN')}\n\nCan't add this expense.`, action: null };
          }

          const tx = {
            id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
            date: action.date || new Date().toISOString().split('T')[0],
            desc: action.desc || (action.category || 'Other'),
            category: action.category || 'Other',
            type: action.type || 'expense',
            amount: action.amount
          };

          const futureSelfMsg = checkFutureSelfNegotiation(tx);
          if (futureSelfMsg) {
            pendingTx = tx;
            return { text: futureSelfMsg, action: null };
          }

          if (checkRedZone(tx)) {
            pendingTx = tx;
            return { text: `⚠️ **Red Zone Alert!**\nAdding ₹${tx.amount.toLocaleString('en-IN')} will push your total spending above **75%** of your income.\n\nAre you sure you want to log this expense? (Yes / No)`, action: null };
          }

          if (onAction) onAction({ action: 'add_transaction', tx });

          let cleanText = aiText.replace(/```(?:json)?\s*\{.*?\}\s*```/is, '').replace(/\{[^}]*"action"[^}]*\}/is, '').trim();
          if (!cleanText) cleanText = `✅ **Transaction Added by FinBot AI!**\n• **${tx.type === 'income' ? '📈 Income' : '📉 Expense'}**: ₹${tx.amount.toLocaleString('en-IN')}\n• **Category**: ${tx.category}\n• **Description**: ${tx.desc}`;

          return { text: cleanText, action: { type: 'add_transaction', tx } };
        }

        // For all other requests, use Gemini's response directly
        return { text: aiText, action: null };
      } catch (err) {
        const errorMsg = err.message || 'Unknown API error';
        console.warn('Gemini API error:', errorMsg);
        
        // Show error to user if it's a configuration issue
        if (errorMsg.includes('Invalid API Key') || errorMsg.includes('Authentication Failed') || errorMsg.includes('Permission')) {
          return { text: `🔴 **API Configuration Error:**\n${errorMsg}\n\n💡 Using Local Engine for this request...`, action: null };
        }
        
        // For other errors, silently fall back
        console.warn('Falling back to local Engine:', errorMsg);
      }
    }

    // 2. Local Fallback Engine (Fast path / Offline mode)
    if (intent === 'add_income' || intent === 'add_expense') {
      const type   = intent === 'add_income' ? 'income' : 'expense';
      const amount = extractAmount(userMsg);
      const cat    = extractCategory(userMsg);

      const desc = userMsg
        .replace(/(?:add|create|record|log|spent|paid|entered|added|got)\s+(?:income|expense|earn|spend|deposit)/i, '')
        .replace(/₹?\s*\d[\d,\.]*\s*(?:k|K|thousand|crore)?/gi, '')
        .replace(/\b(for|from|on|in|at|to|of|and|got|paid|bought|spent|earned|received|worth|rupees|rs|rs\.)\b/gi, '')
        .trim().replace(/\s+/g,' ').trim() || (type === 'income' ? 'Income' : 'Expense');

      const dateStr = new Date().toISOString().split('T')[0];

      if (!amount || amount <= 0) {
        return { text: `⚠️ I couldn't understand the amount. Try: "Log an expense of ₹500 for supplies"`, action: null };
      }

      const tx = {
        id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
        date: dateStr, desc: desc || (cat === 'Salary' ? 'Salary' : cat),
        category: cat, type, amount
      };

      if (!hasBalance(tx)) {
        const bal = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0) - txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
        return { text: `❌ **Insufficient balance!**\nAvailable: ₹${bal.toLocaleString('en-IN')}\nRequested: ₹${amount.toLocaleString('en-IN')}`, action: null };
      }

      const futureSelfMsg = checkFutureSelfNegotiation(tx);
      if (futureSelfMsg) {
        pendingTx = tx;
        return { text: futureSelfMsg, action: null };
      }

      if (checkRedZone(tx)) {
        pendingTx = tx;
        return { text: `⚠️ **Red Zone Alert!**\nAdding ₹${tx.amount.toLocaleString('en-IN')} will push your total spending above **75%** of your income.\n\nAre you sure you want to log this expense? (Yes / No)`, action: null };
      }

      if (onAction) onAction({ action: 'add_transaction', tx });
      return {
        text: `✅ **Transaction Logged!**\n• **${type === 'income' ? '📈 Income' : '📉 Expense'}**: ₹${amount.toLocaleString('en-IN')}\n• **Category**: ${cat}\n• **Description**: ${tx.desc}`,
        action: { type: 'add_transaction', tx }
      };
    }

    // Handle delete intent (Admin only)
    if (intent === 'delete') {
      const userRole = State.get('role');
      if (userRole !== 'admin') {
        return { text: `❌ **Access Denied.** Only admins can delete transactions.`, action: null };
      }

      const amt = extractAmount(userMsg);
      let matching = [];
      
      if (amt) {
        matching = txs.filter(t => t.amount === amt).slice(-3); // Last 3 matches
      } else {
        // Try to match by description
        const desc = userMsg.replace(/(?:delete|remove|undo|erase)/gi, '').trim();
        matching = txs.filter(t => new RegExp(desc, 'i').test(t.desc)).slice(-3);
      }

      if (matching.length === 0) {
        return { text: `📋 No matching transactions found. Try specifying amount or description.\n\nRecent transactions:\n${txs.slice(0,5).map(t=>`• ${t.date} | ${t.desc} | ₹${t.amount}`).join('\n')}`, action: null };
      }

      if (matching.length === 1) {
        const tx = matching[0];
        if (onAction) onAction({ action: 'delete_transaction', tx });
        return { 
          text: `✅ **Deleted!** ${tx.type.toUpperCase()} of ₹${tx.amount.toLocaleString('en-IN')} (${tx.desc})`,
          action: { type: 'delete_transaction', tx }
        };
      }

      // Multiple matches - ask for confirmation
      return { 
        text: `🔍 Found ${matching.length} matching transactions:\n${matching.map((t,i)=>`${i+1}. ${t.date} | ${t.desc} | ₹${t.amount}`).join('\n')}\n\nBe more specific (use date or exact amount)`,
        action: null 
      };
    }

    return { text: localResponse(intent, userMsg, txs), action: null };
  }

  return { processMessage, detectIntent, buildBudgetPlan };

})();
