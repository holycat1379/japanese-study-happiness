<script lang="ts" setup>
import {onBeforeMount, ref} from "vue";
import Music from "../components/Music.vue";
import {useLocalStorage} from "@vueuse/core";


const fileList = ref(new Map())

onBeforeMount(async () => {

  const tempList = await import.meta.glob(`~/assets/japanese/**/*`)
  for (const key in tempList) {
    let name = tempList[key].name
    name = name.replace('/src/assets/japanese/', '')
    const type = name.split('/')[0]

    if (!fileList.value.get(type))
      fileList.value.set(type, [])

    if (name.endsWith('.vtt') || name.endsWith('.srt'))
      continue

    fileList.value.set(type, [...fileList.value.get(type), name])
  }
})

const currentType = ref('')

const handleMenuClick = (type: string) => {
  currentFile.value = ''
  currentType.value = type
  isShowDropdown.value = false
}
const isShowDropdown = ref(false)

const currentFile = useLocalStorage('currentFile','')
</script>

<template>

  <div class="w-full">
    <template v-if="!currentType && !currentFile">
      <div class="hero min-h-screen bg-base-200">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">TEN YEAR</h1>
            <p class="py-6">まだ早く勉強に行かないの?
            </p>
          </div>
        </div>
      </div>
    </template>

    <template v-if="currentFile">
      <button  class="fixed top-4 right-4 z-[2] btn btn-circle" @click="currentFile = ''">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <Music  :path="currentFile"></Music>
    </template>

    <template v-else>
      <div  class="dropdown dropdown-top dropdown-end z-[2] mb-4 fixed bottom-10 right-10">
        <div tabindex="0" role="button" class="btn m-1 text-2xl" @click="isShowDropdown =true">Select Lesson</div>
        <ul v-show="isShowDropdown" tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-72">
          <li v-for="type in fileList.keys()" :key="type"  ><a @click="handleMenuClick(type)"> {{ type }}</a></li>
        </ul>
      </div>
      <div v-if="currentType" class="overflow-y-auto h-full w-full">
        <div class="card bg-base-100 shadow-xl desktop:w-1/2 desktop:m-auto">
          <div class="card-body">
            <h2 class="card-title">{{currentType}}</h2>
            <table class="table mobile:table-xs desktop:table-lg">
              <!-- head -->
              <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Action</th>
              </tr>
              </thead>
              <tbody>
              <!-- row 1 -->
              <tr v-for="(file, index) in fileList.get(currentType)" :key="file">
                <th>{{index + 1}}</th>
                <td>{{file}}</td>
                <td>
                  <button class="btn btn-link" @click="currentFile = file">
                    <span  class="icon-[carbon--play-outline] w-6 h-6"></span>
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

