import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import fs from "fs";
import { createRequestHandler } from "@react-router/express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase client SDK for server-side use
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const expressApp = express();
  const PORT = 3000;

  expressApp.set('trust proxy', true);
  
  // CORS configuration
  expressApp.use(cors({
    origin: (origin, callback) => {
      // Allow all origins for now to fix the Cloudflare issues
      // You can restrict this later to your specific domains
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }));

  // Handle OPTIONS preflight for all routes
  expressApp.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });

  // Custom logging middleware
  expressApp.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.url} - IP: ${req.ip} - ${new Date().toISOString()}`);
    next();
  });
  expressApp.use(express.json());

  // Security Headers Middleware
  expressApp.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // API Route for notifications
  expressApp.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /_*

Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml
`);
  });

  expressApp.get("/sitemap.xml", async (req, res) => {
    try {
      const host = `${req.protocol}://${req.get("host")}`;
      const langs = ['uk', 'en', 'de', 'ru'];
      const baseRoutes = ['', '/blog', '/posluhy', '/kontakty'];
      
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

      // Base pages for each language
      for (const lang of langs) {
        for (const route of baseRoutes) {
          const url = `${host}/${lang}${route}`;
          xml += `  <url>\n    <loc>${url}</loc>\n`;
          xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;
          
          // Hreflang links
          for (const altLang of langs) {
            xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${host}/${altLang}${route}"/>\n`;
          }
          xml += `  </url>\n`;
        }
      }

      // Dynamic Blog Posts
      try {
        const blogSnap = await getDocs(collection(db, 'blog'));
        for (const postDoc of blogSnap.docs) {
          const post = postDoc.data();
          if (post.status === 'published' || !post.status) {
            const slug = post.slug;
            if (slug) {
              for (const lang of langs) {
                const url = `${host}/${lang}/blog/${slug}`;
                xml += `  <url>\n    <loc>${url}</loc>\n`;
                xml += `    <lastmod>${(post.updatedAt?.toDate && post.updatedAt.toDate().toISOString().split('T')[0]) || new Date().toISOString().split('T')[0]}</lastmod>\n`;
                xml += `    <changefreq>monthly</changefreq>\n`;
                xml += `    <priority>0.6</priority>\n`;
                for (const altLang of langs) {
                  xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${host}/${altLang}/blog/${slug}"/>\n`;
                }
                xml += `  </url>\n`;
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching blog posts for sitemap:', err);
      }

      xml += '</urlset>';
      res.type('application/xml');
      res.send(xml);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  expressApp.post("/api/notify", async (req, res) => {
    try {
      const { type, data } = req.body;
      console.log(`[Notification API] Request received: type=${type}`, data);

      if (type === 'new_lead' || type === 'new_review') {
        const isLead = type === 'new_lead';
        
        // 1. Fetch Email Settings
        console.log('[Notification API] Fetching settings/email from Firestore...');
        let emailSettingsDoc;
        try {
          emailSettingsDoc = await getDoc(doc(db, 'settings', 'email'));
        } catch (dbErr) {
          console.error('[Notification API] Database fetch error:', dbErr);
          throw new Error(`Failed to fetch settings from Firestore: ${(dbErr as Error).message}`);
        }
        
        if (!emailSettingsDoc.exists()) {
           console.warn('[Notification API] Email settings not found in Firestore');
           return res.status(404).json({ error: 'Email settings not found in database. Please configure SMTP in the admin panel.' });
        }
        
        const emailSettings = emailSettingsDoc.data() || {};
        console.log('[Notification API] Email settings fetched. Admin notifications enabled:', emailSettings.adminNotifications?.enabled);

        // Check if specific notification type is disabled
        const notificationsConfig = emailSettings.adminNotifications || {};
        if (isLead && notificationsConfig.notifyOnNewLead === false) {
          console.log('[Notification API] Lead notifications are explicitly disabled');
          return res.status(200).json({ message: 'Lead notifications disabled' });
        }
        if (!isLead && notificationsConfig.notifyOnNewReview === false) {
          console.log('[Notification API] Review notifications are explicitly disabled');
          return res.status(200).json({ message: 'Review notifications disabled' });
        }

        // 2. Resolve Recipients
        const recipients: string[] = [];
        
        // A. From notification_connections collection
        try {
          console.log('[Notification API] Fetching recipients from notification_connections...');
          const connectionsSnap = await getDocs(
            query(
              collection(db, 'notification_connections'), 
              where('type', '==', 'email'), 
              where('isActive', '==', true)
            )
          );
          connectionsSnap.forEach(doc => {
            const val = doc.data().value;
            if (val && !recipients.includes(val)) {
              recipients.push(val);
            }
          });
          console.log(`[Notification API] Found ${connectionsSnap.size} active email connections. Total unique recipients: ${recipients.length}`);
        } catch (connErr) {
          console.error('[Notification API] Error fetching connections:', connErr);
          // Don't throw, we have fallbacks
        }

        // B. From admin notifications setting
        if (notificationsConfig.enabled && notificationsConfig.recipient) {
          if (!recipients.includes(notificationsConfig.recipient)) {
            recipients.push(notificationsConfig.recipient);
            console.log(`[Notification API] Added recipient from settings: ${notificationsConfig.recipient}`);
          }
        }

        // C. Fallback to SMTP user
        if (recipients.length === 0) {
          if (emailSettings.smtp?.user) {
            recipients.push(emailSettings.smtp.user);
            console.log(`[Notification API] Fallback: added SMTP user as recipient: ${emailSettings.smtp.user}`);
          } else {
            const errMsg = 'No recipients configured and no SMTP user fallback available';
            console.warn(`[Notification API] ${errMsg}`);
            return res.status(200).json({ message: errMsg });
          }
        }

        // 3. Configure NodeMailer
        const smtpConfig = emailSettings.smtp;
        if (!smtpConfig || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
           console.error('[Notification API] SMTP configuration is incomplete:', { host: !!smtpConfig?.host, user: !!smtpConfig?.user, pass: !!smtpConfig?.pass });
           return res.status(500).json({ error: 'SMTP server is not fully configured. Please go to Admin -> Email Settings.' });
        }

        const transporter = nodemailer.createTransport({
          host: smtpConfig.host.trim(),
          port: parseInt(smtpConfig.port) || 587,
          secure: smtpConfig.port.toString().trim() === "465", 
          auth: {
            user: smtpConfig.user.trim(),
            pass: smtpConfig.pass.trim(),
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        // 4. Content Preparation
        let subject = '';
        let text = '';
        let html = '';

        if (isLead) {
          subject = `Нова заявка: ${data.clientName || 'Клієнт'}`;
          text = `Нова заявка на сайті:\nІм'я: ${data.clientName}\nТелефон: ${data.phone}\nПослуга: ${data.serviceType}\nПовідомлення: ${data.message}`;
          html = `<h3>Нова заявка на сайті</h3><p><b>Ім'я:</b> ${data.clientName}</p><p><b>Телефон:</b> ${data.phone}</p><p><b>Послуга:</b> ${data.serviceType}</p><p><b>Повідомлення:</b> ${data.message}</p>`;
        } else {
          subject = `Новий відгук від: ${data.clientName || 'Клієнт'}`;
          text = `Новий відгук на сайті:\nІм'я: ${data.clientName}\nОцінка: ${data.rating}/5\nПовідомлення: ${data.message}`;
          html = `<h3>Новий відгук на сайті</h3><p><b>Ім'я:</b> ${data.clientName}</p><p><b>Оцінка:</b> ${data.rating}/5</p><p><b>Повідомлення:</b> ${data.message}</p>`;
        }

        // 5. Send Notification
        console.log(`[Notification API] Sending email to ${recipients.length} recipients: ${recipients.join(', ')}`);
        try {
          await transporter.sendMail({
            from: smtpConfig.fromEmail || smtpConfig.user,
            to: recipients.join(', '),
            subject,
            text,
            html
          });
          console.log('[Notification API] Notification email(s) sent successfully');
        } catch (mailErr) {
          console.error('[Notification API] NodeMailer Error:', mailErr);
          // Don't throw here, we might have telegram to send
        }

        // 6. Telegram Notification
        if (emailSettings.telegram?.botToken) {
          const botToken = emailSettings.telegram.botToken.trim();
          
          // Fetch Telegram recipients
          const tgRecipients: string[] = [];
          try {
            const tgConnectionsSnap = await getDocs(
              query(
                collection(db, 'notification_connections'), 
                where('type', '==', 'telegram'), 
                where('isActive', '==', true)
              )
            );
            tgConnectionsSnap.forEach(doc => {
              const val = doc.data().value;
              if (val && !tgRecipients.includes(val)) tgRecipients.push(val);
            });
          } catch (err) {
            console.error('[Notification API] Error fetching Telegram connections:', err);
          }

          if (tgRecipients.length > 0) {
            console.log(`[Notification API] Sending Telegram notification to ${tgRecipients.length} recipients`);
            for (const chatId of tgRecipients) {
              try {
                // Telegram API IDs can be numbers or strings starting with -
                const cleanChatId = chatId.trim();
                const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
                await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: cleanChatId,
                    text: `🔔 *${isLead ? 'НОВА ЗАЯВКА' : 'НОВИЙ ВІДГУК'}*\n\n${text}`,
                    parse_mode: 'Markdown'
                  })
                });
              } catch (tgErr) {
                console.error(`[Notification API] Telegram Error for ${chatId}:`, tgErr);
              }
            }
          }
        }

        return res.json({ success: true });
      }

      res.status(400).json({ error: 'Invalid notification type' });
    } catch (error) {
      console.error('[Notification API] Critical Error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  expressApp.post("/api/test-telegram", async (req, res) => {
    try {
      const { botToken, chatId } = req.body;
      const finalToken = (botToken || process.env.TELEGRAM_BOT_TOKEN || "").trim();
      
      if (!finalToken || !chatId) {
        return res.status(400).json({ error: 'Missing Bot Token or Chat ID' });
      }

      console.log(`[Telegram Test] Testing bot ${finalToken.substring(0, 5)}... for chat ${chatId}`);
      
      const url = `https://api.telegram.org/bot${finalToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: '🧪 *Тестове повідомлення*\n\nВаш Telegram-бот успішно підключений до сайту!',
          parse_mode: 'Markdown'
        })
      });

      const data = await response.json();
      if (data.ok) {
        return res.json({ success: true });
      } else {
        return res.status(400).json({ error: data.description || 'Failed to send Telegram message' });
      }
    } catch (error) {
      console.error('[Telegram Test] Error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  expressApp.post("/api/test-smtp", async (req, res) => {
    try {
      const { smtp } = req.body;
      console.log('Received SMTP Test Request:', { ...smtp, pass: '***' });

      if (!smtp) {
        return res.status(400).json({ error: 'SMTP configuration is missing in request' });
      }

      if (!smtp.host) return res.status(400).json({ error: 'SMTP Host is missing' });
      if (!smtp.user) return res.status(400).json({ error: 'SMTP User is missing' });
      if (!smtp.pass) return res.status(400).json({ error: 'SMTP Password is missing' });

      const transporter = nodemailer.createTransport({
        host: smtp.host.trim(),
        port: parseInt(smtp.port) || 587,
        secure: smtp.port.toString().trim() === "465",
        auth: {
          user: smtp.user.trim(),
          pass: smtp.pass.trim(),
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.verify();
      
      // Try sending a test email
      await transporter.sendMail({
        from: smtp.fromEmail || smtp.user,
        to: smtp.user,
        subject: 'Тест SMTP - Адвокат Дар\'я Богдашкіна',
        text: 'SMTP налаштовано успішно! Це тестове повідомлення.'
      });

      res.json({ success: true });
    } catch (error) {
      console.error('SMTP Test Error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Vite middleware for development or React Router handler for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // React Router 7 uses custom appType for SSR
    });
    expressApp.use(vite.middlewares);
    
    expressApp.all("*", async (req, res, next) => {
      try {
        // @ts-ignore
        const build = await vite.ssrLoadModule("virtual:react-router/server-build");
        // @ts-ignore
        const handler = createRequestHandler({ build, mode: "development" });
        return handler(req, res, next);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        next(error);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const serverBuildPath = path.join(distPath, 'server', 'index.js');
    
    expressApp.use(express.static(path.join(distPath, 'client'), { index: false }));
    
    expressApp.all("*", async (req, res, next) => {
      try {
        // @ts-ignore - build will exist after npm run build
        const build = await import(serverBuildPath);
        const handler = createRequestHandler({ build, mode: "production" });
        return handler(req, res, next);
      } catch (error) {
        next(error);
      }
    });
  }

  // Background listener for new applications (Acting like a Cloud Function)
  // This ensures notifications work even when the frontend is hosted elsewhere (Cloudflare)
  const startApplicationListener = () => {
    console.log('[Firestore Listener] Starting listener for applications collection...');
    
    // Use onSnapshot to listen for changes in real-time
    onSnapshot(query(collection(db, 'applications'), where('status', '==', 'new')), async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const data = change.doc.data();
          const docId = change.doc.id;
          
          console.log(`[Firestore Listener] New application detected: ${docId}`);
          
          try {
            // Get settings for telegram/email
            const emailSettingsDoc = await getDoc(doc(db, 'settings', 'email'));
            const emailSettings = emailSettingsDoc.exists() ? emailSettingsDoc.data() : {};
            
            const clientName = data.clientName || data.name || 'Анонім';
            const phone = data.phone || 'Не вказано';
            const service = data.serviceType || data.service || 'Загальний запит';
            const message = data.message || 'Без повідомлення';
            const source = data.source || 'website';

            const text = `
🔔 *НОВА ЗАЯВКА (${source.toUpperCase()})*

👤 *Клієнт:* ${clientName}
📞 *Телефон:* ${phone}
🛠 *Послуга:* ${service}
✉️ *Повідомлення:* ${message}
            `.trim();

            // 1. Send Telegram if configured
            const botToken = emailSettings?.telegram?.botToken || process.env.TELEGRAM_BOT_TOKEN;
            
            // Skip if already notified
            if (data.notified) continue;

            // Get recipients and ensure they are unique
            const recipientsSet = new Set<string>();
            
            // Add test chat ID if exists
            if (emailSettings?.telegram?.testChatId) {
              recipientsSet.add(emailSettings.telegram.testChatId.toString().trim());
            }

            const tgConnectionsSnap = await getDocs(
              query(
                collection(db, 'notification_connections'), 
                where('type', '==', 'telegram'), 
                where('isActive', '==', true)
              )
            );
              
            tgConnectionsSnap.forEach(doc => {
              const val = doc.data().value;
              if (val) recipientsSet.add(val.toString().trim());
            });

            const tgRecipients = Array.from(recipientsSet);

            if (tgRecipients.length > 0 && botToken) {
              // Mark as notified FIRST to prevent race conditions
              const { updateDoc } = await import("firebase/firestore");
              await updateDoc(change.doc.ref, { notified: true });

              for (const chatId of tgRecipients) {
                try {
                  await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: chatId,
                      text: text,
                      parse_mode: 'Markdown'
                    })
                  });
                  console.log(`[Firestore Listener] Telegram sent to ${chatId}`);
                } catch (err) {
                  console.error(`[Firestore Listener] Telegram Error for ${chatId}:`, err);
                }
              }
            }
          } catch (err) {
            console.error('[Firestore Listener] Error processing application:', err);
          }
        }
      }
    }, (error) => {
      console.error('[Firestore Listener] Snapshot error:', error);
      setTimeout(startApplicationListener, 5000);
    });
  };

  // Start the background listener
  startApplicationListener();

  expressApp.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
