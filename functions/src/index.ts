import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";

admin.initializeApp();

/**
 * Triggered when a new document is added to the 'applications' collection.
 * Sends a notification to a Telegram bot.
 */
export const onNewApplication = functions.firestore
  .document("applications/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    // Get secrets from environment config
    // Command to set: firebase functions:config:set telegram.token="TOKEN" telegram.chat_id="ID"
    const botToken = functions.config().telegram?.token;
    const chatId = functions.config().telegram?.chat_id;

    if (!botToken || !chatId) {
      console.error("Telegram credentials are not configured in Firebase Functions config.");
      return;
    }

    const clientName = data.clientName || data.name || 'Анонім';
    const phone = data.phone || 'Не вказано';
    const service = data.serviceType || data.service || 'Загальний запит';
    const message = data.message || 'Без повідомлення';

    const text = `
🔔 *НОВА ЗАЯВКА НА САЙТІ*

👤 *Клієнт:* ${clientName}
📞 *Телефон:* \`${phone}\`
🛠 *Послуга:* ${service}
✉️ *Повідомлення:* ${message}

📅 *Дата:* ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })}
ID: \`${context.params.docId}\`
    `.trim();

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        })
      });

      const responseData: any = await response.json();
      if (!responseData.ok) {
        throw new Error(responseData.description || "Unknown Telegram error");
      }
      
      console.log(`Notification successfully sent to Telegram for application ${context.params.docId}`);
    } catch (error) {
      console.error("Error sending Telegram message:", error);
    }
  });
