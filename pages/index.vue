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
      class="flex flex-shrink-0 h-12 bg-gray-700 rounded my-4 mb-12 px-4 items-center"
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
        v-model="commandText"
        type="text"
        class="flex-grow ml-4 bg-transparent border-none placeholder-gray-400 focus:ring-0 disabled:opacity-25"
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

const vocab = [
  'spelunker today',
  '?',
  'above',
  'abra',
  'abracadabra',
  'across',
  'ascend',
  'attack',
  'awkward',
  'axe',
  'back',
  'barren',
  'bars',
  'batteries',
  'battery',
  'beans',
  'bear',
  'bed',
  'bedquilt',
  'bird',
  'blast',
  'blowup',
  'bottle',
  'box',
  'break',
  'brief',
  'broken',
  'building',
  'cage',
  'calm',
  'canyon',
  'capture',
  'carpet',
  'carry',
  'catch',
  'cave',
  'cavern',
  'chain',
  'chant',
  'chasm',
  'chest',
  'clam',
  'climb',
  'close',
  'cobblestone',
  'coins',
  'continue',
  'crack',
  'crap',
  'crawl',
  'cross',
  'd',
  'damn',
  'damnit',
  'dark',
  'debris',
  'depression',
  'descend',
  'describe',
  'detonate',
  'devour',
  'diamonds',
  'dig',
  'discard',
  'disturb',
  'dome',
  'door',
  'down',
  'downstream',
  'downward',
  'dragon',
  'drawing',
  'drink',
  'drop',
  'dump',
  'dwarf',
  'dwarves',
  'e',
  'east',
  'eat',
  'egg',
  'eggs',
  'emerald',
  'enter',
  'entrance',
  'examine',
  'excavate',
  'exit',
  'explore',
  'extinguish',
  'fee',
  'fee',
  'feed',
  'fie',
  'fie',
  'fight',
  'figure',
  'fill',
  'find',
  'fissure',
  'floor',
  'foe',
  'foe',
  'follow',
  'foo',
  'foo',
  'food',
  'forest',
  'fork',
  'forward',
  'free',
  'fuck',
  'fum',
  'fum',
  'get',
  'geyser',
  'giant',
  'go',
  'gold',
  'goto',
  'grate',
  'gully',
  'h2o',
  'hall',
  'headlamp',
  'help',
  'hill',
  'hit',
  'hocus',
  'hole',
  'hours',
  'house',
  'ignite',
  'in',
  'info',
  'information',
  'inside',
  'inventory',
  'inward',
  'issue',
  'jar',
  'jewel',
  'jewelry',
  'jewels',
  'jump',
  'keep',
  'key',
  'keys',
  'kill',
  'knife',
  'knives',
  'lamp',
  'lantern',
  'leave',
  'left',
  'light',
  'lock',
  'log',
  'look',
  'lost',
  'low',
  'machine',
  'magazine',
  'main',
  'message',
  'ming',
  'mirror',
  'mist',
  'moss',
  'mumble',
  'n',
  'ne',
  'nest',
  'north',
  'nothing',
  'nowhere',
  'nugget',
  'null',
  'nw',
  'off',
  'office',
  'oil',
  'on',
  'onward',
  'open',
  'opensesame',
  'oriental',
  'out',
  'outdoors',
  'outside',
  'over',
  'oyster',
  'passage',
  'pause',
  'pearl',
  'persian',
  'peruse',
  'pillow',
  'pirate',
  'pit',
  'placate',
  'plant',
  'plant',
  'platinum',
  'plover',
  'plugh',
  'pocus',
  'pottery',
  'pour',
  'proceed',
  'pyramid',
  'quit',
  'rations',
  'read',
  'release',
  'reservoir',
  'retreat',
  'return',
  'right',
  'road',
  'rock',
  'rod',
  'rod',
  'room',
  'rub',
  'rug',
  'run',
  's',
  'save',
  'say',
  'score',
  'se',
  'secret',
  'sesame',
  'shadow',
  'shake',
  'shard',
  'shatter',
  'shazam',
  'shell',
  'shit',
  'silver',
  'sing',
  'slab',
  'slit',
  'smash',
  'snake',
  'south',
  'spelunker',
  'spice',
  'spices',
  'stairs',
  'stalactite',
  'steal',
  'steps',
  'steps',
  'stop',
  'stream',
  'strike',
  'surface',
  'suspend',
  'sw',
  'swim',
  'swing',
  'tablet',
  'take',
  'tame',
  'throw',
  'toss',
  'tote',
  'touch',
  'travel',
  'treasure',
  'tree',
  'trees',
  'trident',
  'troll',
  'troll',
  'tunnel',
  'turn',
  'u',
  'unlock',
  'up',
  'upstream',
  'upward',
  'utter',
  'valley',
  'vase',
  'velvet',
  'vending',
  'view',
  'volcano',
  'w',
  'wake',
  'walk',
  'wall',
  'water',
  'wave',
  'west',
  'xyzzy',
  'y2',
]

const grammar =
  '#JSGF V1.0; grammar colors; public <color> = ' + vocab.join(' | ') + ' ;'

// eslint-disable-next-line no-undef, no-use-before-define
const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
// eslint-disable-next-line no-undef, no-use-before-define
const SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
// eslint-disable-next-line no-undef, no-use-before-define
const SpeechRecognitionEvent =
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent // eslint-disable-line no-undef, no-use-before-define

// eslint-disable-next-line no-undef, new-cap
const recognition = new SpeechRecognition()
const speechRecognitionList = new SpeechGrammarList()
speechRecognitionList.addFromString(grammar, 1)
recognition.grammars = speechRecognitionList

recognition.continuous = true
recognition.lang = 'en-US'
recognition.interimResults = true
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
            `If voice control isn't your thing, you can also type commands into the text box below.`,
            'Note: We will continuously listen while the mic button is active. You do not need to toggle it after every command.',
          ],
        },
      ],
      isRecording: false,
      isStarted: false,
      commandText: '',
    }
  },
  methods: {
    startGame() {
      this.advanceGame()
      this.isStarted = true
    },
    advanceGame(input) {
      this.commandText = ''
      this.logs.push({ isPlayer: true, text: [input] })
      this.logs.push({ isPlayer: false, text: game.advance(input) })
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

          console.log(event)

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
