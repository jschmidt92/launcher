<script setup lang="ts">
import { ref } from "vue";
import SidebarButtons from "./components/SidebarButtons.vue";
import ProgressBar from "./components/ProgressBar.vue";
import ServerStatus from "./components/ServerStatus.vue";
import SettingsModal from "./components/SettingsModal.vue";
import TabSection from "./components/TabSection.vue";

const showModal = ref(false);
</script>

<template>
  <main class="h-screen w-screen">
    <div class="flex h-full w-full">
      <SettingsModal :show="showModal" @close="showModal = false" />
      <div class="flex flex-col bg-zinc-900 w-1/3 p-4">
        <div class="flex flex-col flex-grow items-center justify-center">
          <SidebarButtons />
          <ProgressBar />
        </div>
        <ServerStatus />
      </div>
      <div class="flex flex-col w-2/3 p-4">
        <div class="flex flex-row flex-grow items-start justify-end">
          <div class="cursor-pointer" @click="showModal = true">
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-white hover:text-[#fde68a] transition-colors duration-300" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <TabSection />
      </div>
    </div>
  </main>
</template>
