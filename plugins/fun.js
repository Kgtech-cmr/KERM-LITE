const { Module, mode, XKCDComic, getJson, isAdmin, parseJid } = require("../lib");
const axios = require("axios");

let triviaGames = {};

Module(
   {
      pattern: "trivia",
      fromMe: mode,
      desc: "Start a trivia game.",
      type: "fun",
   },
   async (message, match, m) => {
      const userId = message.sender;

      if (triviaGames[userId]) {
         return message.reply("You already have a trivia game in progress.");
      }

      const triviaQuestion = await fetchTriviaQuestion();

      triviaGames[userId] = {
         currentQuestion: triviaQuestion,
         correctAnswers: 0,
         initiator: userId,
         chatId: message.key.remoteJid,
      };

      return sendTriviaQuestion(message, userId);
   }
);

Module(
   {
      on: "text",
      fromMe: mode,
      pattern: false,
      dontAddCommandList: true,
   },
   async (message, match, m) => {
      const userId = message.sender;

      if (triviaGames[userId]) {
         const userTriviaGame = triviaGames[userId];
         const userAnswer = message.text ? message.text.trim() : "";

         if (userId === userTriviaGame.initiator && message.key.remoteJid === userTriviaGame.chatId) {
            if (isOptionNumber(userAnswer)) {
               const selectedOption = parseInt(userAnswer);
               const correctAnswerIndex = userTriviaGame.currentQuestion.options.indexOf(userTriviaGame.currentQuestion.correctAnswer) + 1;

               if (selectedOption === correctAnswerIndex) {
                  userTriviaGame.correctAnswers++;
                  message.reply(`Correct answer \n\n Your Points : ${userTriviaGame.correctAnswers}`);
                  userTriviaGame.currentQuestion = await fetchTriviaQuestion();

                  return sendTriviaQuestion(message, userId);
               } else {
                  message.reply(`Incorrect answer. The correct answer is option ${correctAnswerIndex} ${userTriviaGame.currentQuestion.correctAnswer}.`);
                  return await endTriviaGame(message, userId);
               }
            }
         }
      }
   }
);

function isOptionNumber(answer) {
   const selectedOption = parseInt(answer);
   return !isNaN(selectedOption) && answer.length === 1 && selectedOption >= 1 && selectedOption <= 4;
}

async function fetchTriviaQuestion() {
   try {
      const response = await axios.get("https://the-trivia-api.com/v2/questions");
      const questions = response.data;

      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

      const shuffledOptions = [...randomQuestion.incorrectAnswers, randomQuestion.correctAnswer];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }

      const formattedQuestion = {
         text: randomQuestion.question.text,
         options: shuffledOptions,
         correctAnswer: randomQuestion.correctAnswer,
      };

      return formattedQuestion;
   } catch (error) {
      console.error("Error fetching trivia question:", error.message);
      throw error;
   }
}

function sendTriviaQuestion(message, userId) {
   const userTriviaGame = triviaGames[userId];
   const currentQuestion = userTriviaGame.currentQuestion;
   const optionsString = currentQuestion.options.map((option, index) => `${index + 1}. ${option}`).join("\n");
   message.reply(`Question: ${currentQuestion.text}\nOptions:\n${optionsString}`);
}

async function endTriviaGame(message, userId) {
   const userTriviaGame = triviaGames[userId];
   await message.reply(`Trivia game ended. You answered ${userTriviaGame.correctAnswers} questions correctly.`);
   delete triviaGames[userId];
}

/**
 *
 */
Module(
   {
      pattern: "xkcd",
      fromMe: mode,
      desc: "Send a random XKCD comic.",
      type: "fun",
   },
   async (message, match, m) => {
      try {
         const result = await XKCDComic();
         message.sendMessage(message.jid, result.imageUrl, { quoted: message.data }, "image");
      } catch (error) {
         console.error("Error:", error.message);
         message.reply("Error fetching XKCD comic.");
      }
   }
);

/**
 *
 *
 */

Module(
   {
      pattern: "joke",
      fromMe: mode,
      desc: "Fetch a random joke",
      type: 'fun'
   },
   async (message, match) => {
      try {
         let jokeData;
         if (match && match.toLowerCase() == "dark") {
            jokeData = await getJson("https://v2.jokeapi.dev/joke/Dark?type=twopart");
         } else if (match && match.toLowerCase() == "pun") {
            jokeData = await getJson("https://v2.jokeapi.dev/joke/Pun?type=twopart");
         } else {
            jokeData = await getJson("https://v2.jokeapi.dev/joke/Any?type=twopart");
         }

         if (jokeData && !jokeData.error) {
            const jokeMessage = jokeData.setup + "\n" + jokeData.delivery;
            message.sendMessage(message.jid, jokeMessage);
         } else {
            console.error("Error fetching joke:", jokeData);
            message.reply("Failed to fetch a joke. Please try again later.");
         }
      } catch (error) {
         console.error("Error fetching joke:", error);
         message.reply("Failed to fetch a joke. Please try again later.");
      }
   }
);
Module(
   {
      pattern: "delttt",
      fromMe: mode,
      desc: "delete TicTacToe running game.",
      type: "game",
      dontAddCommandList: true,
   },
   async (message, match, m) => {
      let isadmin = await isAdmin(message.jid, message.user, message.client);

      if (!isadmin) return message.reply("This command is only for Group Admin and my owner.");
      this.game = this.game ? this.game : false;
      if (Object.values(this.game).find(room => room.id.startsWith("tictactoe"))) {
         delete this.game;
         return message.reply(`_Successfully Deleted running TicTacToe game._`);
      } else {
         return message.reply(`No TicTacToe game🎮 is running.`);
      }
   }
);

Module(
   {
      pattern: "ttt",
      fromMe: false,
      desc: "Play TicTacToe",
      type: "fun",
   },
   async (message, match, m) => {
      {
         let TicTacToe = require("../lib/tictactoe");
         this.game = this.game ? this.game : {};
         if (Object.values(this.game).find(room => room.id.startsWith("tictactoe") && [room.game.playerX, room.game.playerO].includes(m.sender))) return message.reply("_You're still in the game_");
         let room = Object.values(this.game).find(room => room.state === "WAITING" && (match ? room.name === match : true));
         if (room) {
            room.o = message.jid;
            room.game.playerO = message.participant || message.mention[0];
            room.state = "PLAYING";
            let arr = room.game.render().map(v => {
               return {
                  X: "❌",
                  O: "⭕",
                  1: "1️⃣",
                  2: "2️⃣",
                  3: "3️⃣",
                  4: "4️⃣",
                  5: "5️⃣",
                  6: "6️⃣",
                  7: "7️⃣",
                  8: "8️⃣",
                  9: "9️⃣",
               }[v];
            });
            let str = `*_TicTacToe_*

${arr.slice(0, 3).join("")}
${arr.slice(3, 6).join("")}
${arr.slice(6).join("")}

Current turn: @${room.game.currentTurn.split("@")[0]}
`;
            let mentions = parseJid(str);
            for (let i of mentions) {
               return await message.client.sendMessage(i, { text: str, mentions });
            }
         } else {
            room = {
               id: "tictactoe-" + +new Date(),
               x: message.jid,
               o: "",
               game: new TicTacToe(m.sender, "o"),
               state: "WAITING",
            };
            if (match) room.name = match;
            message.reply("_Waiting for partner_ ");
            this.game[room.id] = room;
         }
      }
   }
);

Module(
   {
      on: "text",
      fromMe: false,
      pattern: false,
      dontAddCommandList: true,
   },
   async (message, match, m) => {
      this.game = this.game ? this.game : {};
      let room = Object.values(this.game).find(room => room.id && room.game && room.state && room.id.startsWith("tictactoe") && [room.game.playerX, room.game.playerO].includes(m.sender) && room.state == "PLAYING");
      if (room) {
         let ok;
         let isWin = !1;
         let isTie = !1;
         let isSurrender = !1;

         if (!/^([1-9]|(me)?give_up|surr?ender|off|skip)$/i.test(match)) return;
         isSurrender = !/^[1-9]$/.test(match);
         if (m.sender !== room.game.currentTurn) {
            if (!isSurrender) return !0;
         }
         if (!isSurrender && 1 > (ok = room.game.turn(m.sender === room.game.playerO, parseInt(match) - 1))) {
            message.reply(
               {
                  "-3": "The game is over",
                  "-2": "Invalid",
                  "-1": "_Invalid Position_",
                  0: "_Invalid Position_",
               }[ok]
            );
            return !0;
         }
         if (m.sender === room.game.winner) isWin = true;
         else if (room.game.board === 511) isTie = true;
         let arr = room.game.render().map(v => {
            return {
               X: "❌",
               O: "⭕",
               1: "1️⃣",
               2: "2️⃣",
               3: "3️⃣",
               4: "4️⃣",
               5: "5️⃣",
               6: "6️⃣",
               7: "7️⃣",
               8: "8️⃣",
               9: "9️⃣",
            }[v];
         });
         if (isSurrender) {
            room.game._currentTurn = m.sender === room.game.playerX;
            isWin = true;
         }
         let winner = isSurrender ? room.game.currentTurn : room.game.winner;
         let str = `Room ID: ${room.id}

${arr.slice(0, 3).join("")}
${arr.slice(3, 6).join("")}
${arr.slice(6).join("")}

${isWin ? `@${winner.split("@")[0]} Won !` : isTie ? `Tie` : `Current Turn ${["❌", "⭕"][1 * room.game._currentTurn]} @${room.game.currentTurn.split("@")[0]}`}
❌: @${room.game.playerX.split("@")[0]}
⭕: @${room.game.playerO.split("@")[0]}`;

         if ((room.game._currentTurn ^ isSurrender ? room.x : room.o) !== m.chat) room[room.game._currentTurn ^ isSurrender ? "x" : "o"] = m.chat;
         let mentions = parseJid(str);
         for (let i of mentions) {
            return await message.client.sendMessage(i, { text: str, mentions });
         }

         if (isTie || isWin) {
            delete this.game[room.id];
         }
      }
   }
);
