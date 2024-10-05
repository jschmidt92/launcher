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
    <div v-if="isDownloading" class="progress-bar-container">
        <div class="progress-bar" :style="{ width: `${downloadProgress}%` }"></div>
    </div>
    <!-- Download percentage -->
    <div v-if="isDownloading" class="download-percentage">
        Downloading: {{ downloadProgress }}%
    </div>
</template>

<style scoped>
.progress-bar-container {
    @apply w-[240px] bg-[#161618] rounded-full h-1.5 mb-4;
}

.progress-bar {
    @apply bg-[#fde68a] h-1.5 glow-effect rounded-full transition-all duration-300;
}

.download-percentage {
    @apply text-white text-xs mb-2;
}

.glow-effect {
    @apply shadow-[0_0_5px_#fde68a];
}
</style>
