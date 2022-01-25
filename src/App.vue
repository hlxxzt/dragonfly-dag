<script setup>
import {getCurrentInstance, reactive} from "vue";
import CanvasData from './CanvasData.vue';
import './components/dragonfly-dag.less'
import DragonflyCanvas from "./components/DragonflyCanvas.vue";

const current = getCurrentInstance()

const config = reactive({
	zoomScale: 1,
	minZoomScale: 1,
	maxZoomScale: 5,
	canvasDragging: 'select',
	showEdgeLabels: true,
	showGrid: true,
	gridSize: 20,
	maxGridScale: 2,
	minGridScale: 0.5
})

const dataSet = reactive({
	nodes: [{id: 's1', status: 'queueing'}, {id: 's2', status: 'queueing'}],
	edges: [],
	positions: {},
	selection: []
})

const addNode = () => {
	dataSet.nodes = [...dataSet.nodes, {id: `${feed}`}]
	feed++
}

const onAddingEdge = async ({source, target, sourceEndpoint, targetEndpoint}) => new Promise(resolve => {
	setTimeout(() => {
		resolve({
			id: `${sourceEndpoint ?? source}-${targetEndpoint ?? target}`,
			source,
			target,
			sourceEndpoint,
			targetEndpoint,
			label: (sourceEndpoint ?? source).split('-')[1]
		}) // 用自定义数据连接
		// resolve(false)   // 取消连接
		// resolve(undefined)  // 用默数据连接
	}, 100)
})

const onDblClick = event => {
	const axis = current.refs.canvas.translateMouseEvent({event: event})
	if (axis) {
		//dataSet.nodes = [...dataSet.nodes, {id: 's3'}]
		//nextTick(() => dataSet.positions['s3'] = {...dataSet.positions['s3'], ...axis})
	}
};

const onNodeSelected = event => {
	console.log(event)
}
</script>

<template>
	<div>
		<a-space>
			<a-button @click="addNode">添加节点</a-button>
			画布拖拽行为
			<a-radio-group :value="config.canvasDragging" size="small" @change="config.canvasDragging = $event.target.value">
				<a-radio-button value="off">锁定</a-radio-button>
				<a-radio-button value="select">框选</a-radio-button>
				<a-radio-button value="scroll">滚动</a-radio-button>
			</a-radio-group>
		</a-space>
	</div>
	<span id="debt"></span>
	<div style="width: calc(100% - 300px); height: calc(100% - 43px); margin-top: 10px; background: #ccc">
		<dragonfly-canvas ref="canvas"
			v-model:edges-data="dataSet.edges"
			v-model:nodes-data="dataSet.nodes"
			v-model:selection="dataSet.selection"
			v-model:zoom-scale="config.zoomScale"
			:positions="dataSet.positions"
			
			:canvas-dragging="config.canvasDragging"
			:max-zoom-scale="config.maxZoomScale"
			:min-zoom-scale="config.minZoomScale"
			:show-edge-labels="config.showEdgeLabels"
			:grid-size="config.gridSize"
			:max-grid-scale="config.maxGridScale"
			:min-grid-scale="config.minGridScale"
			:show-grid="config.showGrid"
			
			:before-add-edge-hook="onAddingEdge"
			@dblclick.stop.prevent="onDblClick"
			@node:selected="onNodeSelected"
		>
			<template #default="{node}">
				<div class="node">Hi, {{ node.id }}</div>
			</template>
		</dragonfly-canvas>
	</div>
	<canvas-data v-bind="dataSet"/>
</template>


<script>
let feed = 1
</script>

<style lang="less">
.node {
	padding: 1em;
	background-color: #9cdfff;
}

.succeeded-label {
	background-color: #e6ffe6;
	border-radius: 4px;
	color: #bbb;
	line-height: 1em;
	padding: 2px 2px;
	left: 10px;
	top: -15px;
}

.failed-label {
	background-color: #ffe6e6;
	border-radius: 4px;
	color: #bbb;
	line-height: 1em;
	padding: 2px 2px;
	left: 10px;
	top: 5px;
}

.succeeded-endpoint {
	border-color: #7acc7a !important;
}

.failed-endpoint {
	border-color: #cc7a7a !important;
}

.edge-label-succeeded {
	position: relative;
	top: -1em;
	background-color: #7acc7a;
	border-radius: 4px;
	color: #fff;
	line-height: 1em;
	padding: 2px 2px;
}

.edge-label-failed {
	position: relative;
	top: -1em;
	background-color: #cc7a7a;
	border-radius: 4px;
	color: #fff;
	line-height: 1em;
	padding: 2px 2px;
}
</style>
