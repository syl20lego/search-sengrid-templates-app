import React, { useState, useEffect, useCallback } from "react"
import {
  Autocomplete,
  Note,
  HelpText,
  Heading,
} from "@contentful/forma-36-react-components"
import { FieldExtensionSDK } from "@contentful/app-sdk"
import { Item, getTemplates } from "../api/sendgrid"

interface FieldProps {
  sdk: FieldExtensionSDK
}
interface Parameters {
  apikey?: string
}

const Field = (props: FieldProps) => {
  const { sdk } = props
  const { apikey }: Parameters = sdk.parameters.installation

  // If you only want to extend Contentful's default editing experience
  // reuse Contentful's editor components
  // -> https://www.contentful.com/developers/docs/extensibility/field-editors/

  const [current, setCurrent] = useState<Item>({
    id: sdk.field.getValue(),
    name: "",
  })
  const [templates, setTemplates] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>(templates)

  useEffect(() => {
    const fetchData = async () => {
      if (apikey) {
        const templates = await getTemplates(apikey)
        setTemplates(templates)
        setFilteredItems(templates)
      }
    }
    fetchData()
  }, [apikey])

  const handleQueryChange = useCallback(
    (query: string) => {
      const matches = query
        ? templates.filter(
            (item) => {
              const keywords = query.split(" ").filter((keyword) => keyword)
              const expression = new RegExp(keywords.join(".*"), "ig")
              const matches = item.name.match(expression) || []
              return matches.length
            }
            // item.name.toLowerCase().includes(query.toLowerCase())
          )
        : templates
      setFilteredItems(matches)
    },
    [setFilteredItems, templates]
  )

  return (
    <>
      <Autocomplete<Item>
        maxHeight={90}
        onQueryChange={handleQueryChange}
        items={filteredItems}
        // onChange={()=>{}}
        onChange={({ id, name }) => {
          sdk.field.setValue(id)
          setCurrent({ id, name })
        }}
        isLoading={templates.length === 0}
      >
        {(options: Item[]) =>
          options.map((option: Item) => (
            <span key={option.id}>{option.name}</span>
          ))
        }
      </Autocomplete>

      <Note noteType="positive">
        <HelpText>
          {templates.filter(({ id }) => id === sdk.field.getValue())[0]?.name}
        </HelpText>
        <Heading>{current.id}</Heading>
      </Note>
    </>
  )
}

export default Field
