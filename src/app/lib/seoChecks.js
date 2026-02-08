import * as cheerio from "cheerio"

export function runSeoChecks(html, url, status) {
  const $ = cheerio.load(html)

  // ---- TITLE TAGS ----
  const titles = $("title")
    .map((i, el) => $(el).text().trim())
    .get()

  const primaryTitle = titles[0] || ""

  // ---- META DESCRIPTION ----
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || ""

  // ---- HEADINGS ----
  const h1s = $("h1")
    .map((i, el) => $(el).text().trim())
    .get()

  // ---- IMAGES ----
  const images = $("img")
  const imagesMissingAlt = images.filter(
    (i, el) => !$(el).attr("alt")
  ).length

  return {
    url,
    status,
    onPage: {
      title: {
        value: primaryTitle,
        length: primaryTitle.length,
        count: titles.length,
        all: titles,
        ok:
          titles.length === 1 &&
          primaryTitle.length >= 30 &&
          primaryTitle.length <= 60
      },

      metaDescription: {
        value: metaDescription,
        length: metaDescription.length,
        ok:
          metaDescription.length >= 120 &&
          metaDescription.length <= 160
      },

      headings: {
        h1Count: h1s.length,
        h1s
      },

      images: {
        total: images.length,
        missingAlt: imagesMissingAlt
      }
    }
  }
}
