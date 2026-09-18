export interface ScanReceiptResult {
  shopName: string;
  totalAmount: number;
  items: Array<{ name: string; price: number }>;
  suggestedCategory: string;
  date?: string;
}

export async function scanReceiptWithGemini(
  base64Image: string,
  mimeType: string,
  apiKey?: string
): Promise<ScanReceiptResult> {
  const key = apiKey || localStorage.getItem('hishab_gemini_key') || '';

  if (!key) {
    // If no API key configured, provide an intelligent demo fallback
    await new Promise((r) => setTimeout(r, 1200));
    return {
      shopName: 'Shwapno Supermarket',
      totalAmount: 480,
      items: [
        { name: 'Miniket Rice 1kg', price: 85 },
        { name: 'Soybean Oil 1L', price: 195 },
        { name: 'Farm Fresh Eggs (1 Dozen)', price: 150 },
        { name: 'Onion 500g', price: 50 }
      ],
      suggestedCategory: 'bazaar',
      date: new Date().toISOString().split('T')[0]
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

  const prompt = `Analyze this shopping memo or receipt from Bangladesh. Extract:
1. shopName (string)
2. totalAmount (total paid in BDT number)
3. items (list of { name: string, price: number })
4. suggestedCategory (one of: 'bazaar', 'dining', 'transport', 'utilities', 'health', 'shopping', 'general')
5. date (YYYY-MM-DD if visible)

Respond ONLY with valid JSON matching this schema:
{
  "shopName": "...",
  "totalAmount": 0,
  "items": [{ "name": "...", "price": 0 }],
  "suggestedCategory": "...",
  "date": "..."
}`;

  const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        response_mime_type: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
  }

  const json = await response.json();
  const textResponse = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error('Empty response from Gemini Vision.');
  }

  return JSON.parse(textResponse) as ScanReceiptResult;
}
