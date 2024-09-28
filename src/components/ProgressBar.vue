<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { DownloadProgress } from "../types";
import { useSettingsStore } from "../stores/settings";

const downloadProgress = ref(0);
const isDownloading = ref(false);
const store = useSettingsStore();

function handleDownloadComplete(
    _: Electron.IpcRendererEvent,
    data: { join: boolean }
) {
    isDownloading.value = false;
    window.electronAPI.openGame({
        arma3path: store.arma3path,
        serverIP: store.serverIP,
        serverPort: store.serverPort,
        serverPassword: store.serverPassword,
        join: data.join,
    });
}
function handleDownloadProgress(
    _: Electron.IpcRendererEvent,
    progress: DownloadProgress
) {
    downloadProgress.value = Math.floor(progress.percent);
    isDownloading.value = true;
}

onMounted(() => {
    window.electronAPI.downloadProgress(handleDownloadProgress);
    window.electronAPI.downloadComplete(handleDownloadComplete);
});

onUnmounted(() => {
    window.electronAPI.removeDownloadComplete(handleDownloadComplete);
    window.electronAPI.removeDownloadProgress(handleDownloadProgress);
});
</script>

<template>
    <!-- Progress bar -->
    <div v-if="isDownloading" class="w-[240px] bg-[#161618] rounded-full h-1.5 mb-4">
        <div class="bg-[#fde68a] h-1.5 glow-effect rounded-full transition-all duration-300"
            :style="{ width: `${downloadProgress}%` }"></div>
    </div>
    <!-- Download percentage -->
    <div v-if="isDownloading" class="text-white text-xs mb-2">
        Downloading: {{ downloadProgress }}%
    </div>
</template>
