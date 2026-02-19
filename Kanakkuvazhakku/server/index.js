/* global process, console */
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.GOOGLE_API_KEY || process.env.GENERATIVE_API_KEY || '';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

if (!API_KEY) {
  console.warn('[gemini-proxy] GOOGLE_API_KEY not set — proxy will return an error for AI requests');
}

const ai = new GoogleGenerativeAI(API_KEY || '');
const MODEL = 'gemini-2.5-flash-latest';

app.post('/api/insight', async (req, res) => {
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured on server' });
  try {
    const context = req.body || {};
    const today = new Date().toISOString().split('T')[0];
    const totalExpensesAmount = (context.expenses || []).reduce((s, e) => s + (e?.amount || 0), 0);
    const totalIncomeAmount = (context.incomes || []).filter(i => i.status === 'Received').reduce((s, i) => s + (i?.amount || 0), 0);

    const contextString = JSON.stringify({
      currentDate: today,
      totalExpensesAmount,
      totalIncomeAmount,
      cashFlow: totalIncomeAmount - totalExpensesAmount,
      recentExpenses: (context.expenses || []).slice(0, 20),
      budgets: context.budgets || [],
      pendingIncomes: (context.incomes || []).filter(i => i.status === 'Overdue' || i.status === 'Expected')
    });

    const prompt = `Analyze this financial data. Provide one short, impactful insight (max 2 sentences) focusing on cash flow, overdue income (especially rent), or budget adherence. User Data: ${contextString}`;

    const model = ai.getGenerativeModel({ model: MODEL });
    const reply = await model.generateContent(prompt);
    const text = (reply?.response?.text?.() ?? reply?.text) || '';
    res.json({ text });
  } catch (err) {
    console.error('[gemini-proxy]/insight error', err);
    res.status(500).json({ error: 'AI service error' });
  }
});

app.post('/api/chat', async (req, res) => {
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured on server' });
  try {
    const { message, history, context, functionResponse } = req.body || {};

    // If caller is sending a functionResponse (result of a tool execution), ask the model to continue
    if (functionResponse) {
      const followUpPrompt = `System: You are Kanakkuvazhakku, a concise personal finance assistant. A tool was executed with the following result: ${JSON.stringify(functionResponse)}\nPlease respond briefly to the user acknowledging the result and continue the conversation if needed.`;
      const model = ai.getGenerativeModel({ model: MODEL });
      const reply = await model.generateContent(followUpPrompt);
      const text = (reply?.response?.text?.() ?? reply?.text) || '';
      return res.json({ text });
    }

    // Normal handling: instruct the model how to call tools (if needed).
    const systemInstruction = `You are Kanakkuvazhakku, an assistant that helps with personal finance. You have access to the following tools if necessary:

1) add_expense(amount, category, description, date, paymentMethod)
2) add_income(amount, category, source, date, recurrence)
3) delete_transaction(type, id)

When you decide a tool should be invoked, output ONLY valid JSON with a top-level field named "functionCall" of the form: {"functionCall": {"name": "<tool_name>", "args": { ... } }} and nothing else. If you do not need to call a tool, output a normal user-facing reply (plain text). Respond concisely and in a mobile-friendly manner.`;

    const userPrompt = `User: ${message}\nChatHistory: ${JSON.stringify(history || [])}\nContext: ${JSON.stringify(context || {})}`;

    const model = ai.getGenerativeModel({ model: MODEL });
    const reply = await model.generateContent(`${systemInstruction}\n\n${userPrompt}`);
    const text = (reply?.response?.text?.() ?? reply?.text) || '';

    // Try to parse JSON functionCall if model followed the tool instruction
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.functionCall) {
        return res.json({ functionCall: parsed.functionCall });
      }
    } catch {
      // not JSON — return plain text
    }

    res.json({ text });
  } catch (err) {
    console.error('[gemini-proxy]/chat error', err);
    res.status(500).json({ error: 'AI service error' });
  }
});

app.post('/api/parse/expense', async (req, res) => {
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured on server' });
  try {
    const { text } = req.body || {};
    const today = new Date().toISOString().split('T')[0];
    const prompt = `Return a JSON object with keys amount (number), category (one of Food,Transport,Entertainment,Utilities,Healthcare,Shopping,Housing,Other), description (string), date (YYYY-MM-DD) and paymentMethod (Cash|Card|UPI|Other).\nText: "${text}"\nIf a value cannot be inferred, return a reasonable default.`;
    const model = ai.getGenerativeModel({ model: MODEL });
    const reply = await model.generateContent(prompt);
    const textReply = (reply?.response?.text?.() ?? reply?.text) || '';
    let parsed = {};
    try { parsed = JSON.parse(textReply); } catch {
      const amt = (text || '').match(/(\d+[.,]?\d{0,2})/);
      parsed = { amount: amt ? parseFloat(amt[1].replace(',', '.')) : 0, category: 'Other', description: text || '', date: today, paymentMethod: 'UPI' };
    }
    res.json(parsed);
  } catch (err) {
    console.error('[gemini-proxy]/parse/expense error', err);
    res.status(500).json({ error: 'AI service error' });
  }
});

app.post('/api/parse/income', async (req, res) => {
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured on server' });
  try {
    const { text } = req.body || {};
    const today = new Date().toISOString().split('T')[0];
    const prompt = `Return a JSON object with keys amount (number), category (Salary|Rent|Interest|Business|Gift|Other), source (string) and date (YYYY-MM-DD).\nText: "${text}"\nIf a value cannot be inferred, return a reasonable default.`;
    const model = ai.getGenerativeModel({ model: MODEL });
    const reply = await model.generateContent(prompt);
    const textReply = (reply?.response?.text?.() ?? reply?.text) || '';
    let parsed = {};
    try { parsed = JSON.parse(textReply); } catch {
      const amt = (text || '').match(/(\d+[.,]?\d{0,2})/);
      parsed = { amount: amt ? parseFloat(amt[1].replace(',', '.')) : 0, category: 'Other', source: 'Unknown', date: today };
    }
    res.json(parsed);
  } catch (err) {
    console.error('[gemini-proxy]/parse/income error', err);
    res.status(500).json({ error: 'AI service error' });
  }
});

app.listen(PORT, () => {
  console.log(`[gemini-proxy] listening on http://localhost:${PORT} — API key configured: ${!!API_KEY}`);
});
