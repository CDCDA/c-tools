<template>
  <div class="sortable">
    <div id="container" ref="sortableBoxRef">
      <div v-for="(item, index) in internalList" :key="getItemKey(item, index)" class="list-item">
        <slot>
          <div class="drag-handle">⋮⋮</div>
          <div class="item-content">
            <div class="item-title">{{ item.title }}</div>
            <!-- <div class="item-description">{{ item.content }}</div> -->
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sortable from "sortablejs";
import { onMounted, ref, nextTick, watch } from "vue";

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["change"]);

const sortableBoxRef = ref(null) as any;
const sortable = ref(null) as any;

const internalList = ref(props.list) as any;

watch(
  () => props.list,
  (newVal: any) => {
    internalList.value = newVal;
    console.log("internalList", internalList.value);
  },
  {
    deep: true,
  }
);

function getItemKey(item: any, index: any) {
  return item.id || item.key || index;
}

function defineSortable() {
  nextTick(() => {
    const el = sortableBoxRef.value;

    sortable.value = Sortable.create(el, {
      animation: 200,
      group: "name",
      sort: true,
      draggable: ".list-item",
      forceFallback: true,
      fallbackOnBody: true,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",

      onStart: (evt: any) => {
        evt.originalEvent?.preventDefault();
      },
      onEnd: (evt: any) => {
        // console.log("拖拽结束", evt);
        const { oldIndex, newIndex } = evt;

        if (oldIndex !== newIndex) {
          reorderArray(oldIndex, newIndex);
        }
      },
    });
  });
}

function reorderArray(oldIndex: any, newIndex: any) {
  const newList = [...internalList.value];
  const [movedItem] = newList.splice(oldIndex, 1);
  newList.splice(newIndex, 0, movedItem);
  internalList.value = newList;

  emit("change", {
    oldIndex,
    newIndex,
    list: newList,
  });

  // console.log("更新后的数组:", newList);
}

onMounted(() => {
  defineSortable();
});
</script>
<style>
.sortable {
  height: calc(100% - 2px);
}
#container {
  list-style: none;
  border-radius: 4px;
  overflow: hidden;
  padding: 0;
  margin: 0;
  height: 100%;
  border: 1px solid #ddd;
  background: white;
  /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); */
}
.list-item {
  padding: 5px 10px;
  background: white;
  border-bottom: 1px solid #ecf0f1;
  cursor: grab;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}
.list-item:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.list-item:active {
  cursor: grabbing;
}
.list-item.dragging {
  opacity: 0.6;
  background: #e3f2fd;
  transform: rotate(5deg);
}
.drag-handle {
  margin-right: 15px;
  color: #bdc3c7;
  font-size: 1.2rem;
}
.item-content {
  flex: 1;
}
.item-title {
  font-weight: 500;
  margin-bottom: 5px;
}
.item-description {
  font-size: 0.85rem;
  color: #7f8c8d;
}
.list-item.dragging {
  opacity: 0.6;
  background: #e3f2fd;
  transform: rotate(5deg);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.list-item.sortable-ghost {
  opacity: 0.4;
  background: #c8e6c9;
}
/* 简约现代动画 */
.list-item {
  transition: all 0.25s ease-in-out;
}

.list-item.sortable-ghost {
  opacity: 0.6;
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.list-item.sortable-chosen {
  background: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.list-item.sortable-drag {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: perspective(1000px) rotateX(5deg);
}
</style>
