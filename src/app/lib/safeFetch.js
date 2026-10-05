import axios from "axios"
import dns from "dns"
import http from "http"
import https from "https"
import net from "net"

export const USER_AGENT =
  "Mozilla/5.0 (compatible; EsteBot/1.0; +https://wallace.woztech.world/bot)"

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"])
const ALLOWED_PORTS = new Set(["", "80", "443"])

// -----------------------------
// BLOCKED ADDRESS RANGES
// -----------------------------
const blocked = new net.BlockList()

;[
  ["0.0.0.0", 8], // "this" network
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local / cloud metadata
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // TEST-NET-1
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // TEST-NET-2
  ["203.0.113.0", 24], // TEST-NET-3
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4] // reserved + broadcast
].forEach(([addr, prefix]) => blocked.addSubnet(addr, prefix, "ipv4"))

// Only global unicast IPv6 (2000::/3) is allowed, minus these.
const globalUnicastV6 = new net.BlockList()
globalUnicastV6.addSubnet("2000::", 3, "ipv6")

;[
  ["2001::", 32], // Teredo (can tunnel to IPv4)
  ["2001:db8::", 32], // documentation
  ["2002::", 16] // 6to4 (can embed private IPv4)
].forEach(([addr, prefix]) => blocked.addSubnet(addr, prefix, "ipv6"))

export function isBlockedIp(ip) {
  const family = net.isIP(ip)
  if (family === 4) return blocked.check(ip, "ipv4")
  if (family === 6) {
    return !globalUnicastV6.check(ip, "ipv6") || blocked.check(ip, "ipv6")
  }
  return true
}

// -----------------------------
// ERRORS
// -----------------------------
// `message` is safe to show to users; never include raw network errors.
export class FetchError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

// -----------------------------
// URL VALIDATION
// -----------------------------
export function validateUrl(input) {
  let url
  try {
    url = new URL(input)
  } catch {
    throw new FetchError("Invalid URL format")
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new FetchError("Only http and https URLs are allowed")
  }
  if (url.username || url.password) {
    throw new FetchError("URLs with credentials are not allowed")
  }
  if (!ALLOWED_PORTS.has(url.port)) {
    throw new FetchError("Only standard ports (80, 443) are allowed")
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "")
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new FetchError("That address is not allowed")
  }
  // IP literals skip DNS lookup, so check them here.
  if (net.isIP(hostname) && isBlockedIp(hostname)) {
    throw new FetchError("That address is not allowed")
  }

  return url
}

// -----------------------------
// SAFE DNS LOOKUP
// -----------------------------
// Runs at connect time, so the IP that is checked is the IP that is used
// (prevents DNS-rebinding between a check and the request).
function safeLookup(hostname, options, callback) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err)

    const list = Array.isArray(addresses) ? addresses : [addresses]
    if (list.length === 0 || list.some(a => isBlockedIp(a.address))) {
      const blockedErr = new Error("Blocked address")
      blockedErr.code = "EBLOCKED"
      return callback(blockedErr)
    }

    if (options.all) return callback(null, list)
    callback(null, list[0].address, list[0].family)
  })
}

const httpAgent = new http.Agent({ lookup: safeLookup })
const httpsAgent = new https.Agent({ lookup: safeLookup })

// -----------------------------
// SAFE FETCH
// -----------------------------
/**
 * Fetch an external URL with SSRF protection.
 * Every redirect hop is re-validated. Returns the final response.
 */
export async function safeFetch(
  input,
  {
    timeout = 10000,
    maxBytes = 5 * 1024 * 1024,
    maxRedirects = 5,
    readBody = true,
    headers = {}
  } = {}
) {
  let url = validateUrl(input)

  for (let hop = 0; ; hop++) {
    let res
    try {
      res = await axios.get(url.toString(), {
        timeout,
        maxRedirects: 0,
        maxContentLength: maxBytes,
        responseType: readBody ? "text" : "stream",
        validateStatus: () => true,
        httpAgent,
        httpsAgent,
        proxy: false,
        headers: { "User-Agent": USER_AGENT, ...headers }
      })
    } catch (err) {
      throw toFetchError(err)
    }

    if (!readBody) res.data.destroy()

    const location = res.headers.location
    if (res.status >= 300 && res.status < 400 && location) {
      if (hop >= maxRedirects) {
        throw new FetchError("Too many redirects", 502)
      }
      url = validateUrl(new URL(location, url).toString())
      continue
    }

    return {
      url: url.toString(),
      status: res.status,
      headers: res.headers,
      data: res.data
    }
  }
}

function toFetchError(err) {
  if (err instanceof FetchError) return err
  if (err.code === "EBLOCKED" || err.cause?.code === "EBLOCKED") {
    return new FetchError("That address is not allowed", 400)
  }
  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
    return new FetchError("The site took too long to respond", 504)
  }
  if (err.code === "ERR_BAD_RESPONSE" && /maxContentLength/.test(err.message)) {
    return new FetchError("The page is too large to audit", 413)
  }
  if (err.code === "ENOTFOUND" || err.code === "EAI_AGAIN") {
    return new FetchError("Could not find that site", 502)
  }
  return new FetchError("Could not reach that site", 502)
}
