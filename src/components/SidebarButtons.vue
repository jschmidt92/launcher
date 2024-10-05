<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "../stores/settings";
import { useServerStore } from "../stores/server";

const settingsStore = useSettingsStore();
const serverStore = useServerStore();
const isServerUp = computed(() => serverStore.isServerUp);

function join() {
    const nTitle = "Joining Server";
    const nBody = "App has been minimized to tray, and is running in the background";

    window.electronAPI.joinGame({ arma3path: settingsStore.arma3path, serverIP: settingsStore.serverIP, serverPort: settingsStore.serverPort, serverPassword: settingsStore.serverPassword, join: true });
    window.electronAPI.createNotification(nTitle, nBody);
}

function launch() {
    const nTitle = "Launching Game";
    const nBody = "App has been minimized to tray, and is running in the background";

    window.electronAPI.launchGame({ arma3path: settingsStore.arma3path });
    window.electronAPI.createNotification(nTitle, nBody);
}
</script>

<template>
    <button @click="launch()" class="launch-button">
        <span class="button-text">Launch Game</span>
        <div class="button-overlay"></div>
    </button>

    <button @click="join()" :class="['join-button', { 'server-online': isServerUp, 'server-offline': !isServerUp }]" :disabled="!isServerUp">
        <span class="button-text">Join Server</span>
        <div class="button-overlay"></div>
    </button>
</template>

<style scoped>
.launch-button, .join-button {
    @apply w-[240px] font-semibold py-2 relative transition-all duration-300;
}

.launch-button {
    @apply bg-[#fde68a] text-black hover:text-white hover:shadow-[0_0_15px_rgba(253,230,138,0.5)];
}

.join-button {
    @apply my-2;
}

.server-online {
    @apply bg-[#161618] hover:text-white;
    animation: glow 2.25s infinite alternate;
}

.server-offline {
    @apply bg-[#161618] shadow-inner shadow-[#12121A] text-zinc-500 cursor-not-allowed;
}

.button-text {
    @apply relative z-10;
}

.button-overlay {
    @apply absolute inset-0 bg-[#fde68a] opacity-0 transition-opacity duration-300;
}

.launch-button:hover .button-overlay,
.server-online:hover .button-overlay {
    @apply opacity-50;
}

@keyframes glow {
    from {
        box-shadow: 0 0 8px rgba(253, 230, 138, 0);
    }

    to {
        box-shadow: 0 0 8px rgba(253, 230, 138, 0.5);
        color: #fde68a;
    }
}
</style>