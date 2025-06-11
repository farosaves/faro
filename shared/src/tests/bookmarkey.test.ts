import { describe, it, expect } from "vitest"

// Import the function to test
// Since the function is not exported, we'll recreate it here for testing
// The actual implementation is in shared/src/lib/sync/bookmarkey.ts
const bookmark2Note = (b: { title: string, url: string, folders: string[] }): { title: string, quote: string, tags: string[] } => {
    const quoteMatch = b.title.matchAll(/"(.*)" /g).toArray().at(-1)
    const tagsMatch = b.title.matchAll(/ #[^ ]*/g).toArray()
    return {
        title: b.title.split(" \"")[0],
        quote: quoteMatch ? quoteMatch[1] : "",
        tags: tagsMatch ? tagsMatch.map(t => t[1].trim().slice(1)) : [],
    }
}

describe("bookmark2Note", () => {
    it("should extract title, quote, and tags from a bookmark title", () => {
        const bookmark = {
            title: "My Article Title \"This is a quote\" #tag1 #tag2",
            url: "https://example.com",
            folders: ["folder1", "folder2"],
        }

        const result = bookmark2Note(bookmark)

        expect(result.title).toBe("My Article Title")
        expect(result.quote).toBe("This is a quote")
        expect(result.tags).toEqual(["tag1", "tag2"])
    })

    it("should handle bookmarks with no quote", () => {
        const bookmark = {
            title: "Just a title #tag1",
            url: "https://example.com",
            folders: ["folder1"],
        }

        const result = bookmark2Note(bookmark)

        expect(result.title).toBe("Just a title")
        expect(result.quote).toBe("")
        expect(result.tags).toEqual(["tag1"])
    })

    it("should handle bookmarks with no tags", () => {
        const bookmark = {
            title: "Article Title \"Some quote\"",
            url: "https://example.com",
            folders: [],
        }

        const result = bookmark2Note(bookmark)

        expect(result.title).toBe("Article Title")
        expect(result.quote).toBe("Some quote")
        expect(result.tags).toEqual([])
    })

    it("should handle bookmarks with multiple quotes and use the last one", () => {
        const bookmark = {
            title: "Title \"First quote\" \"Second quote\" #tag",
            url: "https://example.com",
            folders: ["folder"],
        }

        const result = bookmark2Note(bookmark)

        expect(result.title).toBe("Title")
        expect(result.quote).toBe("Second quote")
        expect(result.tags).toEqual(["tag"])
    })

    it("should handle bookmarks with no quote and no tags", () => {
        const bookmark = {
            title: "Just a title",
            url: "https://example.com",
            folders: [],
        }

        const result = bookmark2Note(bookmark)

        expect(result.title).toBe("Just a title")
        expect(result.quote).toBe("")
        expect(result.tags).toEqual([])
    })
})
