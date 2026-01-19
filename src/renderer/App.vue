<template>
  <div class="app">
    <header>
      <h1>Dependency Visualizer</h1>
      <p class="subtitle">Import package.json → analyze versions, security & graph</p>
    </header>

    <section class="controls">
      <label class="file-label">
        <span>Select package.json</span>
        <input type="file" accept=".json" @change="onFileSelect" />
      </label>

      <div v-if="selectedFileName" class="file-info">
        Loaded: <strong>{{ selectedFileName }}</strong>
      </div>

      <button
        class="btn"
        :disabled="!raw || loading"
        @click="runAnalysis"
      >
        {{ loading ? 'Analyzing…' : 'Analyze Dependencies' }}
      </button>

      <div v-if="loading" class="progress-wrapper">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        <span>{{ progress }}%</span>
      </div>

      <button
        class="btn secondary"
        :disabled="!analysis"
        @click="exportReport"
      >
        Export Report (JSON)
      </button>
    </section>

    <section v-if="error" class="error">
      {{ error }}
    </section>

    <section v-if="analysis" class="content">
      <h2>Summary</h2>
      <ul class="summary">
        <li>Total: {{ analysis.deps.length }}</li>
        <li>Outdated: {{ outdatedCount }}</li>
        <li>Deprecated: {{ deprecatedCount }}</li>
      </ul>

      <h2>Graph</h2>
      <DependencyGraph :analysis="analysis" />

      <h2>Details</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Package</th>
              <th>Requested</th>
              <th>Latest</th>
              <th>Outdated?</th>
              <th>Security</th>
              <th>Note</th>
              <th>GitHub</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dep in analysis.deps" :key="dep.type + dep.name">
              <td>{{ dep.type }}</td>
              <td>{{ dep.name }}</td>
              <td>{{ dep.requested }}</td>
              <td>{{ dep.latest ?? '-' }}</td>
              <td>
                <span
                  :class="['tag', dep.isOutdated ? 'tag-outdated' : 'tag-ok']"
                >
                  {{ dep.isOutdated === undefined ? 'n/a' : dep.isOutdated ? 'Yes' : 'No' }}
                </span>
              </td>
              <td>
                <span
                  :class="[
                    'tag',
                    dep.securityFlag === 'deprecated'
                      ? 'tag-danger'
                      : dep.securityFlag === 'warning'
                      ? 'tag-warning'
                      : 'tag-ok'
                  ]"
                >
                  {{ dep.securityFlag }}
                </span>
              </td>
              <td>{{ dep.note ?? '' }}</td>
              <td>
                <a
                  v-if="dep.githubUrl"
                  :href="dep.githubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="github-link"
                >
                  Repo
                </a>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import DependencyGraph from './components/DependencyGraph.vue'
import type { RawDeps, AnalysisResult } from '../shared/types'
import { parsePackageJsonText, analyzeDependencies } from '../analyzer/dependencyAnalyzer'

const raw = ref<RawDeps | null>(null)
const analysis = ref<AnalysisResult | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selectedFileName = ref<string | null>(null)
const progress = ref<number>(0)

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  selectedFileName.value = file.name
  const reader = new FileReader()

  reader.onload = (evt) => {
    try {
      const text = evt.target?.result as string
      raw.value = parsePackageJsonText(text)
      analysis.value = null
      error.value = null
    } catch (err: any) {
      error.value = 'Failed to parse package.json: ' + err?.message
    }
  }

  reader.readAsText(file)
}

async function runAnalysis() {
  if (!raw.value) return
  loading.value = true
  error.value = null
  progress.value = 0

  try {
    analysis.value = await analyzeDependencies(raw.value, (done, total) => {
      progress.value = Math.round((done / total) * 100)
    })
  } catch (err: any) {
    error.value = 'Analysis failed: ' + err?.message
  } finally {
    loading.value = false
  }
}

const outdatedCount = computed(
  () => analysis.value?.deps.filter((d) => d.isOutdated).length ?? 0
)

const deprecatedCount = computed(
  () => analysis.value?.deps.filter((d) => d.securityFlag === 'deprecated').length ?? 0
)

function exportReport() {
  if (!analysis.value) return

  const blob = new Blob([JSON.stringify(analysis.value, null, 2)], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dependency-report.json'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.app {
  padding: 20px 32px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

header h1 {
  margin: 0;
  font-size: 28px;
}

.subtitle {
  margin-top: 4px;
  color: #666;
}

.controls {
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.file-label {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 6px;
  background: #e0e7ff;
  cursor: pointer;
  font-size: 14px;
}

.file-label input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.file-info {
  font-size: 14px;
  color: #444;
}

.progress-wrapper {
  width: 200px;
  height: 14px;
  border-radius: 6px;
  background: #e5e7eb;
  overflow: hidden;
  position: relative;
  margin-left: 8px;
  display: flex;
  align-items: center;
  font-size: 12px;
}

.progress-bar {
  height: 14px;
  background: #4f46e5;
  transition: width 0.15s ease;
}

.progress-wrapper span {
  margin-left: 6px;
  white-space: nowrap;
}

.github-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.github-link:hover {
  text-decoration: underline;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  background: #4f46e5;
  color: #fff;
}

.btn.secondary {
  background: #64748b;
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.error {
  color: #b91c1c;
  background: #fee2e2;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.content {
  margin-top: 12px;
}

.summary {
  display: flex;
  gap: 16px;
  padding-left: 16px;
}

.table-wrapper {
  margin-top: 8px;
  max-height: 320px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th,
td {
  padding: 6px 8px;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 1;
}

.tag {
  display: inline-flex;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 11px;
}

.tag-ok {
  background: #dcfce7;
  color: #166534;
}

.tag-outdated {
  background: #fee2e2;
  color: #b91c1c;
}

.tag-danger {
  background: #fecaca;
  color: #b91c1c;
}

.tag-warning {
  background: #fef3c7;
  color: #92400e;
}
</style>
