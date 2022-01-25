<template>
	<svg class="dragonfly-edges-layer" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<marker id="arrow" viewBox="0 0 6 6" markerHeight="18" markerUnits="userSpaceOnUse" markerwidth="18"
				orient="auto" overflow="visible" refX="18" refY="9">
				<path class="arrow" d="M 0,0 L 0,18 L 18,9 Z"/>
			</marker>
			<marker id="anchor" :viewBox="`0 0 6 6`" markerHeight="18" markerUnits="userSpaceOnUse" markerwidth="18" overflow="visible" refX="9" refY="9">
				<path class="anchor" d="M 0,0 L 0,18 L 18,18 L 18,0 Z"/>
			</marker>
		</defs>
		
		<template v-for="edge in edges" :key="edge.id">
			<dragonfly-edge v-if="isVisible(edge)" :edge="edge"
				:selected="selected[edge.id]"
				:source-endpoint="endpointPositions[edge.sourceEndpoint]"
				:source-node="positions[edge.source]"
				:target-endpoint="endpointPositions[edge.targetEndpoint]"
				:target-node="positions[edge.target]">
				
				<div class="edge-label-succeeded">{{ edge.label }}</div>
			</dragonfly-edge>
		</template>
		<template v-if="props.linking">
			<l-broken-line v-model:definition="definition" :position="{source: linkingSource, target: linkingTarget}"></l-broken-line>
			<path :d="definition" class="edge linking"/>
		</template>
	</svg>
</template>

<script setup>
import DragonflyEdge from "./DragonflyEdge.vue";
import LBrokenLine from "./LBrokenLine.vue";
import {inject, ref} from "vue";

const definition = ref('')
const props = defineProps(['positions', 'endpointPositions', 'linking', 'linkingSource', 'linkingTarget', 'edges'])
const selected = inject('selected')

const isVisible = edge => {
	const sourceReady = props.positions[edge.source]
	const targetReady = props.positions[edge.target]
	const sourceEndpointReady = !edge.sourceEndpoint || props.endpointPositions[edge.sourceEndpoint]
	const targetEndpointReady = !edge.targetEndpoint || props.endpointPositions[edge.targetEndpoint]
	return sourceReady && targetReady && sourceEndpointReady && targetEndpointReady
};
</script>

<style lang="less" scoped>
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