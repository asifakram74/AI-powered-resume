import type { Meta, StoryObj } from "@storybook/react"
import { Autocomplete } from "../components/Autocomplete"
import React from "react"

const meta: Meta<typeof Autocomplete> = {
  title: "Components/Autocomplete",
  component: Autocomplete,
}

export default meta
type Story = StoryObj<typeof Autocomplete>

const mockFetcher = async (q: string) => {
  return ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"]
    .filter(x => x.toLowerCase().includes(q.toLowerCase()))
    .map((name, i) => ({ id: String(i), name }))
}

export const Empty: Story = {
  args: {
    ariaLabel: "mock",
    placeholder: "Search",
    minChars: 2,
    fetchOptions: async () => [],
    onSelect: () => {},
    sessionKey: "story-empty"
  },
}

export const Loading: Story = {
  args: {
    ariaLabel: "mock",
    placeholder: "Search",
    minChars: 2,
    fetchOptions: async (q: string) => {
      await new Promise(r => setTimeout(r, 800))
      return mockFetcher(q)
    },
    onSelect: () => {},
    sessionKey: "story-loading"
  },
}

export const Error: Story = {
  args: {
    ariaLabel: "mock",
    placeholder: "Search",
    minChars: 2,
    fetchOptions: async () => {
      throw new Error("Network error")
    },
    onSelect: () => {},
    sessionKey: "story-error"
  },
}

export const Success: Story = {
  args: {
    ariaLabel: "mock",
    placeholder: "Search",
    minChars: 2,
    fetchOptions: mockFetcher,
    onSelect: () => {},
    sessionKey: "story-success"
  },
}
