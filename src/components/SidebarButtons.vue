<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "../stores/settings";
import { useServerStore } from "../stores/server";

const settingsStore = useSettingsStore();
const serverStore = useServerStore();
const isServerUp = computed(() => serverStore.isServerUp);

function join() {
    const nTitle = "Joining Server";
    const nBody =
        "App has been minimized to tray, and is running in the background";

    window.electronAPI.joinGame({ arma3path: settingsStore.arma3path, serverIP: settingsStore.serverIP, serverPort: settingsStore.serverPort, serverPassword: settingsStore.serverPassword, join: true });
    window.electronAPI.createNotification(nTitle, nBody);
}
function launch() {
    const nTitle = "Launching Game";
    const nBody =
        "App has been minimized to tray, and is running in the background";

    window.electronAPI.launchGame({ arma3path: settingsStore.arma3path });
    window.electronAPI.createNotification(nTitle, nBody);
}
</script>

<template>
    <!-- Button to launch the game -->
    <button @click="launch()"
        class="bg-[#fde68a] text-black w-[240px] font-semibold py-2 relative transition-all duration-300 hover:text-white hover:shadow-[0_0_15px_rgba(253,230,138,0.5)] group">
        <span class="relative z-10">Launch Game</span>
        <div class="absolute inset-0 bg-[#fde68a] opacity-0 group-hover:opacity-50 transition-opacity duration-300">
        </div>
    </button>

    <!-- Button to join the server -->
    <button @click="join()" :class="[
        'bg-[#161618] w-[240px] font-semibold my-2 py-2 relative transition-all duration-300 group',
        {
            'btn-pulse-online hover:!text-white': isServerUp,
            'shadow-inner shadow-[#12121A] text-zinc-500 cursor-not-allowed':
                !isServerUp,
        },
    ]" :disabled="!isServerUp">
        <span class="relative z-10">Join Server</span>
        <div :class="{
            'absolute inset-0 bg-[#fde68a] opacity-0 group-hover:opacity-100 transition-opacity duration-300':
                isServerUp,
        }"></div>
    </button>
</template>

<style scoped>
.btn-pulse-online {
    animation: glow 2.25s infinite alternate;
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