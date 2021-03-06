interface Response {
  result: Item[];
  _metadata: {
    next?: string;
  };
}

export interface Item {
  id: string;
  name: string;
}

const getPage = (key: string, next?: string): Promise<Response> =>
  fetch(
    next
      ? next
      : "https://api.sendgrid.com/v3/templates?page_size=200&generations=dynamic",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/octet-stream",
        authorization: `bearer ${key}`,
      },
      keepalive: true
    }
  )
    .then((resp) => resp.json())
    .catch((error: any) => ({ result: [], _metadata: {} }));

async function* getPaginatedTemplates(key: string) {
  let next = undefined;
  do {
    const response: Response = await getPage(key, next);
    yield response.result;
    next = response._metadata.next;
  } while (next);
}

export const getTemplates = async (key: string) => {
  let results: Item[] = [];
  for await (const items of getPaginatedTemplates(key)) {
    results = results.concat(items);
  }
  return results;
};
