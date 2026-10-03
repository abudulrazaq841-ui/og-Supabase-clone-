function quick(sql) {
  document.getElementById('sql').value = sql
  runQuery()
}

async function runQuery() {
  const sql = document.getElementById('sql').value
  const pass = document.getElementById('pass').value
  const output = document.getElementById('output')

  if (!pass) {
    output.innerHTML = '<div class="error">Enter admin password first</div>'
    return
  }

  output.innerHTML = '<div class="empty">Running...</div>'

  try {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pass': pass
      },
      body: JSON.stringify({ sql })
    })
    const data = await res.json()

    if (data.error) {
      output.innerHTML = `<div class="error">❌ ${data.error}</div>`
      return
    }

    if (!data.rows || data.rows.length === 0) {
      output.innerHTML = `<div class="success">✅ Success - ${data.count} rows affected</div>`
      return
    }

    // Build table
    let html = `<div class="success">✅ ${data.rows.length} rows returned</div>`
    html += '<table><tr>'
    Object.keys(data.rows[0]).forEach(k => html += `<th>${k}</th>`)
    html += '</tr>'

    data.rows.forEach(row => {
      html += '<tr>'
      Object.values(row).forEach(v => {
        let val = v === null ? '<i style="color:#666">NULL</i>' : String(v)
        if (val.length > 100) val = val.slice(0, 100) + '...'
        html += `<td>${val}</td>`
      })
      html += '</tr>'
    })
    html += '</table>'
    output.innerHTML = html

  } catch (e) {
    output.innerHTML = `<div class="error">Network error: ${e.message}</div>`
  }
}

document.getElementById('runBtn').addEventListener('click', runQuery)
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') runQuery()
})