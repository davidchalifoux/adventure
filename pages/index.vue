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
        v-if="isWebkitSpeech"
        class="bg-gray-600 p-4 rounded"
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
      <input
        v-model="commandText"
        type="text"
        class="flex-grow bg-transparent border-none placeholder-gray-400 focus:ring-0 disabled:opacity-25"
        :class="{ 'ml-4': isWebkitSpeech }"
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

let recognition = null

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
      logs: [
        {
          isPlayer: false,
          text: [
            'Welcome!',
            recognition
              ? `To start, click the microphone button and say "go".`
              : null,
            recognition
              ? `If voice control isn't your thing, you can also type commands into the text box below.`
              : null,
            recognition
              ? 'Note: We will continuously listen while the mic button is active. You do not need to toggle it after every command.'
              : null,
          ],
        },
      ],
      isRecording: false,
      isStarted: false,
      commandText: '',
    }
  },
  computed: {
    isWebkitSpeech: () => {
      return 'webkitSpeechRecognition' in window
    },
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
        this.logs.push({ isPlayer: false, text: game.advance(processedInput) })
      } else {
        // No valid word given
        this.logs.push({
          isPlayer: true,
          text: [
            'Sorry! Your command did not have a recognized phrase or word.',
          ],
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
