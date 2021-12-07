<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div
    class="container mx-auto h-screen overflow-hidden text-gray-100 flex flex-col"
  >
    <div
      v-chat-scroll
      class="overflow-auto flex flex-col bg-gray-900 flex-grow"
    >
      <div
        v-for="log in logs"
        class="py-2 mt-4 pl-4 border-l-4 border-gray-500 prose text-gray-100 max-w-none"
        :class="{ 'border-red-500': log.isPlayer }"
      >
        <div v-for="message in log.text">{{ message }}</div>
      </div>
    </div>
    <div
      class="flex flex-shrink-0 h-12 bg-gray-700 rounded my-4 px-4 items-center"
    >
      <button class="bg-gray-600 p-4 rounded" @click="recognize">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          :class="{ 'text-red-400 animate-pulse': isRecording }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </button>
      <input
        type="text"
        class="flex-grow ml-4 bg-transparent"
        placeholder="Command"
      />
    </div>
  </div>
</template>
<script>
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
import adventure from 'adventurejs-web'

// var colors = [
//   "aqua",
//   "azure",
//   "beige",
//   "bisque",
//   "black",
//   "blue",
//   "brown",
//   "chocolate",
//   "coral",
// ];
// var grammar =
//   "#JSGF V1.0; grammar colors; public <color> = " + colors.join(" | ") + " ;";

// eslint-disable-next-line no-undef, new-cap
const recognition = new webkitSpeechRecognition()
// var speechRecognitionList = new SpeechGrammarList();

// speechRecognitionList.addFromString(grammar, 1);

// recognition.grammars = speechRecognitionList;
recognition.continuous = true
recognition.lang = 'en-US'
recognition.interimResults = false
recognition.maxAlternatives = 1
const game = adventure.makeState()

export default {
  data() {
    return {
      logs: [
        {
          isPlayer: false,
          text: [
            'Welcome!',
            `To start, click the microphone button and say something like "start" or "begin".`,
            'Note: We will continuously listen while the mic button is active. You do not need to toggle it after every command.',
          ],
        },
      ],
      isRecording: false,
      isStarted: false,
    }
  },
  methods: {
    startGame() {
      this.advanceGame()
      this.isStarted = true
    },
    advanceGame(input) {
      this.logs.push({ isPlayer: true, text: [input] })
      this.logs.push({ isPlayer: false, text: game.advance(input) })
    },
    recognize() {
      if (this.isRecording) {
        recognition.stop()
        this.isRecording = false
      } else {
        recognition.start()
        this.isRecording = true

        recognition.onresult = (event) => {
          const transcript =
            event.results[event.results.length - 1][0].transcript
          const confidence =
            event.results[event.results.length - 1][0].confidence
          // eslint-disable-next-line no-console
          console.log('Transcript: ' + transcript)
          // eslint-disable-next-line no-console
          console.log('Confidence: ' + confidence)

          this.advanceGame(transcript)
        }
      }
    },
  },
}
</script>

<style>
html {
  background-color: rgb(17, 24, 39);
}
</style>
