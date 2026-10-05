import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

// Initialize GoogleGenAI server-side with required User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// System instruction for the Vehicle Purchase Advisor Agent
const ADVISOR_SYSTEM_INSTRUCTION = `You are TorqueAI, an elite, unbiased Automotive Purchase Advisor & Deal Negotiation Agent.
Your mission is to defend the vehicle buyer against predatory dealer markups, unnecessary backend add-ons, inflated interest rates, and deceptive sales tactics, while guiding them to the vehicle that precisely matches their lifestyle, budget, and 5-year ownership costs.

Core Competencies:
1. Dealer Quote & Out-The-Door (OTD) Auditing: Pinpoint non-mandatory dealer fees (e.g., "Doc fees" exceeding statutory caps, paint protection, nitrogen tires, VIN etching, theft recovery, prep fees).
2. Financing & Lease Mathematics: Compare APR vs loan duration, calculate dealer finance reserve markups, analyze lease money factors and residual values, advise on down payment risk on leases.
3. Total Cost of Ownership (TCO): Evaluate depreciation curves, tire replacement costs, real-world EV charging vs gas expenses, insurance brackets, and long-term powertrain reliability.
4. Negotiation Playbooks: Provide word-for-word tactical email and showroom scripts for counter-offering without hostility, creating competitive dealer leverage, and knowing when to walk away.
5. Vehicle Fit Analysis: Objectively weigh electric, hybrid, plug-in hybrid, and ICE platforms based on user commute, home charging availability, climate, and cargo needs.

Tone & Style:
- Professional, analytical, empowering, and protective of the customer's wallet.
- Use concrete financial figures, bulleted action items, and exact phrasing to say to salespeople.
- Format responses cleanly with readable sections, bold emphasis on dollar amounts and key watchouts, and crisp takeaways.`;

// API endpoint: Conversational advisor agent
app.post('/api/advisor/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured. Please ensure GEMINI_API_KEY is available in environment secrets.',
      });
    }

    // Build context summary if user has vehicle or deal loaded
    let contextPrompt = '';
    if (context) {
      contextPrompt = `\n[Current User Dashboard Context]:
- Selected / Focused Vehicle: ${context.selectedVehicle || 'None'}
- Buyer Budget Target: ${context.budget || 'Not specified'}
- Fuel / Powertrain Preference: ${context.fuelPreference || 'Open'}
- Current Quote Being Audited: ${context.quoteDetails ? JSON.stringify(context.quoteDetails) : 'None'}
- Prioritized Criteria: ${context.priorities ? context.priorities.join(', ') : 'Balanced'}
`;
    }

    // Format chat history into contents
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `System Context & Instructions:\n${ADVISOR_SYSTEM_INSTRUCTION}${contextPrompt}\n\nUser Question/Request:\n${messages[messages.length - 1].content}`,
          },
        ],
      },
    ];

    // If there is preceding conversation history, include the last few turns
    if (messages.length > 1) {
      const turns = messages.slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
      // Prepend context to the first user turn in this window
      if (turns.length > 0 && turns[0].role === 'user') {
        turns[0].parts[0].text = `[Advisor Context: ${contextPrompt}]\n${turns[0].parts[0].text}`;
      }
      contents.length = 0;
      contents.push(...turns);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: ADVISOR_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'I apologize, but I could not formulate an advisory response right now. Please try again.';

    res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Advisor Chat Error:', err);
    res.status(500).json({ error: err.message || 'Failed to process advisory message.' });
  }
});

// API endpoint: Out-the-door Quote Audit & Negotiation Script Generator
app.post('/api/advisor/audit-quote', async (req, res) => {
  try {
    const { vehicle, msrp, dealerPrice, docFee, addOns, apr, termMonths, tradeInValue, downPayment, taxRate } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API is not configured.' });
    }

    const prompt = `Analyze this automotive dealer purchase quote:
Vehicle: ${vehicle || 'Vehicle'}
MSRP / Window Sticker: $${msrp || 0}
Dealer Advertised Price: $${dealerPrice || 0}
Dealer Documentation Fee: $${docFee || 0}
Itemized Dealer Add-Ons: ${JSON.stringify(addOns || [])}
Trade-in Allowance: $${tradeInValue || 0}
Customer Cash Down: $${downPayment || 0}
Offered APR: ${apr || 0}%
Loan Term: ${termMonths || 60} months
Local Tax Rate: ${taxRate || 0}%

Perform an exhaustive buyer advocate audit. Return a strict JSON object with:
1. "dealRating": "Excellent" | "Fair" | "Poor" | "Predatory"
2. "executiveSummary": string (1-2 sentences summarizing deal health)
3. "totalJunkFees": number (estimated sum of overpriced or junk line items)
4. "fairTargetPrice": number (realistic target Out-The-Door price before taxes/gov registration)
5. "potentialSavings": number (estimated negotiable dollars)
6. "lineItemAudits": array of objects with { "name": string, "amount": number, "status": "Legitimate" | "Inflated" | "Junk", "verdict": string, "actionPlan": string }
7. "aprAnalysis": string (critique of offered APR vs competitive credit union rates)
8. "counterOfferScript": string (exact professional email or text to send the sales manager counter-offering)
9. "walkAwayTriggers": array of strings (red flags where customer should walk away)
10. "tacticalChecklist": array of strings (3 actionable steps before signing)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a master automotive finance director acting strictly as the buyer advocate. You produce accurate financial audits in pure JSON format without markdown code fences.',
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Quote Audit Error:', err);
    res.status(500).json({ error: err.message || 'Failed to audit quote.' });
  }
});

// API endpoint: Smart Matchmaker & Recommendation Engine
app.post('/api/advisor/match', async (req, res) => {
  try {
    const { budget, primaryUse, dailyCommuteMiles, hasHomeCharging, passengers, winterDriving, priorities } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API is not configured.' });
    }

    const prompt = `Recommend the top 3 best vehicles for this buyer profile:
- Maximum Purchase Budget: $${budget || 'Flexible'}
- Primary Use: ${primaryUse || 'Commuting & family'}
- Daily Commute: ${dailyCommuteMiles || 25} miles/day
- Home EV Charging Available: ${hasHomeCharging ? 'Yes (Level 2 or 110V)' : 'No (Street/Apartment parking)'}
- Required Passenger Seating: ${passengers || 5}
- Winter Driving / Snow Condition: ${winterDriving ? 'Yes, needs solid AWD/clearance' : 'Mild climate'}
- Top Priorities: ${priorities ? priorities.join(', ') : 'Reliability, low TCO, safety'}

Return a strict JSON object with:
"recommendations": array of 3 objects, each having:
- "rank": number (1, 2, 3)
- "makeModel": string
- "recommendedTrim": string
- "startingMSRP": number
- "powertrain": string ("EV" | "Hybrid" | "PHEV" | "Gas")
- "matchScore": number (80-98)
- "whyItWins": string (concrete explanation why it fits their lifestyle)
- "fiveYearTcoVerdict": string
- "keyPros": array of strings
- "watchouts": array of strings
- "targetNegotiatedPrice": number`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Matchmaker Error:', err);
    res.status(500).json({ error: err.message || 'Failed to match vehicles.' });
  }
});

// Setup Vite or static serving
async function setupServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TorqueAI server listening on port ${PORT} (isProduction: ${isProduction})`);
  });
}

setupServer();
