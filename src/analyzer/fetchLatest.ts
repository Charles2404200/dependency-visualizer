import axios from "axios"

export async function fetchLatest(pkg: string) {
  const url = `https://registry.npmjs.org/${pkg}`
  const res = await axios.get(url)
  return res.data["dist-tags"]?.latest
}
