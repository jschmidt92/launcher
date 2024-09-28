<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import data from "../assets/data.json";
import Card from "./Card.vue";

const activeItems = computed(
    () => items.value[activeTab.value as keyof typeof items.value]
);
const activeTab = ref("tab1");
const items = ref(data.items);
const scrollContainer = ref(<HTMLElement | null>null);
const tabs = ref(data.tabs);

function handleWheel(e: WheelEvent) {
    e.preventDefault();
    if (scrollContainer.value) {
        scrollContainer.value.scrollLeft += e.deltaY;
    }
}

onMounted(() => {
    if (scrollContainer.value) {
        scrollContainer.value.addEventListener("wheel", handleWheel);
    }
});

onUnmounted(() => {
    if (scrollContainer.value) {
        scrollContainer.value.removeEventListener("wheel", handleWheel);
    }
});
</script>

<template>
    <div class="flex flex-col h-full justify-end">
        <!-- Navigation row -->
        <div class="flex-none mb-4">
            <nav>
                <ul class="flex space-x-2">
                    <li v-for="tab in tabs" :key="tab.id">
                        <a href="#" @click.prevent="activeTab = tab.id" :class="[
                            'py-2 px-2 font-light text-lg transition-all duration-300',
                            activeTab === tab.id
                                ? 'text-shadow-gold text-white'
                                : 'text-gray-300 hover:text-white'
                        ]">
                            {{ tab.name }}
                        </a>
                    </li>
                </ul>
            </nav>
        </div>

        <!-- Cards row -->
        <div class="flex-none h-1/2 relative overflow-x-hidden" ref="scrollContainer">
            <div class="flex flex-row h-full absolute bottom-0 left-0">
                <Card v-for="item in activeItems" :key="item.id" :title="item.title" :summary="item.summary"
                    :link="item.link" :image="item.image" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.text-shadow-gold {
    color: #fde68a;
    text-shadow: #fde68a 1px 0px 6px;
}
</style>