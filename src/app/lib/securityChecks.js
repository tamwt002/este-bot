export async function runSecurityChecks(inputUrl) {
    const url = inputUrl.startsWith("http")
      ? inputUrl
      : `https://${inputUrl}`
  
    const res = await fetch(url, {
      redirect: "manual"
    })
  
    const headers = Object.fromEntries(res.headers.entries())
  
    const checks = {
      transport: {
        https: url.startsWith("https"),
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
      url,
      status: res.status,
      checks
    }
  }
  