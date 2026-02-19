/* global fetch, process */
import { Expense, Income, ChatMessage } from '../types';
import * as SecureStore from 'expo-secure-store';

// Types for tool arguments
type ExpenseArgs = Partial<Pick<Expense, 'amount' | 'category' | 'description' | 'date' | 'paymentMethod'>>;
type IncomeArgs = Partial<Pick<Income, 'amount' | 'category' | 'source' | 'date' | 'recurrence'>>;

// Use a server proxy for AI calls to keep the API key off the client.
// Configure proxy URL with GEMINI_PROXY_URL env or fallback to localhost:4000
const PROXY = typeof process !== 'undefined' && (process.env.GEMINI_PROXY_URL as string)
  ? (process.env.GEMINI_PROXY_URL as string)
  : 'http://localhost:4000/api';

const USER_KEY_STORE = 'GEMINI_USER_KEY';

export const setUserApiKey = async (key: string) => {
  try {
    await SecureStore.setItemAsync(USER_KEY_STORE, key);
  } catch (err) {
    console.error('setUserApiKey error', err);
    throw err;
  }
};

export const getUserApiKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(USER_KEY_STORE);
  } catch (err) {
    console.error('getUserApiKey error', err);
    return null;
  }
};

export const removeUserApiKey = async () => {
  try {
    await SecureStore.deleteItemAsync(USER_KEY_STORE);
  } catch (err) {
    console.error('removeUserApiKey error', err);
    throw err;
  }
};

export const generateSpendingInsight = async (context: { expenses: Expense[]; incomes?: Income[]; budgets?: Array<Record<string, unknown>>; currency?: string; userName?: string }) => {
  // proxy-based: API key is kept on the server
  try {
    const totalExpenses = context.expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = (context.incomes || []).filter(i => (i as Income).status === 'Received').reduce((s, i) => s + i.amount, 0);

    const prompt = `You are a concise finance assistant. Today is ${new Date().toISOString().split('T')[0]}.\nUser data summary:\n- totalExpenses: ${totalExpenses}\n- totalIncome: ${totalIncome}\n- budgets: ${JSON.stringify(context.budgets || [])}\nGive one short actionable insight (max 2 sentences).`;

    const resp = await fetch(`${PROXY}/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context, prompt }),
    });
    const json = await resp.json();
    return json.text || 'No insight available.';
  } catch (err) {
    console.error('generateSpendingInsight error', err);
    return 'Could not generate insight.';
  }
};

// Lightweight parsers (fallback to simple regex). Returns same shape as web service but simplified.
export const parseExpenseFromText = async (text: string) => {
  // Try proxy first
  try {
    const resp = await fetch(`${PROXY}/parse/expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (resp.ok) {
      const json = await resp.json();
      return {
        amount: Number(json.amount || 0),
        category: json.category || 'Other',
        description: json.description || text,
        date: json.date || new Date().toISOString().split('T')[0],
        paymentMethod: json.paymentMethod || 'UPI',
      };
    }
  } catch (err) {
    console.warn('Expense parse proxy failed, falling back to local parser', err);
  }

  // Fallback: local lightweight parser
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
  // Try proxy first
  try {
    const resp = await fetch(`${PROXY}/parse/income`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (resp.ok) {
      const json = await resp.json();
      return {
        amount: Number(json.amount || 0),
        category: json.category || 'Other',
        source: json.source || 'Unknown',
        date: json.date || new Date().toISOString().split('T')[0],
      };
    }
  } catch (err) {
    console.warn('Income parse proxy failed, falling back to local parser', err);
  }

  // Fallback: local lightweight parser
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

export const chatWithFinancialAssistant = async (
  message: string,
  history: ChatMessage[],
  context: Record<string, unknown> | undefined,
  onAddExpense?: (args: ExpenseArgs) => void | Promise<void>,
  onAddIncome?: (args: IncomeArgs) => void | Promise<void>,
  onDeleteTransaction?: (type: 'expense' | 'income', id?: string) => Promise<string> | string
) : Promise<string> => {
  try {
    // 1) send user message to proxy
    const resp = await fetch(`${PROXY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, context }),
    });
    const json = await resp.json();

    // 2) if model returned a functionCall, execute the corresponding local handler and then send the function result back to the proxy to get final text
    if (json.functionCall && typeof json.functionCall === 'object') {
      const call = json.functionCall;
      let functionResult = 'Tool executed.';

      try {
        if (call.name === 'add_expense' && onAddExpense) {
          await Promise.resolve(onAddExpense(call.args));
          functionResult = 'Expense added successfully.';
        } else if (call.name === 'add_income' && onAddIncome) {
          await Promise.resolve(onAddIncome(call.args));
          functionResult = 'Income added successfully.';
        } else if (call.name === 'delete_transaction' && onDeleteTransaction) {
          functionResult = String(await onDeleteTransaction(call.args?.type as 'expense' | 'income', call.args?.id as string | undefined));
        } else {
          functionResult = 'Requested tool not available on client.';
        }
      } catch {
        functionResult = 'Error executing requested operation.';
      }

      // send function result back to proxy so the model can produce a final text
      const followUp = await fetch(`${PROXY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ functionResponse: { name: call.name, result: functionResult }, history, context }),
      });
      const finalJson = await followUp.json();
      return finalJson.text || functionResult;
    }

    // no function call — return the model text
    return json.text || 'Sorry, I could not process that.';
  } catch (err) {
    console.error('chatWithFinancialAssistant proxy error', err);
    return 'AI service error.';
  }
};