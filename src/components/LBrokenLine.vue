<script>
const offset = 20
const vectors = {
	left: [0, 0.5, -1, 0],
	right: [1, 0.5, 1, 0],
	top: [0.5, 0, 0, -1],
	bottom: [0.5, 1, 0, 1]
}

export default {
	name: "LBrokenLine",
	props: ['position', 'definition'],
	emits: ['update:definition'],
	computed: {
		start() {
			let {x, y, width, height, orientation = 'right'} = this.position.source
			const vector = vectors[orientation]
			x += vector[0] * width
			y += vector[1] * height
			return {x, y}
		},
		startPoint() {
			return this.stringifyPoint(this.start)
		},
		end() {
			let {x, y, width, height, orientation = 'left'} = this.position.target
			const vector = vectors[orientation]
			x += vector[0] * width
			y += vector[1] * height
			return {x, y}
		},
		endPoint() {
			return this.stringifyPoint(this.end)
		},
		zig() {
			let {x, y, width, height, orientation = 'right'} = this.position.source
			const vector = vectors[orientation]
			x += vector[0] * width + vector[2] * offset
			y += vector[1] * height + vector[3] * offset
			return {x, y}
		},
		zag() {
			let {x, y, width, height, orientation = 'left'} = this.position.target
			const vector = vectors[orientation]
			x += vector[0] * width + vector[2] * offset
			y += vector[1] * height + vector[3] * offset
			return {x, y}
		},
		center() {
			return {
				x: (this.zig.x + this.zag.x) / 2,
				y: (this.zig.y + this.zag.y) / 2,
			}
		},
		smartPathPoints() {
			const zig = this.zig
			const zag = this.zag
			const center = this.center
			
			const field = [
				[
					{x: zig.x, y: zig.y},
					{x: center.x, y: zig.y},
					{x: zag.x, y: zig.y}],
				[
					{x: zig.x, y: center.y},
					{x: center.x, y: center.y},
					{x: zag.x, y: center.y}
				],
				[
					{x: zig.x, y: zag.y},
					{x: center.x, y: zag.y},
					{x: zag.x, y: zag.y}
				],
			]
			//  source
			let point1 = [0, 0, this.position.source.orientation ?? 'right']
			//  target
			let point2 = [2, 2, this.position.target.orientation ?? 'left']
			
			
			let path = [null, null, null, null]
			path[0] = field[point1[1]][point1[0]]
			path[3] = field[point2[1]][point2[0]]
			
			switch (point1[2]) {
				case 'left':
					point1 = zig.x < center.x ? [0, 1, zig.y <= center.y ? 'bottom' : 'top'] : [1, 0, 'left']
					break
				case 'right':
					point1 = zig.x < center.x ? [1, 0, 'right'] : [0, 1, zig.y <= center.y ? 'bottom' : 'top']
					break
				case 'top':
					point1 = zig.y < center.y ? [1, 0, zig.x <= center.x ? 'right' : 'left'] : [0, 1, 'top']
					break
				case 'bottom':
					point1 = zig.y < center.y ? [0, 1, 'bottom'] : [1, 0, zig.x <= center.x ? 'right' : 'left']
					break
			}
			path[1] = field[point1[1]][point1[0]]
			
			switch (point2[2]) {
				case 'left':
					point2 = zag.x < center.x ? [2, 1, zag.y <= center.y ? 'bottom' : 'top'] : [1, 2, 'left']
					break
				case 'right':
					point2 = zag.x < center.x ? [1, 2, 'right'] : [2, 1, zag.y <= center.y ? 'bottom' : 'top']
					break
				case 'top':
					point2 = zag.y < center.y ? [1, 2, zag.x <= center.x ? 'right' : 'left'] : [2, 1, 'top']
					break
				case 'bottom':
					point2 = zag.y < center.y ? [2, 1, 'bottom'] : [1, 2, zag.x <= center.x ? 'right' : 'left']
					break
			}
			path[2] = field[point2[1]][point2[0]]
			
			if (point1[0] !== point2[0] && point1[1] !== point2[1]) {
				switch (point1[2]) {
					case 'left':
					case 'right':
						point1 = [point1[0] + 1, point1[1], 'right']
						break
					case 'top':
					case 'bottom':
						point1 = [point1[0], point1[1] + 1, 'bottom']
						break
				}
				path = [path[0], field[point1[1]][point1[0]], path[3]]
			}
			return path
		},
		smartPath() {
			return this.smartPathPoints.map(({x, y}) => `${x},${y}`).join(' L ')
		}
	},
	mounted() {
		this.$emit('update:definition', this.getDefinition())
	},
	watch: {
		position: {
			deep: true,
			handler() {
				this.$emit('update:definition', this.getDefinition())
			}
		}
	},
	methods: {
		getDefinition() {
			return `M ${this.startPoint} L ${this.smartPath} L ${this.endPoint}`
		},
		stringifyPoint({x, y}) {
			return `${x},${y}`
		}
	},
	render() {
	}
}
</script>

<style scoped>

</style>
