<template>
    <div class="dragonfly-endpoints" :class="orientation">
	    <dragonfly-endpoint :endpoint="{ id:`${ id }-${ orientation }` }" class="succeeded-endpoint"/>
    </div>
</template>

<script>
import DragonflyEndpoint from "./DragonflyEndpoint.vue";

const orientationVectors = {
    left: [0, 0],
    right: [1, 0],
    top: [0, 0],
    bottom: [0, 1],
}

export default {
    name: "DragonflyEndpoints",
    components: {DragonflyEndpoint},
    props: ['id','orientation'],
    provide() {
        return {
            getPosition: this.getPosition,
            orientation: this.orientation,
        }
    },
    methods: {
        getPosition() {
            const width = this.$el.parentNode.clientWidth
            const height = this.$el.parentNode.clientHeight
            const vector = orientationVectors[this.orientation]
            return { left: width * vector[0], top: height * vector[1] }
        }
    }
}
</script>

<style lang="less" scoped>
.succeeded-endpoint {
	border-color: #7acc7a !important;
}
</style>