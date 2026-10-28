"use client"
import AuditPage from "../components/AuditPage"
import A11yAuditSection from "../components/A11yAuditSection"

const STEPS = [
  "Fetching your page",
  "Checking language, title and zoom",
  "Checking labels on buttons, links and forms",
  "Checking images, headings and landmarks",
  "Working out your score"
]

const CHECKS = [
  {
    title: "Can everyone use it?",
    icon: "eye",
    items: [
      "Pinch-to-zoom switched off",
      "Missing page language",
      "Images without alt text",
      "Sound that autoplays"
    ]
  },
  {
    title: "Screen reader slip-ups",
    icon: "info",
    items: [
      "Icon buttons with no name",
      "Icon links with no name",
      "Form fields with only a placeholder",
      "Embeds without a title"
    ]
  },
  {
    title: "Keyboard and structure",
    icon: "search",
    items: [
      "Clickable divs that aren't buttons",
      "Focus outlines removed",
      "Skipped heading levels",
      "Missing <main>, odd tab order"
    ]
  }
]

export default function AccessibilityAuditPage() {
  return (
    <AuditPage
      kind="Accessibility"
      endpoint="/api/a11y-audit"
      title="Can everyone use your site?"
      intro="AI tools love icon-only buttons, placeholder-only forms and turning off zoom. EsteBot checks your live site for the accessibility mistakes vibe-coded apps make most, so people using screen readers, keyboards or zoom aren't locked out."
      greeting="I'm a kiwi, I can't fly. Let's make sure nobody gets stuck on your site either."
      steps={STEPS}
      checks={CHECKS}
      note="I check the HTML your site sends. Colour contrast and keyboard use need a real browser, so I'll tell you how to check those yourself."
      Details={A11yAuditSection}
    />
  )
}
