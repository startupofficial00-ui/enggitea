// ============================================
// ENGGI TEA - SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL =
    "https://oeczqbbdjifhyobhhcys.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_7Mt2qUoOUlgNnHwWN6OUDw__Q9i1DrJ"


// Create Supabase client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// Make available globally
window.supabaseClient = supabaseClient;

console.log("✅ Supabase frontend connected");