import axios from "axios"
import { setupCache } from "axios-cache-adapter"

interface Response {
  result: Item[]
  _metadata: {
    next?: string
  }
}

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

const getPage= (key: string, next?: string): Promise<Response> =>
  api({
    method: "GET",
    url: next? next: "https://api.sendgrid.com/v3/templates?page_size=200&generations=dynamic",
    headers: {
      "content-type": "application/octet-stream",
      authorization: `bearer ${key}`,
    },
    params: {
      language_code: "en",
    },
  })
    .then((response: any) => {
      return response.data as Response
    })
    .catch((error: any) => ({ result: [], _metadata:{}}))

async function *getPaginatedTemplates(key: string) {
      let res
      let next = undefined
      do {
        res = await getPage(key, next)
        for (const result of res.result) {
          yield result
        }
        next = res._metadata.next
      } while (next)
    }

export const getTemplates = async (key: string) => {
  let results:Item[] = []
  for await (const items of getPaginatedTemplates(key)) {
    results = results.concat(items)
  }
  return results
}