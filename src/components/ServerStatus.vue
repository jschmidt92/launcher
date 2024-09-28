<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { GamedigState } from "../types";
import { useServerStore } from "../stores/server";
import { useSettingsStore } from "../stores/settings";

let refreshInterval: NodeJS.Timeout | null = null;

const maxPlayers = ref(0);
const mission = ref("");
const numPlayers = ref(0);
const serverName = ref("");

const serverStore = useServerStore();
const settingsStore = useSettingsStore();
const isServerUp = computed(() => serverStore.isServerUp);

function handleServerUp(_: Electron.IpcRendererEvent, state: GamedigState) {
    serverStore.setServerStatus(true);
    serverName.value = state.name;
    numPlayers.value = state.numplayers;
    maxPlayers.value = state.maxplayers;
    mission.value = state.raw.game;
}
function handleServerDown(_: Electron.IpcRendererEvent, ...args: any[]) {
    serverStore.setServerStatus(false);
    serverName.value = "";
    numPlayers.value = 0;
    maxPlayers.value = 0;
    mission.value = "";
}

onMounted(() => {
    window.electronAPI.serverUp(handleServerUp);
    window.electronAPI.serverDown(handleServerDown);
    window.electronAPI.refreshStatus(settingsStore.serverIP, settingsStore.serverPort);
    refreshInterval = setInterval(() => {
        window.electronAPI.refreshStatus(settingsStore.serverIP, settingsStore.serverPort);
    }, 1000 * 60);
});

onUnmounted(() => {
    window.electronAPI.removeServerDown(handleServerDown);
    window.electronAPI.removeServerUp(handleServerUp);
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});
</script>

<template>
    <div class="flex items-center space-x-2">
        <div :class="[
            'w-3 h-3 rounded-full',
            isServerUp
                ? 'bg-[#fde68a] gumball-pulse'
                : 'bg-[#161618] shadow-inner shadow-[#12121A] gumball-pulse-offline',
        ]"></div>
        <div class="text-white text-xs" v-if="isServerUp">
            <p>
                {{ serverName }} {{ mission }} (Players: {{ numPlayers }} /
                {{ maxPlayers }})
            </p>
        </div>
        <div class="text-white text-xs" v-else>
            <p>Server is offline</p>
        </div>
    </div>
</template>

<style scoped>
.gumball-pulse {
    animation: pulse-online 2.25s infinite;
}

.gumball-pulse-offline {
    animation: pulse-offline 2.25s infinite;
}

@keyframes pulse-online {
    from {
        box-shadow: 0 0 0 0 rgba(253, 230, 138, 0.7);
    }

    to {
        box-shadow: 0 0 0 10px rgba(253, 230, 138, 0);
    }
}

@keyframes pulse-offline {
    from {
        box-shadow: 0 0 0 10px rgba(253, 230, 138, 0);
    }

    to {
        box-shadow: 0 0 0 0 rgba(253, 230, 138, 0.3);
    }
}
</style>