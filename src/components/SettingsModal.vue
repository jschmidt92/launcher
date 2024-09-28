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
                <h2 class="text-xl font-semibold">Settings</h2>
            </template>
            <template #body>
                <form @submit.prevent="saveServerSettings">
                    <div class="flex mb-2">
                        <input type="text" v-model="arma3path" placeholder="Path to Arma 3 Game Folder"
                            class="flex-grow px-3 py-2 bg-[#161618] text-white text-xs border-[#fde68a50]" />
                        <button type="button" @click="browseAndSetArma3Path"
                            class="bg-[#fde68a] text-black text-sm font-semibold px-4 py-2 relative transition-all duration-300 hover:text-white hover:shadow-[0_0_15px_rgba(253,230,138,0.5)] group">
                            <span class="relative z-10">Browse</span>
                            <div
                                class="absolute inset-0 bg-[#fde68a] opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                            </div>
                        </button>
                    </div>
                    <div class="mb-2">
                        <input type="text" v-model="serverIP" placeholder="Server IP"
                            class="w-full px-3 py-2 bg-[#161618] text-white text-xs border-[#fde68a50]" />
                    </div>
                    <div class="mb-2">
                        <input type="text" v-model="serverPort" placeholder="Server Port"
                            class="w-full px-3 py-2 bg-[#161618] text-white text-xs border-[#fde68a50]" />
                    </div>
                    <div class="mb-2">
                        <input type="password" v-model="serverPassword" placeholder="Server Password"
                            class="w-full px-3 py-2 bg-[#161618] text-white text-xs border-[#fde68a50]" />
                    </div>
                    <button type="submit"
                        class="bg-[#fde68a] text-black text-sm font-semibold px-4 py-2 w-full relative transition-all duration-300 hover:text-white hover:shadow-[0_0_15px_rgba(253,230,138,0.5)] group">
                        <span class="relative z-10">Save Settings</span>
                        <div
                            class="absolute inset-0 bg-[#fde68a] opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                        </div>
                    </button>
                </form>
            </template>
        </modal>
    </Teleport>
</template>
