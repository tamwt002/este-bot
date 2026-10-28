import * as cheerio from "cheerio"
import { finding, summarize, sortFindings, detectStack } from "./findings"

const VAGUE_LINK_TEXT = new Set([
  "click here", "here", "read more", "more", "learn more", "link", "this", "click", "details", "go"
])
const NON_LABELLED_INPUT_TYPES = new Set(["hidden", "submit", "button", "reset", "image"])
const FOCUSABLE = "a[href], button, input:not([type=hidden]), select, textarea, [tabindex]"

/**
 * Static accessibility checks on the HTML the server sends.
 * Colour contrast and keyboard behaviour need a rendered page, so they're
 * reported as things to check manually.
 */
export function runA11yChecks(html, url, status) {
  const $ = cheerio.load(html)
  const parsedUrl = new URL(url)

  // Text-only copy for the "is this an empty JS shell?" test.
  const $text = cheerio.load(html)
  $text("script, style, noscript, template, svg").remove()
  const bodyText = $text("body").text().replace(/\s+/g, " ").trim()
  const wordCount = bodyText ? bodyText.split(" ").length : 0
  const emptyMount = ["#root", "#app", "#__next", "#__nuxt", "#svelte"].some(
    sel => $(sel).length > 0 && $(sel).text().trim() === "" && $(sel).children().length === 0
  )
  const isEmptyShell = wordCount < 50 && (emptyMount || $('script[type="module"]').length > 0)

  const snippet = el => {
    const out = $.html(el).replace(/\s+/g, " ").trim()
    return out.length > 140 ? `${out.slice(0, 137)}…` : out
  }
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`

  // Accessible name: aria-label, aria-labelledby, text, img alt, svg title, title.
  const idText = id => $(`[id="${id.replace(/"/g, "")}"]`).first().text().trim()
  const accessibleName = el => {
    const $el = $(el)
    const ariaLabel = ($el.attr("aria-label") || "").trim()
    if (ariaLabel) return ariaLabel
    const labelledBy = ($el.attr("aria-labelledby") || "").trim()
    if (labelledBy) {
      const t = labelledBy.split(/\s+/).map(idText).join(" ").trim()
      if (t) return t
    }
    const $clone = $el.clone()
    $clone.find('[aria-hidden="true"]').remove()
    const text = $clone.text().replace(/\s+/g, " ").trim()
    if (text) return text
    const alt = $el.find("img[alt]").map((i, img) => $(img).attr("alt").trim()).get().join(" ").trim()
    if (alt) return alt
    const svgTitle = $el.find("svg title").first().text().trim()
    if (svgTitle) return svgTitle
    if ($el.is("input")) {
      const value = ($el.attr("value") || "").trim()
      if (value) return value
    }
    return ($el.attr("title") || "").trim()
  }

  // -----------------------------
  // GATHER
  // -----------------------------
  const lang = ($("html").attr("lang") || "").trim()
  const pageTitle = $("title").first().text().trim()
  const viewport = $('meta[name="viewport"]').attr("content") || ""
  const maxScale = Number(viewport.match(/maximum-scale\s*=\s*([\d.]+)/i)?.[1] || 10)
  const zoomDisabled = /user-scalable\s*=\s*(no|0)\b/i.test(viewport) || maxScale < 2

  const imagesNoAlt = $("img").filter((i, el) => $(el).attr("alt") === undefined && $(el).attr("role") !== "presentation").get()

  const labelFor = new Set($("label[for]").map((i, el) => $(el).attr("for")).get())
  const unlabelledInputs = $("input, select, textarea")
    .filter((i, el) => {
      const $el = $(el)
      if ($el.is("input") && NON_LABELLED_INPUT_TYPES.has(($el.attr("type") || "text").toLowerCase())) return false
      const id = $el.attr("id")
      return !(
        (id && labelFor.has(id)) ||
        $el.closest("label").length > 0 ||
        ($el.attr("aria-label") || "").trim() ||
        ($el.attr("aria-labelledby") || "").trim() ||
        ($el.attr("title") || "").trim()
      )
    })
    .get()
  const placeholderOnly = unlabelledInputs.filter(el => ($(el).attr("placeholder") || "").trim()).length

  const namelessButtons = $('button, [role="button"], input[type="submit"], input[type="button"]')
    .filter((i, el) => !accessibleName(el))
    .get()

  const links = $("a[href]").get()
  const namelessLinks = links.filter(el => !accessibleName(el))
  const vagueLinks = links.filter(el => VAGUE_LINK_TEXT.has(accessibleName(el).toLowerCase().replace(/[.!…→›»\s]+$/g, "")))

  const clickableNonInteractive = $("div[onclick], span[onclick], li[onclick], img[onclick], p[onclick]").get()
  const fakeButtons = $('div[role="button"], span[role="button"], div[role="link"], span[role="link"]')
    .filter((i, el) => $(el).attr("tabindex") === undefined)
    .get()

  const headings = $("h1, h2, h3, h4, h5, h6")
    .map((i, el) => Number(el.tagName.slice(1)))
    .get()
  const h1Count = headings.filter(l => l === 1).length
  const skippedLevels = []
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) skippedLevels.push(`H${headings[i - 1]} → H${headings[i]}`)
  }

  const untitledIframes = $("iframe").filter((i, el) => !($(el).attr("title") || "").trim() && $(el).attr("aria-hidden") !== "true").get()
  const positiveTabindex = $("[tabindex]").filter((i, el) => Number($(el).attr("tabindex")) > 0).get()
  const hiddenFocusable = $('[aria-hidden="true"]')
    .filter((i, el) => $(el).is(FOCUSABLE) || $(el).find(FOCUSABLE).filter((j, f) => $(f).attr("tabindex") !== "-1").length > 0)
    .get()

  const autoplayAudio = $("audio[autoplay], video[autoplay]").filter((i, el) => $(el).attr("muted") === undefined).get()

  const hasMain = $('main, [role="main"]').length > 0

  const ids = $("[id]").map((i, el) => $(el).attr("id")).get()
  const seen = new Set()
  const duplicateIds = [...new Set(ids.filter(id => (seen.has(id) ? true : (seen.add(id), false))))]

  // Focus outlines removed without a replacement (inline <style> or Tailwind classes).
  const styles = $("style").map((i, el) => $(el).html()).get().join("\n")
  const cssKillsFocus = /:focus[^{]*\{[^}]*outline\s*:\s*(none|0)\b/i.test(styles) ||
    /(^|[,{}\s])\*\s*\{[^}]*outline\s*:\s*(none|0)\b/i.test(styles)
  const twNoOutline = $('[class*="outline-none"]')
    .filter((i, el) => {
      const cls = $(el).attr("class") || ""
      return !/(focus|focus-visible):(ring|outline|border|shadow|bg|underline)/.test(cls)
    })
    .get()

  // -----------------------------
  // FINDINGS
  // -----------------------------
  const findings = []
  const passed = []
  const check = (ok, passLabel, f) => (ok ? passed.push(passLabel) : findings.push(f()))

  check(!zoomDisabled, "Pinch-to-zoom is allowed", () =>
    finding("zoom-disabled", "high", "Zooming is turned off",
      "Your viewport tag stops people pinching to zoom. Anyone with low vision who needs bigger text is stuck. AI builders often add this to make apps feel 'native'.",
      'Change the viewport meta tag to <meta name="viewport" content="width=device-width, initial-scale=1"> and remove user-scalable=no and maximum-scale.',
      viewport))

  check(!!lang, "Page language is declared", () =>
    finding("lang", "high", "Page language isn't set",
      "Without <html lang>, screen readers guess the language and can read your whole site in the wrong accent or pronunciation.",
      'Add a lang attribute to the <html> tag, e.g. <html lang="en">.'))

  check(!!pageTitle, "Page has a title", () =>
    finding("title", "medium", "Page has no title",
      "The <title> is the first thing a screen reader announces and how people tell browser tabs apart.",
      "Give every page a unique, descriptive <title>."))

  if (!isEmptyShell) {
    check(unlabelledInputs.length === 0, "Form fields have labels", () =>
      finding("input-labels", "high", `${plural(unlabelledInputs.length, "form field")} without a label`,
        `Screen reader users hear "edit text" with no idea what to type.${placeholderOnly ? ` ${placeholderOnly} of them rely on placeholder text, which disappears as soon as you type and isn't a proper label.` : ""}`,
        "Give every input, select and textarea a visible <label> linked with for/id (or wrap the field in the label). Only use aria-label when a visible label truly isn't possible.",
        snippet(unlabelledInputs[0])))

    check(namelessButtons.length === 0, "Buttons have names", () =>
      finding("button-names", "high", `${plural(namelessButtons.length, "button")} with no name`,
        "Icon-only buttons (like a hamburger menu, close X or search icon) with no text are announced as just \"button\". Users can't tell what they do.",
        'Add an aria-label describing the action to every icon-only button (e.g. aria-label="Open menu"), and mark the decorative icon inside with aria-hidden="true".',
        snippet(namelessButtons[0])))

    check(namelessLinks.length === 0, "Links have names", () =>
      finding("link-names", "high", `${plural(namelessLinks.length, "link")} with no name`,
        "Links with only an icon or image and no text or alt are announced as the raw URL, or nothing at all. Social icons in footers are the usual culprit.",
        'Give every icon or image link an accessible name: add aria-label (e.g. aria-label="EsteBot on GitHub") or alt text on the image inside.',
        snippet(namelessLinks[0])))

    check(imagesNoAlt.length === 0, "Images have alt text", () =>
      finding("img-alt", "medium", `${plural(imagesNoAlt.length, "image")} missing alt text`,
        "Screen readers read out the file name instead (\"IMG underscore 4032 dot PNG\").",
        'Add alt text describing each meaningful image. For purely decorative images, use alt="" so screen readers skip them.',
        snippet(imagesNoAlt[0])))

    const fakeInteractive = [...clickableNonInteractive, ...fakeButtons]
    check(fakeInteractive.length === 0, "Clickable things are real buttons and links", () =>
      finding("fake-buttons", "medium", `${plural(fakeInteractive.length, "clickable element")} that aren't real buttons`,
        "A <div> or <span> with a click handler can't be reached with the Tab key or pressed with Enter/Space, so keyboard and screen reader users can't use it.",
        "Replace clickable <div>/<span> elements with <button> (for actions) or <a href> (for navigation). If that's impossible, add role, tabindex=\"0\" and Enter/Space key handlers.",
        snippet(fakeInteractive[0])))

    if (h1Count === 0) {
      findings.push(finding("h1", "medium", "No main heading (H1)",
        "Screen reader users jump between headings to skim a page. Without an H1 there's no clear starting point.",
        "Add one <h1> that describes the page's main purpose."))
    } else {
      passed.push("Page has a main heading")
    }

    check(skippedLevels.length === 0, "Heading levels don't skip", () =>
      finding("heading-skip", "low", "Heading levels skip",
        "Jumping from, say, H2 to H4 makes the page outline confusing for people navigating by headings.",
        "Use heading levels in order (H1 → H2 → H3) and style them with CSS rather than picking a level for its size.",
        skippedLevels.slice(0, 3).join(", ")))

    check(hasMain, "Main content landmark present", () =>
      finding("main-landmark", "low", "No <main> landmark",
        "Screen readers offer a 'skip to main content' shortcut, but only if the page marks it with <main>.",
        "Wrap the page's primary content in a single <main> element."))

    check(vagueLinks.length === 0, "Link text is descriptive", () =>
      finding("vague-links", "low", `${plural(vagueLinks.length, "vague link")} like "click here"`,
        "People using screen readers often list all links on a page. \"Click here\" or \"Read more\" five times tells them nothing.",
        "Rewrite vague link text so it says where the link goes, e.g. \"Read the pricing guide\" instead of \"Read more\".",
        snippet(vagueLinks[0])))

    check(untitledIframes.length === 0, "Embedded frames have titles", () =>
      finding("iframe-title", "medium", `${plural(untitledIframes.length, "embed")} without a title`,
        "Embedded videos, maps and widgets without a title are announced as just \"frame\".",
        'Add a descriptive title to every <iframe>, e.g. title="Map of our Adelaide office".',
        snippet(untitledIframes[0])))

    check(hiddenFocusable.length === 0, "No hidden-but-focusable elements", () =>
      finding("aria-hidden-focus", "medium", "Hidden elements can still be focused",
        "Something marked aria-hidden=\"true\" still contains links or buttons. Keyboard users land on controls that screen readers say don't exist.",
        "Remove aria-hidden from elements that contain interactive controls, or make those controls unfocusable (tabindex=\"-1\") while hidden.",
        snippet(hiddenFocusable[0])))

    check(positiveTabindex.length === 0, "Tab order isn't overridden", () =>
      finding("tabindex", "low", "Custom tab order (tabindex above 0)",
        "Positive tabindex values make the Tab key jump around the page in a confusing order.",
        "Remove positive tabindex values and let the tab order follow the page order (use tabindex=\"0\" or \"-1\" only).",
        snippet(positiveTabindex[0])))

    check(autoplayAudio.length === 0, "No autoplaying sound", () =>
      finding("autoplay", "medium", "Media autoplays with sound",
        "Sound that starts by itself talks over screen readers and is jarring for everyone.",
        "Don't autoplay audio. If a background video must autoplay, add the muted attribute and provide pause controls.",
        snippet(autoplayAudio[0])))

    check(!cssKillsFocus && twNoOutline.length === 0, "Focus outline isn't removed", () =>
      finding("focus-outline", "medium", "Focus outline removed",
        "The outline that shows where keyboard focus is has been switched off without a replacement, so keyboard users can't see where they are.",
        "Never remove focus outlines without a replacement. Replace outline-none with a visible focus style, e.g. Tailwind focus-visible:ring-2 focus-visible:ring-offset-2.",
        twNoOutline[0] ? snippet(twNoOutline[0]) : "outline: none in a :focus style"))

    check(duplicateIds.length === 0, "Element IDs are unique", () =>
      finding("duplicate-ids", "low", `${plural(duplicateIds.length, "duplicate ID")}`,
        "Labels and ARIA attributes point at elements by ID. When IDs repeat, they can point at the wrong thing.",
        "Make every id attribute unique on the page.",
        duplicateIds.slice(0, 5).join(", ")))
  } else {
    findings.push(finding("js-shell", "info", "Most of your page is drawn by JavaScript",
      "Your server sends an almost-empty page and JavaScript builds the rest in the browser, so I could only check the basics (language, zoom, title). Everything inside your app still needs checking.",
      "Run an in-browser accessibility checker such as Lighthouse (Chrome DevTools → Lighthouse → Accessibility) or the axe DevTools extension on each page, and fix what it reports."))
  }

  // Things static HTML can't prove; always worth a manual check.
  findings.push(finding("contrast-manual", "info", "Check colour contrast",
    "Grey text on a light background is the most common accessibility failure on AI-built sites. I can't measure contrast without rendering your page.",
    "Check text contrast with Chrome DevTools (inspect text → contrast ratio) or WebAIM's contrast checker. Body text needs at least 4.5:1, large text 3:1. Darken any light grey text that fails."))

  findings.push(finding("keyboard-manual", "info", "Try your site with just a keyboard",
    "Press Tab through your page. You should always see where you are, reach every button, link and form field, and be able to close menus and pop-ups with Escape.",
    "Make sure every interactive element is reachable with Tab, shows a visible focus style, works with Enter/Space, and that modals trap focus and close with Escape."))

  const sorted = sortFindings(findings)

  return {
    url,
    status,
    stack: detectStack(html, parsedUrl.hostname),
    // An empty JS shell can't be graded fairly: flag it as a partial check.
    summary: { ...summarize(sorted), ...(isEmptyShell ? { limited: true } : {}) },
    findings: sorted,
    passed,
    checks: {
      lang: lang || null,
      title: pageTitle || null,
      viewport: viewport || null,
      zoomDisabled,
      emptyShell: isEmptyShell,
      counts: {
        images: $("img").length,
        imagesNoAlt: imagesNoAlt.length,
        formFields: $("input, select, textarea").length,
        unlabelledInputs: unlabelledInputs.length,
        buttons: $('button, [role="button"]').length,
        namelessButtons: namelessButtons.length,
        links: links.length,
        namelessLinks: namelessLinks.length,
        headings: headings.length,
        iframes: $("iframe").length
      },
      headingOutline: headings.map(l => `H${l}`).join(" ")
    }
  }
}
