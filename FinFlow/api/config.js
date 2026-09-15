/* ═══════════════════════════════════════════════════════════
   FinFlow — API Configuration
   Place your API keys here. Never commit real keys to GitHub.
   ═══════════════════════════════════════════════════════════ */

const FINFLOW_CONFIG = {

  // ── AI CONFIGURATION ──────────────────────────────────────────
  // Get free API key from: https://ai.google.dev/
  // Sign up → Create API Key → Enable Generative AI API
  // IMPORTANT: This key appears exposed - use env vars or backend proxy in production!
  GEMINI_API_KEY: 'AIzaSyAmPtpq62iO8wxgX70x3RkRTaWBlCCXCIQ',
  // Note: If API key is invalid or expired, FinBot defaults to Local Engine automatically

  // Language Model Configuration
  GEMINI_MODEL: 'gemini-1.5-flash',

  // ── RAG ENGINE SETTINGS ───────────────────────────────────────
  // Context window transaction limit
  RAG_MAX_TRANSACTIONS: 50,

  // Historical analysis window (months)
  BUDGET_ANALYSIS_MONTHS: 3,

  // ── REGIONAL SETTINGS ─────────────────────────────────────────
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',

};

// DO NOT EDIT BELOW THIS LINE
if (typeof window !== 'undefined') window.FINFLOW_CONFIG = FINFLOW_CONFIG;

/* 
   ═══════════════════════════════════════════════════════════
   TROUBLESHOOTING API ISSUES
   ═══════════════════════════════════════════════════════════
   
   ❌ "API Authentication Failed"
      → Get new key: https://ai.google.dev/
      → Verify key format (should be 40+ chars)
      
   ❌ "API Permission Denied"
      → Enable "Generative Language API" in Google Cloud Console
      → Check API quota limits haven't been exceeded
      
   ❌ "Rate Limited"
      → Free tier has limits (requests per minute)
      → Wait a moment and retry
      → Consider upgrading to paid tier
      
   ❌ CORS/Network Errors
      → Check internet connection
      → API is only available from web (not localhost file://)
      → Use local server: python -m http.server 8000
      
   ✅ No errors but slow responses?
      → FinBot is using AI to analyze your data
      → This is normal - first request is slower
      → Local fallback engine is always available as backup
      
   💡 If API fails, FinBot automatically uses fast Local Engine!
*/
