'use strict';
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
var request = require('request')
const token = process.env.TOKEN;
const dns = require('dns');
const axios = require('axios');

var bot = new TelegramBot(token, { polling: true });

//start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `
            Hello guys!
      
            Available commands:
        
            /weather <b>City</b> - weather descriptions for a city
            /ipv4 - IP address
            /save_notes <b>Message</b> - Add notes to the list
            /view_notes- get your notes
        `, {
            parse_mode: 'HTML',
        }
    );
});

const todos = [];

// Listener (handler) for save notes
bot.onText(/\/save_notes/, (msg, match) => {
    const chatId = msg.chat.id;
    const todo = match.input.split(' ')[1];

    if (todo === undefined) {
        bot.sendMessage(
            chatId,
            'Please enter your notes',
        );
        return;
    }

    todos.push(todo);
    bot.sendMessage(
        chatId,
        'Notes has been successfully saved!',
    );
});

bot.onText(/\/view_notes/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `Notes:\n ${(todos)}`);
});


// Listener (handler) for showcasing different keyboard layout
bot.onText(/\/keyboard/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Alternative keybaord layout', {
        'reply_markup': {
            'keyboard': [['/start', '/weather'], ['/ipv4'], ['/save_notes', '/view_notes']],
            resize_keyboard: true,
            one_time_keyboard: true,
            force_reply: true,
        }
    });
});


//weather 


const appID = '1534fe794e6e8cd346728ce7e4d9ca65';
const weatherEndpoint = (city) => (
  `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${appID}`
);

// URL that provides icon according to the weather
const weatherIcon = (icon) => `http://openweathermap.org/img/w/${icon}.png`;

// Template for weather response
const weatherHtmlTemplate = (name, main, weather, wind, clouds) => (
  `The weather in <b>${name}</b>:
<b>${weather.main}</b> - ${weather.description}
Temperature: <b>${main.temp} °C</b>
Pressure: <b>${main.pressure} hPa</b>
Humidity: <b>${main.humidity} %</b>
Wind: <b>${wind.speed} meter/sec</b>
Clouds: <b>${clouds.all} %</b>
`
);

const getWeather = (chatId, city) => {
    const endpoint = weatherEndpoint(city);
  
    axios.get(endpoint).then((resp) => {
      const {
        name,
        main,
        weather,
        wind,
        clouds
      } = resp.data;
  
      bot.sendPhoto(chatId, weatherIcon(weather[0].icon))
      bot.sendMessage(
        chatId,
        weatherHtmlTemplate(name, main, weather[0], wind, clouds), {
          parse_mode: "HTML"
        }
      );
    }, error => {
      console.log("error", error);
      bot.sendMessage(
        chatId,
        `Ooops...I couldn't be able to get weather for <b>${city}</b>`, {
          parse_mode: "HTML"
        }
      );
    });
  }

  bot.onText(/\/weather/, (msg, match) => {
    const chatId = msg.chat.id;
    const city = match.input.split(' ')[1];
  
    if (city === undefined) {
      bot.sendMessage(
        chatId,
        `Please provide city name`
      );
      return;
    }
    getWeather(chatId, city);
  });


// ipv4
  bot.onText(/\/ipv4/, (msg, match) => {
    dns.lookup('archive.org', 
    (err, addresses, family) => {
  
    // Print the address found of user
    bot.sendMessage('addresses:', addresses);
  
    // Print the family found of user  
    bot.sendMessage('family:', family);
    });
  });
  