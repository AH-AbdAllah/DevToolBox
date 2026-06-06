"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

interface StatusCode {
  code: number;
  name: string;
  summary: string;
  description: string;
  rfc: string;
  commonCause: string;
  sampleHeader: string;
}

const STATUS_CODES: StatusCode[] = [
  // 1xx
  {
    code: 100,
    name: "Continue",
    summary: "The server has received the request headers and the client should proceed to send the request body.",
    description: "This interim response indicates that everything so far is OK and that the client should continue the request, or ignore the response if the request is already finished.",
    rfc: "RFC 9110, Section 15.2.1",
    commonCause: "Sent when the client sends an 'Expect: 100-continue' header to verify the server accepts large payloads before transmitting.",
    sampleHeader: "HTTP/1.1 100 Continue\r\n\r\n",
  },
  {
    code: 101,
    name: "Switching Protocols",
    summary: "The server is switching protocols as requested by the client's Upgrade header.",
    description: "Sent in response to an Upgrade request header from the client, indicating that the server agrees to change protocol layers (e.g., from HTTP/1.1 to WebSockets).",
    rfc: "RFC 9110, Section 15.2.2",
    commonCause: "Initiating WebSocket communication tunnels or HTTP/2 upgrading protocols.",
    sampleHeader: "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n",
  },
  // 2xx
  {
    code: 200,
    name: "OK",
    summary: "The request has succeeded.",
    description: "The request was successfully completed. The actual representation returned depends on the HTTP method used (GET payload, POST action outcome, etc.).",
    rfc: "RFC 9110, Section 15.3.1",
    commonCause: "Standard successful response for GET, POST, PUT, or DELETE request procedures.",
    sampleHeader: "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 42\r\n\r\n{\n  \"status\": \"success\"\n}",
  },
  {
    code: 201,
    name: "Created",
    summary: "The request has succeeded and a new resource has been created.",
    description: "The request has been fulfilled and has resulted in one or more new resources being created. The Location header typically points to the URI of the newly created resource.",
    rfc: "RFC 9110, Section 15.3.2",
    commonCause: "Successful database insertion or creation trigger after a POST or PUT write request.",
    sampleHeader: "HTTP/1.1 201 Created\r\nLocation: /api/users/128\r\nContent-Type: application/json\r\n\r\n{\n  \"id\": 128,\n  \"created\": true\n}",
  },
  {
    code: 202,
    name: "Accepted",
    summary: "The request has been accepted for processing, but processing is not yet complete.",
    description: "The request has been accepted for processing, but the processing has not been completed. The request might or might not be eventually acted upon, as it is non-committal.",
    rfc: "RFC 9110, Section 15.3.3",
    commonCause: "Triggering background worker tasks, batch queues, or asynchronous operations.",
    sampleHeader: "HTTP/1.1 202 Accepted\r\nContent-Type: application/json\r\n\r\n{\n  \"queueId\": \"job_4319\",\n  \"status\": \"queued\"\n}",
  },
  {
    code: 204,
    name: "No Content",
    summary: "The server successfully processed the request, but is not returning any content.",
    description: "The server has fulfilled the request but does not need to return an entity-body, and might want to return updated metainformation. Mostly used for DELETE actions.",
    rfc: "RFC 9110, Section 15.3.5",
    commonCause: "Successful DELETE request, or a PUT request updating resources without modifying client views.",
    sampleHeader: "HTTP/1.1 204 No Content\r\nConnection: keep-alive\r\n\r\n",
  },
  // 3xx
  {
    code: 301,
    name: "Moved Permanently",
    summary: "The target resource has been assigned a new permanent URI.",
    description: "The target resource has been assigned a new permanent URI and any future references to this resource ought to use one of the returned URIs.",
    rfc: "RFC 9110, Section 15.4.2",
    commonCause: "Website domain migrations or permanent URL restructure updates (critical for SEO redirects).",
    sampleHeader: "HTTP/1.1 301 Moved Permanently\r\nLocation: https://newdomain.com/path\r\nContent-Length: 0\r\n\r\n",
  },
  {
    code: 302,
    name: "Found",
    summary: "The target resource resides temporarily under a different URI.",
    description: "Also historically known as 'Temporary Redirect'. The server directs the client to look up the target under a different location temporarily, keeping old links.",
    rfc: "RFC 9110, Section 15.4.3",
    commonCause: "Temporary routing configurations, login redirects, or localized geolocated landing pages.",
    sampleHeader: "HTTP/1.1 302 Found\r\nLocation: /login\r\nContent-Length: 0\r\n\r\n",
  },
  {
    code: 304,
    name: "Not Modified",
    summary: "The resource has not changed since the last request specified by caching headers.",
    description: "Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match. The client uses its cached representation.",
    rfc: "RFC 9110, Section 15.4.5",
    commonCause: "Browser cache revalidation. Avoids re-downloading static files (images, JS, CSS) to optimize speed.",
    sampleHeader: "HTTP/1.1 304 Not Modified\r\nETag: \"28a9b-381af\"\r\nCache-Control: max-age=3600\r\n\r\n",
  },
  // 4xx
  {
    code: 400,
    name: "Bad Request",
    summary: "The server cannot process the request due to client error.",
    description: "The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid query formats).",
    rfc: "RFC 9110, Section 15.5.1",
    commonCause: "Malformed payload body, JSON syntax errors, missing required query tags, or size limit breaches.",
    sampleHeader: "HTTP/1.1 400 Bad Request\r\nContent-Type: application/json\r\n\r\n{\n  \"error\": \"Bad Request\",\n  \"message\": \"Missing key 'email' in request payload\"\n}",
  },
  {
    code: 401,
    name: "Unauthorized",
    summary: "Authentication is required and has failed or has not yet been provided.",
    description: "The request has not been applied because it lacks valid authentication credentials for the target resource. Includes a WWW-Authenticate header field.",
    rfc: "RFC 9110, Section 15.5.2",
    commonCause: "Missing Bearer Token, expired cookies, wrong API access keys, or invalid password credentials.",
    sampleHeader: "HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Bearer realm=\"api\"\r\nContent-Type: application/json\r\n\r\n{\n  \"error\": \"Unauthorized\",\n  \"message\": \"Invalid or expired token\"\n}",
  },
  {
    code: 403,
    name: "Forbidden",
    summary: "The client does not have access rights to the content.",
    description: "The server understood the request but refuses to authorize it. Unlike 401, the client's identity is known to the server, but authorization permission checks failed.",
    rfc: "RFC 9110, Section 15.5.4",
    commonCause: "A standard user trying to call admin paths, folder permission limits (chmod), or IP blocklists.",
    sampleHeader: "HTTP/1.1 403 Forbidden\r\nContent-Type: application/json\r\n\r\n{\n  \"error\": \"Forbidden\",\n  \"message\": \"Administrative permissions required to perform this action\"\n}",
  },
  {
    code: 404,
    name: "Not Found",
    summary: "The server cannot find the requested resource.",
    description: "The origin server did not find a current representation for the target resource or is unwilling to disclose that one exists (often returning 404 to obscure access status).",
    rfc: "RFC 9110, Section 15.5.5",
    commonCause: "Incorrect URL typos, deleted items, missing database records, or directory path errors.",
    sampleHeader: "HTTP/1.1 404 Not Found\r\nContent-Type: application/json\r\n\r\n{\n  \"error\": \"Not Found\",\n  \"message\": \"The requested route '/users/999' does not exist\"\n}",
  },
  {
    code: 429,
    name: "Too Many Requests",
    summary: "The user has sent too many requests in a given amount of time.",
    description: "The user has sent too many requests in a given amount of time ('rate limiting'). The server typically includes a Retry-After header indicating how long to wait.",
    rfc: "RFC 6585, Section 4",
    commonCause: "Violating API rate limits, DDOS prevention triggering, or scrapers spamming request endpoints.",
    sampleHeader: "HTTP/1.1 429 Too Many Requests\r\nRetry-After: 300\r\nContent-Type: application/json\r\n\r\n{\n  \"error\": \"Rate Limit Exceeded\",\n  \"message\": \"Limit is 60 requests per minute. Retry in 5 minutes.\"\n}",
  },
  // 5xx
  {
    code: 500,
    name: "Internal Server Error",
    summary: "The server encountered an unexpected condition that prevented it from fulfilling the request.",
    description: "The server encountered an unexpected condition that prevented it from fulfilling the request. This is the catch-all error response for server crashes.",
    rfc: "RFC 9110, Section 15.6.1",
    commonCause: "Uncaught exceptions in backend code, database server disconnects, file system errors, or code logic crashes.",
    sampleHeader: "HTTP/1.1 500 Internal Server Error\r\nContent-Type: application/json\r\n\r\n{\n  \"error\": \"Server Error\",\n  \"message\": \"An unexpected null pointer exception occurred\"\n}",
  },
  {
    code: 502,
    name: "Bad Gateway",
    summary: "The server received an invalid response from the upstream server.",
    description: "The server, while acting as a gateway or proxy, received an invalid response from the upstream server it accessed in attempting to fulfill the request.",
    rfc: "RFC 9110, Section 15.6.3",
    commonCause: "Reverse proxy (like Nginx/Cloudflare) trying to forward request to backend servers that are down or offline.",
    sampleHeader: "HTTP/1.1 502 Bad Gateway\r\nContent-Type: text/html\r\n\r\n<html><body><h1>502 Bad Gateway</h1></body></html>",
  },
  {
    code: 503,
    name: "Service Unavailable",
    summary: "The server is not ready to handle the request.",
    description: "The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. The state is temporary and will be resolved.",
    rfc: "RFC 9110, Section 15.6.4",
    commonCause: "System maintenance window, massive CPU overload spikes, or hosting resources exhaustion.",
    sampleHeader: "HTTP/1.1 503 Service Unavailable\r\nRetry-After: 3600\r\nContent-Type: application/json\r\n\r\n{\n  \"status\": \"maintenance\",\n  \"retry_after_seconds\": 3600\n}",
  },
];

export function HttpStatusClient() {
  const [query, setQuery] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<"all" | "1xx" | "2xx" | "3xx" | "4xx" | "5xx">("all");
  const [selectedCode, setSelectedCode] = useState<StatusCode>(STATUS_CODES[2]); // Default 200 OK

  const filteredCodes = STATUS_CODES.filter((item) => {
    const matchesSeries =
      selectedSeries === "all" ||
      (selectedSeries === "1xx" && item.code >= 100 && item.code < 200) ||
      (selectedSeries === "2xx" && item.code >= 200 && item.code < 300) ||
      (selectedSeries === "3xx" && item.code >= 300 && item.code < 400) ||
      (selectedSeries === "4xx" && item.code >= 400 && item.code < 500) ||
      (selectedSeries === "5xx" && item.code >= 500 && item.code < 600);

    const matchesSearch =
      item.code.toString().includes(query) ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.summary.toLowerCase().includes(query.toLowerCase());

    return matchesSeries && matchesSearch;
  });

  const getSeriesColor = (code: number) => {
    if (code >= 100 && code < 200) return "text-sky-500 bg-sky-500/10 border-sky-500/20";
    if (code >= 200 && code < 300) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (code >= 300 && code < 400) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (code >= 400 && code < 500) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-destructive bg-destructive/10 border-destructive/20";
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
        {/* Search */}
        <div className="flex items-center px-3 border border-input rounded-lg bg-background w-full md:max-w-xs focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
          <Icon name="Search" className="w-4 h-4 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search code, name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 text-xs text-foreground bg-transparent w-full focus:outline-none"
          />
        </div>

        {/* Series filters */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(["all", "1xx", "2xx", "3xx", "4xx", "5xx"] as const).map((series) => (
            <button
              key={series}
              onClick={() => setSelectedSeries(series)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer capitalize ${
                selectedSeries === series
                  ? "bg-primary border-primary text-primary-foreground shadow"
                  : "border-input bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {series === "all" ? "All series" : `${series} Series`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Codes grid */}
        <div className="lg:col-span-3 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredCodes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCodes.map((item) => (
                <div
                  key={item.code}
                  onClick={() => setSelectedCode(item)}
                  className={`p-4 rounded-xl border bg-card shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex items-start space-x-3.5 ${
                    selectedCode.code === item.code
                      ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                      : "border-border hover:border-border-hover"
                  }`}
                >
                  <div className={`px-2.5 py-1 rounded text-sm font-bold border ${getSeriesColor(item.code)}`}>
                    {item.code}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal truncate">{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-muted-foreground rounded-xl border border-border bg-card">
              No status codes found matching your query.
            </div>
          )}
        </div>

        {/* Selected Code Inspector panel */}
        <div className="lg:col-span-2">
          <Card className="border-border h-full flex flex-col justify-between min-h-[480px]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-muted/20">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center">
                  <Icon name="Compass" className="w-4 h-4 mr-2 text-primary" />
                  <span>Code Diagnostics</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono bg-muted border border-border rounded px-2 py-0.5">
                  {selectedCode.rfc}
                </span>
              </div>

              <CardContent className="p-6 space-y-5 text-xs">
                {/* Title */}
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1.5 rounded-lg text-lg font-bold border ${getSeriesColor(selectedCode.code)}`}>
                    {selectedCode.code}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-none">{selectedCode.name}</h3>
                    <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-semibold">
                      HTTP Status Code
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Semantic Definition</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedCode.description}</p>
                </div>

                {/* Common Cause */}
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Common Triggers / Causes</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedCode.commonCause}</p>
                </div>

                {/* Headers Mockup */}
                <div className="space-y-2.5 pt-2 border-t border-border/50">
                  <h4 className="font-bold text-foreground">Sample HTTP Response Headers</h4>
                  <div className="rounded-lg border border-border/60 bg-slate-950 p-4 font-mono text-[10px] text-slate-300 shadow-inner overflow-auto whitespace-pre">
                    {selectedCode.sampleHeader}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
