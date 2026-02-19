import { GoogleGenerativeAI } from '@google/generative-ai';
import { Expense, Income, ChatMessage } from '../types';
import { GOOGLE_API_KEY } from '@env';

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY || '');
const MODEL = 'gemini-2.5-flash-latest';

export const generateSpendingInsight = async (context: { expenses: Expense[]; incomes?: Income[]; budgets?: Array<Record<string, unknown>>; currency?: string; userName?: string }) => {
  if (!GOOGLE_API_KEY) return 'API key not configured.';
  try {
    const totalExpenses = context.expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = (context.incomes || []).filter(i => (i as Income).status === 'Received').reduce((s, i) => s + i.amount, 0);

    const prompt = `You are a concise finance assistant. Today is ${new Date().toISOString().split('T')[0]}.\nUser data summary:\n- totalExpenses: ${totalExpenses}\n- totalIncome: ${totalIncome}\n- budgets: ${JSON.stringify(context.budgets || [])}\nGive one short actionable insight (max 2 sentences).`;

    const model = genAI.getGenerativeModel({ model: MODEL });
    const res = await model.generateContent(prompt) as unknown;
    const maybe = res as { response?: { text?: () => string }; text?: string } | undefined;
    const text = maybe?.response?.text?.() ?? maybe?.text ?? '';
    return text || 'No insight available.';
  } catch (err) {
    console.error('generateSpendingInsight error', err);
    return 'Could not generate insight.';
  }
};

// Lightweight parsers (fallback to simple regex). Returns same shape as web service but simplified.
export const parseExpenseFromText = async (text: string) => {
  const amountMatch = text.match(/(\d+[.,]?\d{0,2})/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;
  const categories = ['Food','Transport','Entertainment','Utilities','Healthcare','Shopping','Housing','Other'];
  let category = 'Other';
  for (const c of categories) {
    if (text.toLowerCase().includes(c.toLowerCase())) { category = c; break; }
  }
  const dateMatch = text.match(/(today|yesterday|\d{4}-\d{2}-\d{2})/i);
  let date = new Date().toISOString().split('T')[0];
  if (dateMatch) {
    const dm = dateMatch[1].toLowerCase();
    if (dm === 'yesterday') { const d = new Date(); d.setDate(d.getDate() - 1); date = d.toISOString().split('T')[0]; }
    else if (dm === 'today') date = new Date().toISOString().split('T')[0];
    else date = dm;
  }
  const paymentMethod = text.toLowerCase().includes('cash') ? 'Cash' : text.toLowerCase().includes('card') ? 'Card' : 'UPI';
  return { amount, category, description: text, date, paymentMethod };
};

export const parseIncomeFromText = async (text: string) => {
  const amountMatch = text.match(/(\d+[.,]?\d{0,2})/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;
  const categories = ['Salary','Rent','Interest','Business','Gift','Other'];
  let category: string = 'Other';
  for (const c of categories) {
    if (text.toLowerCase().includes(c.toLowerCase())) { category = c; break; }
  }
  const dateMatch = text.match(/(today|yesterday|\d{4}-\d{2}-\d{2})/i);
  let date = new Date().toISOString().split('T')[0];
  if (dateMatch) {
    const dm = dateMatch[1].toLowerCase();
    if (dm === 'yesterday') { const d = new Date(); d.setDate(d.getDate() - 1); date = d.toISOString().split('T')[0]; }
    else if (dm === 'today') date = new Date().toISOString().split('T')[0];
    else date = dm;
  }
  const sourceMatch = text.match(/from\s+([A-Za-z0-9\s]+)/i);
  const source = sourceMatch ? sourceMatch[1].trim() : 'Unknown';
  return { amount, category, source, date };
};

export const chatWithFinancialAssistant = async (message: string, history: ChatMessage[], context: Record<string, unknown> | undefined) : Promise<string> => {
  if (!GOOGLE_API_KEY) return 'AI key not configured.';
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const prompt = `You are Kanakkuvazhakku, an assistant that helps with personal finance. The user said: ${message}. Context summary: ${JSON.stringify(context || {})}`;
    const res = await model.generateContent(prompt) as unknown;
    const maybe = res as { response?: { text?: () => string }; text?: string } | undefined;
    const text = maybe?.response?.text?.() ?? maybe?.text ?? '';
    return text || 'Sorry, I could not process that.';
  } catch (err) {
    console.error('chatWithFinancialAssistant error', err);
    return 'AI service error.';
  }
};