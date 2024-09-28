<script setup lang="ts">
const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const closeModal = () => {
    emit('close')
}
</script>

<template>
    <Transition name="modal">
        <div v-if="props.show" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" @click="closeModal"></div>
            <div class="relative bg-zinc-900 rounded-lg shadow-lg w-full max-w-md m-4 overflow-hidden">
                <div class="p-6">
                    <div class="mb-4">
                        <slot name="header"></slot>
                    </div>
                    <div class="mb-6">
                        <slot name="body"></slot>
                    </div>
                    <div class="flex justify-end">
                        <slot name="footer">
                            <button @click="closeModal"
                                class="bg-[#161618] text-white text-sm font-semibold px-4 py-2 hover:bg-[#fde68a] hover:text-black transition-colors duration-300">
                                Close
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>