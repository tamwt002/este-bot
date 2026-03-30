import * as cheerio from "cheerio"
import urlLib from "url"

export function runSeoChecks(html, url, status) {
  const $ = cheerio.load(html)
  const parsedUrl = urlLib.parse(url)

  // -----------------------------
  // TITLE TAGS
  // -----------------------------
  const titles = $("title")
    .map((i, el) => $(el).text().trim())
    .get()

  const primaryTitle = titles[0] || ""

  // -----------------------------
  // META DESCRIPTION
  // -----------------------------
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || ""

  // -----------------------------
  // CANONICAL
  // -----------------------------
  const canonical = $('link[rel="canonical"]').attr("href") || ""

  // -----------------------------
  // ROBOTS META
  // -----------------------------
  const robotsMeta = $('meta[name="robots"]').attr("content") || ""

  // -----------------------------
  // VIEWPORT
  // -----------------------------
  const viewport = $('meta[name="viewport"]').attr("content") || ""

  // -----------------------------
  // HEADINGS
  // -----------------------------
  const h1s = $("h1")
    .map((i, el) => $(el).text().trim())
    .get()

  const headings = []
  $("h1, h2, h3, h4, h5, h6").each((i, el) => {
    headings.push({
      tag: el.tagName.toLowerCase(),
      text: $(el).text().trim()
    })
  })

  // -----------------------------
  // WORD COUNT
  // -----------------------------
  const bodyText = $("body").text().replace(/\s+/g, " ").trim()
  const wordCount = bodyText.split(" ").length

  // -----------------------------
  // IMAGES
  // -----------------------------
  const images = $("img")
  const imagesMissingAlt = images.filter((i, el) => !$(el).attr("alt")).length

  const mixedContent = images
    .map((i, el) => $(el).attr("src"))
    .get()
    .filter(src => src && src.startsWith("http://"))

  // -----------------------------
  // LINKS
  // -----------------------------
  const links = $("a")
  const internalLinks = []
  const externalLinks = []

  links.each((i, el) => {
    const href = $(el).attr("href")
    if (!href || href.startsWith("#")) return

    const isExternal = href.startsWith("http") && !href.includes(parsedUrl.host)

    if (isExternal) externalLinks.push(href)
    else internalLinks.push(href)
  })

  // -----------------------------
  // OPEN GRAPH TAGS
  // -----------------------------
  const og = {
    title: $('meta[property="og:title"]').attr("content") || "",
    description: $('meta[property="og:description"]').attr("content") || "",
    image: $('meta[property="og:image"]').attr("content") || "",
    url: $('meta[property="og:url"]').attr("content") || ""
  }

  // -----------------------------
  // TWITTER CARDS
  // -----------------------------
  const twitter = {
    card: $('meta[name="twitter:card"]').attr("content") || "",
    title: $('meta[name="twitter:title"]').attr("content") || "",
    description: $('meta[name="twitter:description"]').attr("content") || "",
    image: $('meta[name="twitter:image"]').attr("content") || ""
  }

  // -----------------------------
  // STRUCTURED DATA
  // -----------------------------
  const schema = $('script[type="application/ld+json"]')
    .map((i, el) => {
      try {
        return JSON.parse($(el).html())
      } catch {
        return null
      }
    })
    .get()
    .filter(Boolean)

  // -----------------------------
  // SECURITY
  // -----------------------------
  const isHttps = url.startsWith("https://")

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

      canonical: {
        value: canonical,
        selfReferencing: canonical === url,
        mismatch: canonical && canonical !== url
      },

      robots: {
        value: robotsMeta,
        noindex: robotsMeta.includes("noindex"),
        nofollow: robotsMeta.includes("nofollow")
      },

      viewport: {
        value: viewport,
        ok: viewport.includes("width=device-width")
      },

      headings: {
        h1Count: h1s.length,
        h1s,
        all: headings
      },

      content: {
        wordCount,
        thin: wordCount < 300
      },

      images: {
        total: images.length,
        missingAlt: imagesMissingAlt,
        mixedContent
      },

      links: {
        internal: internalLinks,
        external: externalLinks,
        internalCount: internalLinks.length,
        externalCount: externalLinks.length
      },

      openGraph: og,
      twitter,
      schema,

      security: {
        https: isHttps,
        mixedContent: mixedContent.length > 0
      }
    }
  }
}
