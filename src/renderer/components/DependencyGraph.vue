<template>
  <div ref="containerRef" class="graph-container"></div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Network } from 'vis-network/standalone'
import type { AnalysisResult, GraphNode, GraphEdge } from '../../shared/types'

const props = defineProps<{
  analysis: AnalysisResult | null
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let network: Network | null = null

function buildGraphData(analysis: AnalysisResult) {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  // root node
  nodes.push({
    id: 'project',
    label: 'project',
    color: '#4CAF50'
  })

  for (const dep of analysis.deps) {
    const color =
      dep.securityFlag === 'deprecated'
        ? '#f44336'
        : dep.isOutdated
          ? '#ff9800'
          : '#2196f3'

    nodes.push({
      id: dep.name,
      label: `${dep.name}\n${dep.requested} → ${dep.latest ?? '?'}`,
      color
    })

    edges.push({
      from: 'project',
      to: dep.name
    })
  }

  return { nodes, edges }
}

onMounted(() => {
  if (!containerRef.value || !props.analysis) return

  const { nodes, edges } = buildGraphData(props.analysis)

  network = new Network(
    containerRef.value,
    { nodes, edges },
    {
      nodes: {
        shape: 'box',
        font: { face: 'monospace', size: 12 }
      },
      edges: {
        arrows: { to: true }
      },
      physics: {
        enabled: true,
        stabilization: { iterations: 150 }
      }
    }
  )
})

watch(
  () => props.analysis,
  (val) => {
    if (!containerRef.value || !val) return
    const { nodes, edges } = buildGraphData(val)

    if (!network) {
      network = new Network(containerRef.value, { nodes, edges }, {})
    } else {
      network.setData({ nodes, edges })
    }
  }
)

onBeforeUnmount(() => {
  if (network) {
    network.destroy()
    network = null
  }
})
</script>

<style scoped>
.graph-container {
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
