const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const PASS = process.env.ADMIN_PASS || 'OG12345';

app.get('/', (req, res) => {
  res.send(`
  <html><head><title>OG Supabase</title>
  <style>body{background:#111;color:#fff;font-family:sans-serif;padding:20px}
  input,textarea{width:100%;padding:12px;margin:8px 0;background:#222;color:#fff;border:1px solid #444;border-radius:8px}
  button{padding:12px 20px;background:#00ff88;color:#000;font-weight:bold;border:none;border-radius:8px;width:100%}
  pre{background:#000;padding:15px;overflow:auto;border-radius:8px;margin-top:20px}</style>
  </head><body>
  <h2>🚀 OG Supabase Clone - LIVE</h2>
  <input id="pass" type="password" placeholder="Enter ADMIN_PASS (OG12345)">
  <textarea id="sql" rows="6" placeholder="SELECT * FROM users;">SELECT 1 as test;</textarea>
  <button onclick="run()">Run SQL</button>
  <pre id="out">Result will show here...</pre>
  <script>
  async function run(){
    const res = await fetch('/query',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({password:document.getElementById('pass').value, sql:document.getElementById('sql').value})
    });
    const data = await res.json();
    document.getElementById('out').textContent = JSON.stringify(data, null, 2);
  }
  </script></body></html>
  `);
});

app.post('/query', async (req,res)=>{
  if(req.body.password !== PASS) return res.status(401).json({error:'Wrong password'});
  try{
    const result = await pool.query(req.body.sql);
    res.json({rows:result.rows, rowCount:result.rowCount});
  }catch(e){ res.json({error:e.message}); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>console.log('Running on '+PORT));