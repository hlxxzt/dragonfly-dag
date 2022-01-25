<template>
	<div class="dragonfly-grid">
		<svg xmlns="http://www.w3.org/2000/svg">
			<defs>
				<pattern id="grid-pattern" :width="scaledSize" :height="scaledSize" patternUnits="userSpaceOnUse">
					<template v-for="x in 4">
						<rect v-for="y in 4" :x="left + (x - 1) * halfSize" :y="top + (y - 1) * halfSize" :width="halfSize"
							:height="halfSize" stroke="none" stroke-width="0" :fill="(x % 2) - (y % 2) ? '#fff' : '#eee'"/>
					</template>
				</pattern>
			</defs>
			<rect fill="url(#grid-pattern)" width="100%" height="100%"/>
		</svg>
	</div>
</template>

<script>

export default {
	name: "DragonflyGrid",
	props: ['offsetX', 'offsetY', 'size', 'maxScale', 'minScale'],
	inject: ['scale'],
	computed: {
		halfSize() {
			return this.size / 2
		},
		scaledSize() {
			let scale = this.scale
			if (scale >= this.maxScale) {
				do {
					scale /= this.maxScale
				} while (scale >= this.maxScale)
			}
			if (scale <= this.minScale) {
				do {
					scale /= this.minScale
				} while (scale <= this.minScale)
			}
			return this.size * scale
		},
		top() {
			return (this.offsetY % this.scaledSize - this.scaledSize) % this.scaledSize
		},
		left() {
			return (this.offsetX % this.scaledSize - this.scaledSize) % this.scaledSize
		},
		bottom() {
			return this.top + this.scaledSize
		},
		right() {
			return this.left + this.scaledSize
		}
	}
}
</script>
