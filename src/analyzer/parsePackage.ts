import fs from 'fs'
import path from 'path'

export async function parsePackageJson(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(content)

  return {
    dependencies: json.dependencies || {},
    devDependencies: json.devDependencies || {}
  }
}
