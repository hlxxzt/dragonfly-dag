<template>
	<l-broken-line v-model:definition="data.definition" :position="{source, target}"></l-broken-line>
	<path ref="path" :class="{selected}" :d="data.definition" class="edge"/>
	<path :d="data.definition" class="edge-area" :class="{selected}" @mousedown.left.prevent.stop="onMouseDown"/>
	<line :x1="data.arrowPoint1.x" :x2="data.arrowPoint2.x" :y1="data.arrowPoint1.y" :y2="data.arrowPoint2.y" class="edge-arrow" marker-end="url(#arrow)"/>
	<template v-if="isShowAnimate">
		<circle r="2" fill="blue">
			<animateMotion dur="3s" repeatCount="indefinite" :path="data.definition"/>
		</circle>
		<circle r="2" fill="blue">
			<animateMotion begin="1s" dur="3s" repeatCount="indefinite" :path="data.definition"/>
		</circle>
		<circle r="2" fill="blue">
			<animateMotion begin="2s" dur="3s" repeatCount="indefinite" :path="data.definition"/>
		</circle>
	</template>
	<template v-if="showLabel">
		<teleport :to="`#dragonfly-canvas-${canvasId}`">
			<div :style="data.labelStyle" class="edge-label">
				<slot>{{ edge.label }}</slot>
			</div>
		</teleport>
	</template>
</template>
<script setup>
import {computed, getCurrentInstance, inject, nextTick, onMounted, reactive, watch} from "vue";
import LBrokenLine from "./LBrokenLine.vue";

const origin = {x: 0, y: 0}
const props = defineProps(['edge', 'sourceNode', 'sourceEndpoint', 'targetNode', 'targetEndpoint', 'selected'])
const onSelect = inject('onSelect')
const onUnselect = inject('onUnselect')
const canvasId = inject('canvasId')
const showEdgeLabels = inject('showEdgeLabels')
const readOnly = inject('readOnly')
const curSelected = inject('selected')
const isShowAnimate = computed(() => {
	if (props.selected) return true
	if (curSelected.value[props.edge.source]) return true
	return curSelected.value[props.edge.target]
})

const data = reactive({
	definition: '',
	arrowPoint1: {x: 0, y: 0},
	arrowPoint2: {x: 0, y: 0},
	labelStyle: null
})


const showLabel = computed(() => showEdgeLabels.value && (props.edge.showLabel ?? true) && props.edge.label);

const lineEnds = computed(() => ({source: source.value, target: target.value}));

const target = computed(() => {
	if (props.targetEndpoint) {
		return {
			x: props.targetNode.x + props.targetEndpoint.x,
			y: props.targetNode.y + props.targetEndpoint.y,
			width: props.targetEndpoint.width,
			height: props.targetEndpoint.height,
			orientation: props.targetEndpoint.orientation,
		}
	} else {
		return {
			x: props.targetNode.x,
			y: props.targetNode.y,
			width: props.targetNode.width,
			height: props.targetNode.height,
			orientation: props.targetNode.orientation,
		}
	}
});

const source = computed(() => {
	if (props.sourceEndpoint) {
		return {
			x: props.sourceNode.x + props.sourceEndpoint.x,
			y: props.sourceNode.y + props.sourceEndpoint.y,
			width: props.sourceEndpoint.width,
			height: props.sourceEndpoint.height,
			orientation: props.sourceEndpoint.orientation,
		}
	} else {
		return {
			x: props.sourceNode.x,
			y: props.sourceNode.y,
			width: props.sourceNode.width,
			height: props.sourceNode.height,
			orientation: props.sourceNode.orientation,
		}
	}
});


const onMouseDown = event => {
	if (props.selected) {
		onUnselect(props.edge.id, 'edge')
	} else {
		onSelect({id: props.edge.id, multiple: event.shiftKey, type: 'edge'})
	}
};

const current = getCurrentInstance()

const generatePoints = () => {
	const path = current.refs.path
	
	if (path) {
		nextTick(() => {
			const pathLength = path.getTotalLength() ?? 0
			generateArrowPoints(pathLength, path)
			generateLabelStyle(pathLength, path)
		})
	}
};

const generateLabelStyle = (pathLength, path) => {
	if (showLabel.value) {
		const labelPointLength = pathLength / 2
		const {x: x1, y: y1} = path.getPointAtLength(Math.max(labelPointLength - 1, 0)) ?? origin
		data.labelStyle = { left: `${x1}px`, top: `${y1}px` }
	} else {
		data.labelStyle = null
	}
};

const generateArrowPoints = function (pathLength, path) {
	const arrowPointLength = pathLength
	data.arrowPoint1 = path.getPointAtLength(Math.max(arrowPointLength - 1, 0)) ?? origin
	data.arrowPoint2 = path.getPointAtLength(arrowPointLength) ?? origin
};

onMounted(() => {
	generatePoints()
})

watch([lineEnds, showEdgeLabels], generatePoints)

</script>
