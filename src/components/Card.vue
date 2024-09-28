<script setup lang="ts">
defineProps<{
    title: string;
    summary: string;
    link: string;
    image?: string;
}>();
</script>

<template>
    <div :class="[
        'flex mx-2 glass-dark h-full rounded-tl-2xl rounded-br-2xl',
        image ? 'w-[600px]' : 'w-[200px]',
    ]">
        <div :class="[
            image ? 'w-1/3' : 'w-full',
            'p-4 flex flex-col justify-between',
        ]">
            <h2 class="text-xl font-semibold">{{ title }}</h2>
            <p class="text-sm">{{ summary }}</p>
            <button
                class="bg-[#161618] px-4 py-2 transition-all duration-300 hover:shadow-[0_0_8px_rgba(253,230,138,0.5)] hover:text-[#fde68a]">
                {{ link }}
            </button>
        </div>
        <div v-if="image" class="w-2/3">
            <img :src="image" alt="Item image" class="w-full h-full object-cover rounded-br-2xl" />
        </div>
    </div>
</template>

<style scoped>
.glass-dark {
    background: rgba(63, 63, 70, 0.5);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: thin solid rgba(253, 230, 138, 0.3);
    box-shadow: 0 0 4px rgba(253, 230, 138, 0.3);
}
</style>
