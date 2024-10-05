<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "../stores/settings";
import modal from "./Modal.vue";

const emit = defineEmits(["close"]);
const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    }
})
const store = useSettingsStore();
const { arma3path, serverIP, serverPort, serverPassword } = storeToRefs(store);

function closeModal() {
    emit("close");
}

function browseAndSetArma3Path() {
    window.electronAPI.openDirectory().then((result: string | undefined) => {
        if (result) {
            arma3path.value = result;
        }
    });
}

function saveServerSettings() {
    store.updateSettings(
        arma3path.value,
        serverIP.value,
        serverPort.value,
        serverPassword.value
    );
    closeModal();
}

onMounted(() => {
    arma3path.value = localStorage.getItem('arma3path') || arma3path.value;
    serverIP.value = localStorage.getItem('serverIP') || serverIP.value;
    serverPort.value = Number(localStorage.getItem('serverPort')) || serverPort.value;
    serverPassword.value = localStorage.getItem('serverPassword') || serverPassword.value;
});
</script>

<template>
    <Teleport to="body">
        <modal :show="props.show" @close="closeModal">
            <template #header>
                <h2 class="settings-title">Settings</h2>
            </template>
            <template #body>
                <form @submit.prevent="saveServerSettings">
                    <div class="input-group">
                        <input type="text" v-model="arma3path" placeholder="Path to Arma 3 Game Folder" class="input-field" />
                        <button type="button" @click="browseAndSetArma3Path" class="browse-button">
                            <span class="button-text">Browse</span>
                            <div class="button-overlay"></div>
                        </button>
                    </div>
                    <div class="input-wrapper">
                        <input type="text" v-model="serverIP" placeholder="Server IP" class="input-field" />
                    </div>
                    <div class="input-wrapper">
                        <input type="text" v-model="serverPort" placeholder="Server Port" class="input-field" />
                    </div>
                    <div class="input-wrapper">
                        <input type="password" v-model="serverPassword" placeholder="Server Password" class="input-field" />
                    </div>
                    <button type="submit" class="save-button">
                        <span class="button-text">Save Settings</span>
                        <div class="button-overlay"></div>
                    </button>
                </form>
            </template>
        </modal>
    </Teleport>
</template>

<style scoped>
.settings-title {
    @apply text-xl font-semibold;
}

.input-group {
    @apply flex mb-2;
}

.input-wrapper {
    @apply mb-2;
}

.input-field {
    @apply w-full px-3 py-2 bg-[#161618] text-white text-xs border-[#fde68a50];
}

.browse-button, .save-button {
    @apply bg-[#fde68a] text-black text-sm font-semibold px-4 py-2 relative transition-all duration-300 hover:text-white hover:shadow-[0_0_15px_rgba(253,230,138,0.5)];
}

.browse-button:hover .button-overlay, 
.save-button:hover .button-overlay {
    @apply opacity-50;
}

.button-text {
    @apply relative z-10;
}

.button-overlay {
    @apply absolute inset-0 bg-[#fde68a] opacity-0 transition-opacity duration-300;
}

.save-button {
    @apply w-full;
}
</style>
