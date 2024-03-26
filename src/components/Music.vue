<script setup lang="ts">
import {onKeyStroke, useLocalStorage, useMediaControls} from '@vueuse/core'
import {nextTick, onBeforeMount, ref} from 'vue'
import useAiGrammar from "../hooks/useAiGrammar.js";

interface Lesson {
  media: string
  vtt: string
}
const lesson = ref<Lesson>()
const options = ref({})
const video = ref()
const mediaControls = ref()
const cues = ref<any[]>([])
const key = ref(0)
const isMp3 = ref(false)

const props = defineProps<{ path: string }>()

const baseUrl = '/japanese-study-happiness'
const { generateGrammar,grammar } =useAiGrammar()
onBeforeMount(() => {
  const path = props.path
  lesson.value = {
    media: `${baseUrl}/japanese/${path}`,
    vtt: '',
  }
  if (path.endsWith('.mp3')) {
    isMp3.value = true
    lesson.value.vtt = `${baseUrl}/japanese/${path.replace('.mp3', '.vtt')}`
  }
  else {
    isMp3.value = false
    lesson.value.vtt = `${baseUrl}/japanese/${path.replace('.mp4', '.vtt')}`
  }
  options.value = {
    src: lesson.value.media,
    tracks: [
      {
        default: true,
        src: lesson.value.vtt,
        kind: 'none',
        label: 'English',
        srcLang: 'en',
      },
    ],
  }
  console.log(options.value)
  mediaControls.value = useMediaControls(video, options.value)
})


onKeyStroke(' ', (e) => {
  play()
  e.preventDefault()
})

const isShowGrammar = ref(false)
const isShowGrammarLoading = ref(false)
const showGrammar = async () => {
  isShowGrammarLoading.value = true
  await generateGrammar(cues.value[currentCueIndex.value].text)
  isShowGrammarLoading.value = false
  isShowGrammar.value = true
}

function play() {
  mediaControls.value.playing = !mediaControls.value.playing

  nextTick(() => {
    if (mediaControls.value.tracks[0] && mediaControls.value.tracks[0].cues && cues.value.length === 0) {
      const tempCues = mediaControls.value.tracks[0].cues
      for (const key in tempCues)
        cues.value.push(tempCues[key])
    }
    startScroll()
    const track = document.querySelector('track')
    if(track){
      track.style.display = 'none'
    }
  })
}

const currentCueIndex = ref(0)
const preCueIndex = ref(0)
function startScroll() {
  setInterval(() => {
    if (mediaControls.value?.playing) {
      // 找到当前播放时间对应的字幕
      for (let i = 0; i < cues.value.length; i++) {
        if (cues.value[i].startTime <= mediaControls.value?.currentTime && cues.value[i].endTime >= mediaControls.value?.currentTime) {
          if (cues.value[i].text === '僅供學習交流之用 更多中日雙語字幕，請登錄 www.kamigami.org') {
            continue
          }
          else {
            currentCueIndex.value = i
            break
          }
        }
      }
      // 滚动到当前字幕
      const marquee = document.querySelector('.sub-container')
      if (marquee && currentCueIndex.value !== preCueIndex.value) {
        preCueIndex.value = currentCueIndex.value
        marquee.scrollTop = (marquee.scrollHeight * currentCueIndex.value / cues.value.length) - 100
      }
    }
  }, 300)
}

const isShowMask = ref(false)
const keyStorage = useLocalStorage<Text[]>('keyStorage', [])

</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <video ref="video" :key="key" style="width: 60vw" :class="{ hidden: isMp3 }" />

    <div class="relative desktop:w-2/5 px-24 mobile:w-full mobile:px-10">

      <div v-show="mediaControls?.playing && isShowMask" style="background: rgb(18 18 18);width: 90%" class="absolute left-0 top-0 z-10 box-border h-full" />

      <div class="sub-container py-20  overflow-auto px-2">
        <p v-for="(cue, index) in cues" :key="index" class="mb-5 cursor-pointer" @click="mediaControls.currentTime = cue.startTime">
          <span v-if="currentCueIndex === index" class="text-green-300 text-xl">{{ cue.text }}</span>
          <span v-else class="text-1xl">{{ cue.text }}</span>
        </p>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 px-30 w-full dark:bg-base-100">
      <div class="flex flex-row items-center justify-around  h-16 w-full m-auto">

        <!-- play -->
        <label  class="swap swap-rotate">
          <input type="checkbox" :value="mediaControls.playing" @change="play" />
          <span class="icon-[carbon--pause-outline] swap-on fill-current w-10 h-10"></span>
          <span  class="icon-[carbon--play-outline] swap-off fill-current w-10 h-10"></span>
        </label>
        <button class=" btn btn-circle fixed top-4 left-4 z-[2] " onclick="my_modal_1.showModal()">
          <span class="icon-[carbon--settings] w-6 h-6" ></span>
        </button>


        <!-- play end -->


        <!-- grammar -->
        <button class=" btn btn-circle" @click="showGrammar">
          <span v-if="isShowGrammarLoading" class="loading loading-dots loading-xs w-10 h-10"></span>
          <span v-else class="icon-[carbon--query] w-10 h-10"></span>
        </button>

        <!-- grammar end -->

      </div>
    </div>

    <dialog id="my_modal_1" class="modal">
      <div class="modal-box">
          <form method="dialog">
              <label class="label cursor-pointer">
                <span class="label-text">isShowMask：</span>
                <input type="checkbox" class="toggle" :value="isShowMask" @change="isShowMask = !isShowMask" />
              </label>
            <label class="label cursor-pointer">
              <span class="label-text">keyStorage：</span>
              <input v-model="keyStorage" />
            </label>
            <button class="btn">Close</button>
          </form>
      </div>
    </dialog>

    <dialog id="my_modal_2" class="modal"  :open="isShowGrammar">
      <div class="bg-base-100 p-5 h-full desktop:w-2/5">
        <div class="flex flex-col items-start justify-left align-start" style="text-align: start" v-html="grammar" />
        <button class="btn w-full mt-5 " @click="isShowGrammar = false">Close</button>
      </div>
    </dialog>

  </div>
</template>

<style scoped>

::-webkit-scrollbar {
  //background-color: rgb(18 18 18);
}

::-webkit-scrollbar-thumb {
  //background-color: rgb(100 100 100);
}
</style>
