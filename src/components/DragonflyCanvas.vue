<script setup>
import {computed, getCurrentInstance, onMounted, provide, reactive, ref} from 'vue'
import DragonflyCanvasEdgesLayer from './DragonflyCanvasEdgesLayer.vue';
import DragonflyGrid from './DragonflyGrid.vue';
import DragonflyNode from './DragonflyNode.vue';
import {randomString} from "./utils";

const canvasId = randomString()
const linkSource = ref(null);

const current = getCurrentInstance()

const emit = defineEmits([
	'update:zoomScale',
	'update:canvasDragging',
	'update:edgesData',
	'update:nodesData',
	'update:selection',
	'node:selected',
	'node:unselected',
	'edge:selected',
	'edge:unselected'
])

const props = defineProps({
	nodesData: {type: Array, default: () => []},
	edgesData: {type: Array, default: () => [],},
	positions: {type: Object, default: () => reactive({})},
	selection: {type: Array, default: () => []},
	
	zoomScale: {type: Number,},
	maxZoomScale: {type: Number, default: 5},
	minZoomScale: {type: Number, default: 1},
	layoutConfig: {type: Object, default: () => ({})},
	beforeAddEdgeHook: {type: Function},
	canvasDragging: {type: String, default: 'select'}, // off | select | scroll
	showEdgeLabels: {type: Boolean, default: true},
	gridSize: {type: Number, default: 10},
	minGridScale: {type: Number, default: 0.5},
	maxGridScale: {type: Number, default: 5},
	showGrid: {type: Boolean, default: true},
	readOnly: {type: Boolean, default: false},
})

const data = reactive({
	dragging: false,
	scale: props.zoomScale ?? 1,
	offsetX: 0,
	offsetY: 0,
	width: 0,
	height: 0,
	endpointPositions: {}, // 存锚点相对于节点的位置
	linkingSource: {x: 0, y: 0},
	linkingTarget: {x: 0, y: 0},
	draggingSource: {x: 0, y: 0},
	draggingTarget: {x: 0, y: 0},
	preSelected: {},
	linking: false,
	canvasDraggingBehavior: props.canvasDragging,
	history: [],
	historyHead: 0,
	movingSource: null,
	movingTarget: null,
})

// selection start
const computedSelection = computed(() => reactive(props.selection ?? []))
const selected = computed(() => {
	return Object.fromEntries(computedSelection.value.map(id => [id, true]));
})
const multiple = computed(() => selection.length > 1)


const selection = reactive([])

const selectAgain = (...ids) => {
	if (!props.selection) {
		computedSelection.value.length = 0
		computedSelection.value.push(...ids)
	}
	emit('update:selection', [...ids])
}

const selectMore = (...ids) => {
	const [...old] = computedSelection.value
	if (!props.selection) computedSelection.value.push(...ids)
	emit('update:selection', [...old, ...ids])
}

const unselect = (...ids) => {
	const selection = computedSelection.value.filter(id => !ids.includes(id))
	if (!props.selection) {
		computedSelection.value.length = 0
		computedSelection.value.push(...selection)
	}
	emit('update:selection', [...selection])
}

provide('selectAgain', selectAgain)
provide('selectMore', selectMore)
provide('multipleSelected', multiple)
provide('selected', selected)
provide('unselect', unselect)
// selection end

const draggingAreaStyle = computed(() => {
	const width = `${draggingArea.value.width}px`
	const height = `${draggingArea.value.height}px`
	const top = `${draggingArea.value.top}px`
	const left = `${draggingArea.value.left}px`
	return {width, height, top, left,}
});

const draggingArea = computed(() => {
	const width = Math.abs(data.draggingSource.x - data.draggingTarget.x)
	const height = Math.abs(data.draggingSource.y - data.draggingTarget.y)
	const top = Math.min(data.draggingSource.y, data.draggingTarget.y)
	const left = Math.min(data.draggingSource.x, data.draggingTarget.x)
	return {width, height, top, left,}
});

const canvasStyle = computed(() => ({
	transform: `scale(${data.scale})`,
	top: `${data.offsetY}px`,
	left: `${data.offsetX}px`
}));

const nodes = computed({
	get() {
		return props.nodesData ?? []
	},
	set(value) {
		if (JSON.stringify(value) !== JSON.stringify(props.nodesData)) {
			emit('update:nodesData', value)
		}
	}
})
const edges = computed({
	get() {
		return props.edgesData ?? []
	},
	set(value) {
		if (JSON.stringify(value) !== JSON.stringify(props.edgesData)) {
			emit('update:edgesData', value)
		}
	}
})

const zoomScale = computed({
	get() {
		return props.zoomScale ?? data.scale
	},
	set(value) {
		data.scale = value
		emit('update:zoomScale', value)
	}
})

const startSelectedMoving = () => {
	data.movingSource = Object.fromEntries(Object.keys(selected.value).filter(id => selected.value[id]).map(id => [id, {...props.positions[id]}]))
};

const updatePosition = ({id, x, y, width, height}) => props.positions[id] = {x, y, width, height};

const endpointReposition = (id, x, y, width, height, orientation) => data.endpointPositions[id] = {
	x,
	y,
	width,
	height,
	orientation
};

const link = async (target, targetEndpoint) => {
	if (!linkSource.value) return
	const {source, sourceEndpoint} = linkSource.value
	if ((sourceEndpoint ?? source) === (targetEndpoint ?? target)) return
	
	if (edges.value.find(x => x.source === source && x.target === target)) {
		return
	}
	
	const defaultEdge = {
		id: `${sourceEndpoint ?? source}-${targetEndpoint ?? target}`,
		source, sourceEndpoint,
		target, targetEndpoint
	}
	const edge = await props.beforeAddEdgeHook?.(defaultEdge) ?? defaultEdge
	if (edge) {
		edges.value = [...edges.value, edge]
	}
};

const stopNodeLinking = () => {
	data.linking = false
	linkSource.value = null
};

const nodeLinking = (
	sourceX,
	sourceY,
	sourceWidth,
	sourceHeight,
	sourceOrientation = 'right',
	targetX,
	targetY,
	targetWidth = 0,
	targetHeight = 0,
	targetOrientation = 'left') => {
	
	data.linkingSource = {
		x: sourceX,
		y: sourceY,
		width: sourceWidth,
		height: sourceHeight,
		orientation: sourceOrientation
	}
	data.linkingTarget = {
		x: targetX,
		y: targetY,
		width: targetWidth ?? 0,
		height: targetHeight ?? 0,
		orientation: targetOrientation
	}
	data.linking = true
};

const startNodeLinking = ({source, sourceEndpoint, sourceGroup}) => linkSource.value = {
	source,
	sourceEndpoint,
	sourceGroup
};

const stopNodeMoving = () => {
	data.movingTarget = Object.fromEntries(Object.keys(selected.value).filter(id => selected.value[id]).map(id => [id, props.positions[id]]))
	data.movingSource = data.movingTarget = null
};

const nodeMoving = (deltaX, deltaY) => {
	for (const nodeId in selected.value)
		if (selected.value[nodeId]) {
			let {x, y, width, height,} = props.positions[nodeId]
			x += deltaX
			y += deltaY
			props.positions[nodeId] = {x, y, width, height,}
		}
};

const startNodeMoving = startSelectedMoving

// 用于Provide/Inject
const setNodeSize = (nodeId, width, height) => props.positions[nodeId] = {
	x: 0,
	y: 0, ...props.positions[nodeId],
	width,
	height
};

const onUnselect = (id, type = 'node') => {
	unselect(id)
	emit(`${type}:unselected`, id)
};

const onSelect = ({id, multiple, type = 'node'}) => {
	current.refs.canvas.focus({preventScroll: true})
	multiple ? selectMore(id) : selectAgain(id)
	emit(`${type}:selected`, id)
};

const preSelect = shiftKey => {
	for (const nodeId in props.positions) {
		const isSelected = selected.value[nodeId]
		const {x, y, width, height} = props.positions[nodeId]
		const xBetween = x + width > Math.min(data.draggingSource.x, data.draggingTarget.x) && x < Math.max(data.draggingSource.x, data.draggingTarget.x)
		const yBetween = y + height > Math.min(data.draggingSource.y, data.draggingTarget.y) && y < Math.max(data.draggingSource.y, data.draggingTarget.y)
		const selecting = xBetween && yBetween
		data.preSelected[nodeId] = shiftKey ? (selecting ? !isSelected : isSelected) : selecting
	}
};

const mouseupOutside = event => {
	if (data.dragging) {
		document.removeEventListener('mousemove', mousemoveOutsideHandler)
		document.removeEventListener('mouseup', mouseupOutsideHandler)
		mouseupOutsideHandler = null
		mousemoveOutsideHandler = null
		mouseup(event)
	}
}

function selectDragging(event) {
	data.draggingTarget.x += event.movementX / zoomScale.value
	data.draggingTarget.y += event.movementY / zoomScale.value
	preSelect(event.shiftKey)
}

function selectDraggingEnd(){
	selectAgain(...Object.entries(data.preSelected).filter(([, isSelected]) => isSelected).map(([id]) => id))
	data.preSelected = {}
}

function scrollDragging(event) {
	data.offsetX += event.movementX / zoomScale.value
	data.offsetY += event.movementY / zoomScale.value
}

function mouseup() {
	if (data.dragging) {
		data.dragging = false
		props.canvasDragging === 'select' && selectDraggingEnd()
	}
}

function mousemove(event){
	if (data.dragging) {
		event.preventDefault()  // hacking: 避免移动时选择外部文本
		if (props.canvasDragging === 'select'){
			selectDragging(event)
		}else if(props.canvasDragging === 'scroll'){
			scrollDragging(event)
		}
	}
}

let mouseupOutsideHandler
let mousemoveOutsideHandler

const onCanvasDragging = event => {
	switch (event.type){
		case 'mouseup': mouseup(event); break
		case 'mousedown':
			if (!event.shiftKey) selectAgain()
			const canvas = current.refs.canvas
			const fromCanvas = event.target === canvas
			// hacking: 用这个方式来获取keydown事件，必须结合canvas的tabindex属性，并防止获得焦点时滚动屏幕
			fromCanvas && canvas.focus({ preventScroll: true })
			const insideCanvas = !fromCanvas && event.path.includes(canvas)
			if (!insideCanvas) {
				event.preventDefault()
				data.dragging = true
				// hacking: 如果在canvas内开始选择，就不再需要去掉canvas相对于viewport的偏移
				data.draggingSource.x = data.draggingTarget.x = event.offsetX / (fromCanvas ? 1 : zoomScale.value) - (fromCanvas ? 0 : data.offsetX / data.scale)
				data.draggingSource.y = data.draggingTarget.y = event.offsetY / (fromCanvas ? 1 : zoomScale.value) - (fromCanvas ? 0 : data.offsetY / data.scale)
				if (props.canvasDragging === 'select'){
					selectDragging(event)
				}else if(props.canvasDragging === 'scroll'){
					scrollDragging(event)
				}
			}
			break
		case 'mousemove': mousemove(event); break
		case 'mouseleave':
			if (data.dragging) {
				mouseupOutsideHandler = mouseupOutside
				mousemoveOutsideHandler = mousemove
				document.addEventListener('mousemove', mousemoveOutsideHandler, false)
				document.addEventListener('mouseup', mouseupOutsideHandler, { once: true })
			}
			break
		case 'mouseenter':
			if (data.dragging) {
				document.removeEventListener('mousemove', mousemoveOutsideHandler)
				document.removeEventListener('mouseup', mouseupOutsideHandler)
				mouseupOutsideHandler = null
				mousemoveOutsideHandler = null
			}
			break
	}
};

const zoomSensitivity = 0.001
const onCanvasWheeling = event => {
	if (event.type !== 'wheel') return
	
	event.preventDefault()
	if (event.deltaY === 0) return;
	if ((event.deltaY < 0 && zoomScale.value <= props.minZoomScale) ||
		(event.deltaY > 0 && zoomScale.value >= props.maxZoomScale))
		return
	
	let scale = zoomScale.value + zoomSensitivity * event.deltaY
	if (scale > props.maxZoomScale) scale = props.maxZoomScale
	else if (scale < props.minZoomScale) scale = props.minZoomScale
	
	const delta = scale - zoomScale.value
	const rect = current.refs.el.getBoundingClientRect()
	data.offsetX += (data.offsetX + rect.left - event.clientX) * delta / zoomScale.value
	data.offsetY += (data.offsetY + rect.top - event.clientY) * delta / zoomScale.value
	zoomScale.value = scale
};

const translateMouseEvent = ({event}) => {
	if (event.target === current.refs.canvas) {
		return {x: event.layerX / zoomScale.value, y: event.layerY / zoomScale.value}
	} else if (event.target === current.refs.canvas.parentElement) {
		return {x: (event.layerX - data.offsetX) / zoomScale.value, y: (event.layerY - data.offsetY) / zoomScale.value}
	} else return null
};
defineExpose({translateMouseEvent})

const onKeyDown = event => {
	if (props.readOnly) return
	if (event.target === current.refs.canvas) {
		if (['Backspace', 'Delete'].includes(event.code)) {
			deleteSelectedNodes()
			deleteSelectedEdges()
		}
	}
};

const deleteSelectedEdges = () => {
	const deleted = edges.value.filter(({id}) => selected.value[id])
	if (deleted.length) {
		edges.value = edges.value.filter(({id}) => !selected.value[id])
	}
};

const deleteSelectedNodes = () => {
	const deleted = nodes.value.filter(({id}) => selected.value[id])
	if (deleted.length) {
		nodes.value = nodes.value.filter(({id}) => !selected.value[id])
		edges.value = edges.value.filter(({source, target}) => !selected.value[source] && !selected.value[target])
		deleted.forEach(({id}) => delete props.positions[id])
	}
};

provide('nodes', nodes)
provide('edges', edges)
provide('setNodeSize', setNodeSize)
provide('startNodeMoving', startNodeMoving)
provide('nodeMoving', nodeMoving)
provide('stopNodeMoving', stopNodeMoving)
provide('startNodeLinking', startNodeLinking)
provide('nodeLinking', nodeLinking)
provide('stopNodeLinking', stopNodeLinking)
provide('endpointReposition', endpointReposition)
provide('link', link)
provide('positions', computed(() => props.positions))
provide('linkSource', linkSource)
provide('dragging', computed(() => data.dragging))
provide('onSelect', onSelect)
provide('onUnselect', onUnselect)
provide('showEdgeLabels', computed(() => props.showEdgeLabels))
provide('canvasId', canvasId)
provide('updatePosition', updatePosition)
provide('scale', zoomScale)
provide('readOnly', computed(() => props.readOnly))


onMounted(() => {
	const el = current.refs.el
	const resizeObserver = new ResizeObserver(entries => {
		entries.forEach(entry => {
			data.width = entry.target.clientWidth
			data.height = entry.target.clientHeight
		})
	})
	data.width = el.clientWidth
	data.height = el.clientHeight
	resizeObserver.observe(el)
})
</script>

<template>
	<div ref="el" class="dragonfly-viewport"
		@mouseenter="onCanvasDragging" @mouseleave="onCanvasDragging" @mousemove="onCanvasDragging"
		@mouseup="onCanvasDragging" @wheel="onCanvasWheeling" @mousedown.left="onCanvasDragging">
		
		<div :id="`dragonfly-canvas-${canvasId}`" ref="canvas" :style="canvasStyle" class="dragonfly-canvas"
			tabindex="-1" @keydown="onKeyDown">
			
			<div v-if="data.dragging" :class="canvasDragging" :style="draggingAreaStyle" class="area"/>
			
			<dragonfly-node v-for="node in nodes" :key="node.id" :node="node"
				:selected="data.preSelected[node.id] ?? selected[node.id]" @select="onSelect" @unselect="onUnselect">
				
				<slot :node="node"></slot>
			</dragonfly-node>
			
			<dragonfly-canvas-edges-layer :edges="edges" :endpoint-positions="data.endpointPositions"
				:linking="data.linking" :linking-source="data.linkingSource" :linking-target="data.linkingTarget"
				:positions="positions"/>
		</div>
		<dragonfly-grid v-if="showGrid" :max-scale="maxGridScale" :min-scale="minGridScale" :offset-x="data.offsetX"
			:offset-y="data.offsetY" :size="gridSize"/>
		<div class="dragonfly-scale">1 : {{ parseFloat(zoomScale.toPrecision(3) + '') }}</div>
	</div>
</template>
