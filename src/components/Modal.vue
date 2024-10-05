<script setup lang="ts">
const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const closeModal = () => {
    emit('close')
}
</script>

<template>
    <Transition name="modal">
        <div v-if="props.show" class="modal-container">
            <div class="modal-backdrop" @click="closeModal"></div>
            <div class="modal-content">
                <div class="modal-inner">
                    <div class="modal-header">
                        <slot name="header"></slot>
                    </div>
                    <div class="modal-body">
                        <slot name="body"></slot>
                    </div>
                    <div class="modal-footer">
                        <slot name="footer">
                            <button @click="closeModal" class="modal-close-button">
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
.modal-container {
    @apply fixed inset-0 z-50 flex items-center justify-center;
}

.modal-backdrop {
    @apply absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm;
}

.modal-content {
    @apply relative bg-zinc-900 rounded-lg shadow-lg w-full max-w-md m-4 overflow-hidden;
}

.modal-inner {
    @apply p-6;
}

.modal-header {
    @apply mb-4;
}

.modal-body {
    @apply mb-6;
}

.modal-footer {
    @apply flex justify-end;
}

.modal-close-button {
    @apply bg-[#161618] text-white text-sm font-semibold px-4 py-2 hover:bg-[#fde68a] hover:text-black transition-colors duration-300;
}

.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>