'use strict';
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '5761277774:AAH3w7PpvslYtqlLr7RQ1Ae32woI41OQu6M';
const webAppUrl = 'https://ornate-malabi-d072f2.netlify.app/';
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors);

bot.on('message', async msg => {
	const chatId = msg.chat.id;
	const text = msg.text;

	if (text === '/start') {
		await bot.sendMessage(chatId, 'A button will appear below, fill out the form', {
			reply_markup: {
				keyboard: [[{ text: 'Fill the form', web_app: { url: webAppUrl + '/form' } }]],
			},
		});
		await bot.sendMessage(chatId, 'Go to our online-shop', {
			reply_markup: {
				inline_keyboard: [[{ text: 'Make an order', web_app: { url: webAppUrl } }]],
			},
		});
	}
	//в этом поле data прилетают данные отправленные с Веб-приложения
	if (msg?.web_app_data?.data) {
		try {
			const data = JSON.parse(msg?.web_app_data?.data);
			await bot.sendMessage(chatId, `Thank you for your response`);
			await bot.sendMessage(chatId, `Your country: ${data.country}`);
			await bot.sendMessage(chatId, `Your street: ${data.street}`);
			//просто что бы отправить одно сообщение через 3 секунды
			setTimeout(async () => {
				await bot.sendMessage(chatId, 'All info you wil receive in this chat');
			}, 3000);
		} catch (err) {
			console.error(err.message);
		}
	}
});

app.post('/web-data', async (req, res) => {
	const { queryId, products, totalPrice } = req.body;
	try {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Success purchase',
			input_message_content: {
				message_text:
					'Congratulation with new purchase, you bought goods on price ' + totalPrice,
			},
		});
		return res.status(200).json({});
	} catch (err) {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Failure purchase',
			input_message_content: { message_text: 'Fail try to buy something' },
		});
		return res.status(500).json({});
	}
});

const PORT = 8000;

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));

/* метод sendData работает только для keyboard кнопок, но для инлайнkeyboard уже работать не будет */
