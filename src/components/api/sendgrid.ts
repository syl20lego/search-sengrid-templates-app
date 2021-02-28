import axios from "axios"
import { setupCache } from "axios-cache-adapter"

export interface Item {
  id: string
  name: string
}
const cache = setupCache({
  maxAge: 60 * 1000,
})

const api = axios.create({
  adapter: cache.adapter,
})

export const getTemplates = (key: string): Promise<Item[]> =>
  api({
    method: "GET",
    url:
      "https://api.sendgrid.com/v3/templates?page_size=200&generations=dynamic",
    headers: {
      "content-type": "application/octet-stream",
      authorization: `bearer ${key}`,
    },
    params: {
      language_code: "en",
    },
  })
    .then((response: any) => {
      return response.data.result.map(
        ({ id, name }: { id: string; name: string }) => ({ id, name })
      )
    })
    .catch((error: any) => [])
