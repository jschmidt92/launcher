<script setup lang="ts">
defineProps<{
    title: string;
    summary: string;
    link: string;
    image?: string;
}>();
</script>

<template>
    <div :class="['card', { 'with-image': image }]">
        <div class="card-content">
            <h2 class="card-title">{{ title }}</h2>
            <p class="card-summary">{{ summary }}</p>
            <button class="card-button">
                {{ link }}
            </button>
        </div>
        <div v-if="image" class="card-image">
            <img :src="image" alt="Item image" />
        </div>
    </div>
</template>

<style scoped>
.card {
    @apply flex mx-2 glass-dark h-full rounded-tl-2xl rounded-br-2xl w-[200px];
}

.card.with-image {
    @apply w-[600px];
}

.card-content {
    @apply p-4 flex flex-col justify-between w-full;
}

.card.with-image .card-content {
    @apply w-1/3;
}

.card-title {
    @apply text-xl font-semibold;
}

.card-summary {
    @apply text-sm;
}

.card-button {
    @apply bg-[#161618] px-4 py-2 transition-all duration-300 hover:shadow-[0_0_8px_rgba(253,230,138,0.5)] hover:text-[#fde68a];
}

.card-image {
    @apply w-2/3;
}

.card-image img {
    @apply w-full h-full object-cover rounded-br-2xl;
}

.glass-dark {
    background: rgba(63, 63, 70, 0.5);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: thin solid rgba(253, 230, 138, 0.3);
    box-shadow: 0 0 4px rgba(253, 230, 138, 0.3);
}
</style>
