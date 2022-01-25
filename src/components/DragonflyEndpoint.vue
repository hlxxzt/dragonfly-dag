<template>
	<div class="dragonfly-endpoint" :class="{targeted}"
		@mousedown.stop="onMouseDown" draggable="true" @dragstart="onDragStart" @drag.passive="onDrag" @dragend.prevent="onDragEnd">
	</div>
</template>

<script>
import img from "./emptyDragImage";
import {calcShortestDistance} from "./utils";

export default {
	name: "DragonflyEndpoint",
	props: {
		endpoint: {type: Object, required: true},
		group: {type: [String, Object]},
		label: {type: String},
		labelClass: {type: String}
	},
	inject: [
		'node',
		'endpointReposition',
		'nodePosition',
		'getPosition',
		'startNodeLinking',
		'nodeLinking',
		'stopNodeLinking',
		'link',
		'orientation',
		'linkSource',
		'select',
		'readOnly',
		'positions'
	],
	data() {
		return {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			targeted: false,
			curTarget: undefined
		}
	},
	computed: {
		linkableOut() {
			return !this.readOnly && this.groupLinkOut(this.node, this.endpoint)
		},
		combinedGroup() {
			return this.endpoint.group ?? this.group ?? true
		},
		groupName() {
			if (typeof this.combinedGroup === 'string') {
				return this.combinedGroup
			} else {
				return this.combinedGroup?.name
			}
		},
		groupLinkOut() {
			let {linkOut} = this.combinedGroup ?? {}
			if (linkOut === false) {
				return () => false
			} else if (linkOut instanceof Function) {
				return linkOut
			} else {
				return () => true
			}
		},
		position() {
			const x = this.x + (this.nodePosition?.x ?? 0)
			const y = this.y + (this.nodePosition?.y ?? 0)
			return {width: this.width, height: this.height, left: x, top: y, orientation: this.orientation, x, y}
		},
	},
	methods: {
		onMouseDown() {
			this.select()
		},
		onDragStart(event) {
			if (this.linkableOut) {
				event.dataTransfer.setDragImage(img, 0, 0)  // hacking: 用空svg图片隐藏DragImage
				this.startNodeLinking({
					source: this.node.id,
					sourceEndpoint: this.endpoint.id,
					sourceGroup: this.groupName
				})
				document.addEventListener("dragover", event => event.preventDefault(), false)    // hacking: 避免最后一次事件的坐标回到0,0
			} else {
				event.stopPropagation()
				event.preventDefault()
			}
		},
		onDrag(event) {
			if (!event.screenX && !event.screenY) return    // hacking: 防止拖出窗口位置被置为(0,0)
			const pos = this.position
			const deep = JSON.parse(JSON.stringify(this.positions))
			delete deep[this.node.id]
			const short = calcShortestDistance({x: event.offsetX + pos.left, y: event.offsetY + pos.top}, deep)
			if (short.id && short.distance < 25) {
				this.nodeLinking(pos.x, pos.y, this.width, this.height, this.orientation, short.x, short.y, 0, 0, short.orientation)
				this.curTarget = short
			} else {
				this.nodeLinking(pos.x, pos.y, this.width, this.height, this.orientation, event.offsetX + pos.x, event.offsetY + pos.y)
				this.curTarget = undefined
			}
		},
		onDragEnd() {
			document.removeEventListener('dragover', event => event.preventDefault())
			if (this.curTarget) {
				this.link(this.curTarget.id, `${this.curTarget.id}-${this.curTarget.orientation}`)
				this.curTarget = undefined
			}
			this.stopNodeLinking()
		}
	},
	mounted() {
		this.width = this.$el.offsetWidth
		this.height = this.$el.offsetHeight
		const position = this.getPosition()
		// 锚点左上角相对节点左上角的偏移
		this.x = position.left + this.$el.offsetLeft
		this.y = position.top + this.$el.offsetTop
		this.endpointReposition(this.endpoint.id, this.x, this.y, this.width, this.height, this.orientation)
	}
}
</script>
