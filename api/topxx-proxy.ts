import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { path: apiPath, ...queryParams } = req.query;
    
    if (!apiPath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    const url = new URL(`https://topxx.vip/api/v1/${apiPath}`);
    
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key]) {
        url.searchParams.append(key, queryParams[key] as string);
      }
    });
    
    console.log(`Vercel TopXX Proxy calling: ${url.toString()}`);
    
    const apiRes = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      return res.status(apiRes.status).send(errorText);
    }
    
    const data = await apiRes.json();
    return res.json(data);
  } catch (err: any) {
    console.error("Vercel TopXX Proxy Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
