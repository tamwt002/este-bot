import { safeFetch } from "./safeFetch"

export async function runSecurityChecks(inputUrl) {
    const url = /^https?:\/\//i.test(inputUrl)
      ? inputUrl
      : `https://${inputUrl}`

    // Headers are read from the first response, so redirects aren't followed.
    const res = await safeFetch(url, {
      timeout: 10000,
      maxRedirects: 0,
      readBody: false
    })

    const headers = res.headers

    const checks = {
      transport: {
        https: res.url.startsWith("https:"),
        hsts: !!headers["strict-transport-security"]
      },

      headers: {
        csp: !!headers["content-security-policy"],
        xFrame: !!headers["x-frame-options"],
        xContentType: !!headers["x-content-type-options"],
        referrerPolicy: !!headers["referrer-policy"],
        permissionsPolicy: !!headers["permissions-policy"]
      },

      exposure: {
        server: headers["server"] || null,
        xPoweredBy: headers["x-powered-by"] || null
      }
    }

    return {
      url: res.url,
      status: res.status,
      checks
    }
  }
