const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  to: string
  name: string
  tickets: Array<{
    barcode: string
    holder_name: string
  }>
}

async function readResponse(conn: Deno.Conn): Promise<string> {
  let full = ''
  const buf = new Uint8Array(4096)
  // Read until we get a complete SMTP response (lines starting with digits + space, not dash)
  while (true) {
    const n = await conn.read(buf)
    if (n === null) break
    full += new TextDecoder().decode(buf.subarray(0, n))
    // Check if last line is final (code + space, not code + dash)
    const lines = full.split('\r\n').filter(l => l.length > 0)
    const lastLine = lines[lines.length - 1]
    if (lastLine && /^\d{3}\s/.test(lastLine)) break
  }
  return full
}

async function sendCmd(conn: Deno.Conn, cmd: string): Promise<string> {
  await conn.write(new TextEncoder().encode(cmd + '\r\n'))
  return await readResponse(conn)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { to, name, tickets }: EmailRequest = await req.json()

    if (!to || !tickets || tickets.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
    const smtpUser = Deno.env.get('SMTP_USER') || ''
    const smtpPass = Deno.env.get('SMTP_PASSWORD') || ''
    const smtpFrom = Deno.env.get('SMTP_FROM') || smtpUser

    // Generate QR code URLs
    const qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/'
    const ticketList = tickets.map((t, i) => {
      const qrUrl = `${qrApiUrl}?size=150x150&data=${encodeURIComponent(t.barcode)}`
      return `
        <div style="margin-bottom:20px;padding:15px;background:#111;border-radius:10px;border:1px solid #D4AF37;">
          <h3 style="color:#D4AF37;margin:0 0 10px 0;">Tiket ${i + 1}</h3>
          <p style="color:#fff;margin:0 0 10px 0;"><strong>${t.holder_name}</strong></p>
          <img src="${qrUrl}" alt="QR Code" style="border-radius:8px;" />
          <p style="color:#888;font-family:monospace;font-size:12px;margin:10px 0 0 0;">${t.barcode}</p>
        </div>
      `
    }).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body{font-family:'Inter',sans-serif;background:#050505;color:#fff;margin:0;padding:20px;}
          .container{max-width:500px;margin:0 auto;}
          h1{color:#D4AF37;font-family:'Cinzel',serif;text-align:center;}
          .footer{text-align:center;color:#666;font-size:12px;margin-top:30px;}
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Prom Night 2026</h1>
          <p style="text-align:center;color:#888;">Hai ${name},</p>
          <p style="text-align:center;color:#ccc;">Berikut adalah tiket digital kamu:</p>
          ${ticketList}
          <div class="footer">
            <p>Tunjukkan QR Code ini saat masuk acara.</p>
            <p>Prom Night 2026 — Last Appearance</p>
          </div>
        </div>
      </body>
      </html>
    `

    // SMTP: Connect plain, then STARTTLS
    const conn = await Deno.connect({ hostname: smtpHost, port: smtpPort })

    // 1. Read greeting
    await readResponse(conn)

    // 2. EHLO (plain)
    await sendCmd(conn, `EHLO ${smtpHost}`)

    // 3. STARTTLS
    const starttlsResp = await sendCmd(conn, 'STARTTLS')
    if (!starttlsResp.startsWith('220')) {
      throw new Error(`STARTTLS failed: ${starttlsResp}`)
    }

    // 4. Upgrade to TLS
    const tlsConn = await Deno.startTls(conn, { hostname: smtpHost })

    // 5. EHLO again (over TLS)
    await sendCmd(tlsConn, `EHLO ${smtpHost}`)

    // 6. AUTH LOGIN
    const authResp = await sendCmd(tlsConn, 'AUTH LOGIN')
    if (!authResp.startsWith('334')) {
      throw new Error(`AUTH LOGIN failed: ${authResp}`)
    }

    // 7. Send username (base64)
    const userResp = await sendCmd(tlsConn, btoa(smtpUser))
    if (!userResp.startsWith('334')) {
      throw new Error(`Username rejected: ${userResp}`)
    }

    // 8. Send password (base64)
    const passResp = await sendCmd(tlsConn, btoa(smtpPass))
    if (!passResp.startsWith('235')) {
      throw new Error(`Authentication failed: ${passResp}`)
    }

    // 9. MAIL FROM
    const mailFromResp = await sendCmd(tlsConn, `MAIL FROM:<${smtpFrom}>`)
    if (!mailFromResp.startsWith('250')) {
      throw new Error(`MAIL FROM failed: ${mailFromResp}`)
    }

    // 10. RCPT TO
    const rcptResp = await sendCmd(tlsConn, `RCPT TO:<${to}>`)
    if (!rcptResp.startsWith('250')) {
      throw new Error(`RCPT TO failed: ${rcptResp}`)
    }

    // 11. DATA
    const dataResp = await sendCmd(tlsConn, 'DATA')
    if (!dataResp.startsWith('354')) {
      throw new Error(`DATA failed: ${dataResp}`)
    }

    // 12. Send email content
    const subjectEncoded = btoa(`Tiket Prom Night 2026 - ${tickets.length} Tiket`)
    const emailContent = [
      `From: Prom Night 2026 <${smtpFrom}>`,
      `To: <${to}>`,
      `Subject: =?UTF-8?B?${subjectEncoded}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `Date: ${new Date().toUTCString()}`,
      ``,
      html,
      `.`
    ].join('\r\n')

    const sendResp = await sendCmd(tlsConn, emailContent)
    if (!sendResp.startsWith('250')) {
      throw new Error(`Send failed: ${sendResp}`)
    }

    // 13. QUIT
    await sendCmd(tlsConn, 'QUIT')
    tlsConn.close()

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('SMTP Error:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
