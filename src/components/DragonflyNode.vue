<script setup>
import {computed, getCurrentInstance, inject, onMounted, provide, reactive} from 'vue'
import DragonflyEndpoints from "./DragonflyEndpoints.vue";
import img from "./emptyDragImage";

const props = defineProps(['node', 'selected'])
const data = reactive({
	width: 0,
	height: 0,
	inDomOffset: {x: 0, y: 0},
	targeted: false,
	endPointRefs: [],
})
const setNodeSize = inject('setNodeSize')
const startNodeMoving = inject('startNodeMoving')
const nodeMoving = inject('nodeMoving')
const stopNodeMoving = inject('stopNodeMoving')
const startNodeLinking = inject('startNodeLinking')
const nodeLinking = inject('nodeLinking')
const stopNodeLinking = inject('stopNodeLinking')
const positions = inject('positions')
const linkSource = inject('linkSource')
const scale = inject('scale')
const readOnly = inject('readOnly')

const emit = defineEmits(['select', 'unselect'])

const current = getCurrentInstance()

onMounted(() => {
	data.width = current.refs.el.clientWidth
	data.height = current.refs.el.clientHeight
	setNodeSize(props.node.id, data.width, data.height)  // hacking: 回调DragonflyCanvasCore，提供尺寸信息
})

const position = computed(() => positions.value[props.node.id]);

const draggable = computed(() => {
	return !readOnly.value;
});

const y = computed(() => position.value?.y ?? 0);

const x = computed(() => position.value?.x ?? 0);

const onNodeDragging = event => {
	switch (event.type){
		case 'dragstart':
			if (draggable.value) {
				event.dataTransfer.setDragImage(img, 0, 0)
				document.addEventListener("dragover",  event => event.preventDefault(), false)    // hacking: 避免最后一次事件的坐标回到0,0
				startNodeMoving()
			}
			break
		case 'drag':
			if (!event.screenX && !event.screenY) return    // hacking: 防止拖出窗口位置被置为(0,0)
			if (draggable.value) {
				nodeMoving(Math.round(event.offsetX - data.inDomOffset.x), Math.round(event.offsetY - data.inDomOffset.y))
			}
			break
		case 'dragend':
			document.removeEventListener('dragover', event => event.preventDefault())
			stopNodeMoving()
			break
	}
}

const onMouseDown = event => {
	const rect = current.refs.el.getBoundingClientRect()
	data.inDomOffset.x = (event.x - rect.x) / scale.value
	data.inDomOffset.y = (event.y - rect.y) / scale.value
	
	if (props.selected) {
		event.shiftKey && emit('unselect', props.node.id)
	} else {
		emit('select', {id: props.node.id, multiple: event.shiftKey})
	}
};

provide('node', computed(() => props.node))
provide('nodePosition', computed(() => position.value))
provide('select', () => emit('select', {id: props.node.id}))
</script>

<template>
	<div ref="el" :class="{selected, targeted: data.targeted}" :style="{left: `${ x }px`, top:`${ y }px`}" class="dragonfly-node">
		<div class="dragonfly-node-inner" ref="inner"
			@mousedown.left.capture.stop="onMouseDown" :draggable="draggable"
			@dragstart="onNodeDragging" @drag.passive="onNodeDragging"
			@dragend.prevent="onNodeDragging" @dragenter.stop="onNodeDragging" @dragleave.stop="onNodeDragging">
			<slot/>
		</div>
		<template v-if="selected">
			<dragonfly-endpoints orientation="left" :id="node.id"/>
			<dragonfly-endpoints orientation="right" :id="node.id"/>
			<dragonfly-endpoints orientation="top" :id="node.id"/>
			<dragonfly-endpoints orientation="bottom" :id="node.id"/>
		</template>
	</div>
</template>

