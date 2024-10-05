<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { GameDigState } from "../types";
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

function handleServerUp(_: Electron.IpcRendererEvent, state: GameDigState) {
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
    <div class="server-status-container">
        <div :class="['status-indicator', isServerUp ? 'online' : 'offline']"></div>
        <div class="server-info" v-if="isServerUp">
            <p>
                {{ serverName }} {{ mission }} (Players: {{ numPlayers }} /
                {{ maxPlayers }})
            </p>
        </div>
        <div class="server-info" v-else>
            <p>Server is offline</p>
        </div>
    </div>
</template>

<style scoped>
.server-status-container {
    @apply flex items-center space-x-2;
}

.status-indicator {
    @apply w-3 h-3 rounded-full;
}

.status-indicator.online {
    @apply bg-[#fde68a] gumball-pulse;
}

.status-indicator.offline {
    @apply bg-[#161618] shadow-inner shadow-[#12121A] gumball-pulse-offline;
}

.server-info {
    @apply text-white text-xs;
}

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