import express from 'express'
import pg from 'pg'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
app.use(cors())
app.use(express.json())

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, 'public')))

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const ADMIN_PASS = process.env.ADMIN_PASS || 'OG12345'

app.post('/api/query', async (req, res) => {
  if (req.headers['x-admin-pass'] !== ADMIN_PASS) {
    return res.json({ error: 'Wrong admin password' })
  }
  try {
    const result = await db.query(req.body.sql)
    res.json({ rows: result.rows, count: result.rowCount })
  } catch (e) {
    res.json({ error: e.message })
  }
})

app.get('/api/users', async (req, res) => {
  if (req.headers['x-admin-pass'] !== ADMIN_PASS) {
    return res.status(401).json({ error: 'unauth' })
  }
  const r = await db.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 100')
  res.json(r.rows)
})

app.listen(process.env.PORT || 3000, () => console.log('OG Supabase Running'))