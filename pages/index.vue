<template>
  <div
    class="container mx-auto px-2 h-screen overflow-hidden text-gray-100 flex flex-col"
  >
    <div
      v-chat-scroll
      class="overflow-auto flex flex-col bg-gray-900 flex-grow"
    >
      <!-- eslint-disable vue/require-v-for-key -->
      <div
        v-for="log in logs"
        class="py-2 mt-4 px-4 border-l-4 border-gray-500 prose text-gray-100 max-w-none"
        :class="{ 'border-indigo-500': log.isPlayer }"
      >
        <div v-for="message in log.text">{{ message }}</div>
      </div>
    </div>
    <div
      class="flex flex-shrink-0 h-12 bg-gray-700 rounded my-4 mb-12 px-4 items-center"
    >
      <button
        v-if="isWebkitSpeechRecognition"
        class="bg-gray-600 p-4 rounded mr-2"
        @click="recognize"
      >
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
      <button
        v-if="isWebkitSpeechSynthesis"
        class="bg-gray-600 p-4 rounded"
        @click="isSynthesizing = !isSynthesizing"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          :class="{ 'text-red-400 animate-pulse': isSynthesizing }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      </button>
      <input
        v-model="commandText"
        type="text"
        class="flex-grow bg-transparent border-none placeholder-gray-400 focus:ring-0 disabled:opacity-25"
        :disabled="isRecording"
        placeholder="Command"
        @keyup.enter="advanceGame(commandText)"
      />
    </div>
  </div>
</template>
<script>
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
import adventure from 'adventurejs-web'
import vocab from '@/language/vocab'
import compromise from '@/language/compromise'

let recognition
let synthesis

// Check if the browser has speech synthesis
if ('speechSynthesis' in window) {
  synthesis = window.speechSynthesis
}

// Check if the browser has speech recognition
if ('webkitSpeechRecognition' in window) {
  // eslint-disable-next-line no-undef, new-cap
  recognition = new webkitSpeechRecognition()

  // Check if the browser supports grammar lists
  if ('webkitSpeechGrammarList' in window) {
    const grammar =
      '#JSGF V1.0; grammar colors; public <color> = ' + vocab.join(' | ') + ' ;'
    // eslint-disable-next-line no-undef, new-cap
    const speechRecognitionList = new webkitSpeechGrammarList()
    speechRecognitionList.addFromString(grammar, 1)
    recognition.grammars = speechRecognitionList
  }

  recognition.continuous = true
  recognition.lang = 'en-US'
  recognition.interimResults = true
  recognition.maxAlternatives = 1
}

const game = adventure.makeState()

export default {
  data() {
    return {
      logs: [],
      isRecording: false,
      isSynthesizing: false,
      isStarted: false,
      commandText: '',
    }
  },
  computed: {
    isWebkitSpeechRecognition: () => {
      return 'webkitSpeechRecognition' in window
    },
    isWebkitSpeechSynthesis: () => {
      return 'speechSynthesis' in window
    },
  },
  watch: {
    isSynthesizing(val) {
      // Watch if synthesizing is turned off
      if (!val) {
        synthesis.cancel()
      }
    },
  },
  mounted() {
    game.advance('')

    this.logs.push({
      isPlayer: false,
      text: [
        'Welcome to Colossal Cave Adventure!',
        'You can give commands through the command box below,',
        'or by clicking the microphone button and using your voice.',
      ],
    })

    this.logs.push({
      isPlayer: false,
      text: ['Would you like instructions?'],
    })
  },
  methods: {
    startGame() {
      this.advanceGame()
      this.isStarted = true
    },
    advanceGame(input) {
      this.commandText = ''

      const processedInput = compromise(input)
      if (processedInput) {
        // Valid word exists
        // eslint-disable-next-line no-console
        console.log('Final transcript:', processedInput)
        this.logs.push({ isPlayer: true, text: [input] })
        const gameMessage = game.advance(processedInput)
        this.logs.push({ isPlayer: false, text: gameMessage })

        // Speak the messages
        if (this.isSynthesizing) {
          let utterance = ''
          gameMessage.forEach((element) => {
            utterance += element
          })
          // Cancel previous synthesis and start the new one
          synthesis.cancel()
          synthesis.speak(new SpeechSynthesisUtterance(utterance))
        }
      } else {
        // No valid word given
        this.logs.push({
          isPlayer: true,
          text: ['Sorry! I am not sure what you are saying.'],
        })
      }
    },
    recognize() {
      if (this.isRecording) {
        // We're already recording. Stop.
        recognition.stop()
        this.isRecording = false
      } else {
        // We aren't recording yet. Start.
        recognition.start()
        this.isRecording = true

        recognition.onresult = (event) => {
          const isFinal = event.results[event.results.length - 1].isFinal
          const transcript =
            event.results[event.results.length - 1][0].transcript
          const confidence =
            event.results[event.results.length - 1][0].confidence

          if (!isFinal) {
            this.commandText = transcript
          } else {
            this.commandText = transcript
            this.advanceGame(transcript)
          }
          // eslint-disable-next-line no-console
          console.log('Transcript: ' + transcript)
          // eslint-disable-next-line no-console
          console.log('Confidence: ' + confidence)
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
