import axios from 'axios';
import { sendEmail } from './emailService.js';
import User from '../models/user.js';
import schedule from 'node-schedule';

const API_KEY = '350c970e76c64ff480ee5b70411deb97';
const API_URL = 'https://newsapi.org/v2/top-headlines';

export const fetchHealthTips = async () => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        apiKey: API_KEY,
        category: 'health',
        language: 'en',
        pageSize: 5
      }
    });

    return response.data.articles;
  } catch (error) {
    console.error('Error fetching health tips:', error);
    throw error;
  }
};

// Schedule daily health tips to be sent at 8 AM every day
export const scheduleDailyHealthTips = () => {
  schedule.scheduleJob('0 11 * * *', async () => {
    try {
      await sendDailyHealthTips();
    } catch (error) {
      console.error('Scheduled health tips failed:', error);
    }
  });
  console.log('Health tips scheduler initialized');
};

export const sendDailyHealthTips = async () => {
  try {
    const articles = await fetchHealthTips();
    const users = await User.find({}, 'email name');
    
    for (const user of users) {
      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600p
        x; margin: 0 auto;">
          <h2 style="color: #2563eb;">Daily Health Tips - CareLink</h2>
          <p>Hello ${user.name},</p>
          <p>Here are your daily health tips and updates:</p>
          
          ${articles.map(article => `
            <div style="margin: 20px 0; padding: 15px; border-radius: 8px; background-color: #f8fafc;">
              <h3 style="color: #1e40af; margin-top: 0;">${article.title}</h3>
              <p>${article.description}</p>
              <a href="${article.url}" style="color: #2563eb; text-decoration: none;">Read more →</a>
            </div>
          `).join('')}
          
          <p style="margin-top: 30px; color: #64748b;">
            Stay healthy!<br>
            CareLink Team
          </p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: 'Your Daily Health Tips from CareLink',
        html: emailTemplate
      });
    }

    console.log('Daily health tips sent successfully');
  } catch (error) {
    console.error('Error sending daily health tips:', error);
    throw error;
  }
};
