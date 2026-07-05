/**
 * Migration Path: How this SQL/Logic moves to a decentralized P2P state.
 * Real-time searches are presently queried from centralized APIs (Tavily).
 * In a P2P decentralized state:
 * 1. Web research is conducted using decentralized search indexes (e.g. Presearch, YaCy)
 *    or collaborative search scrapers running across worker nodes in a P2P overlay.
 */

export async function tavilySearch(query: string, country: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("TAVILY_API_KEY is not defined. Web search will return empty results.");
    return "";
  }

  try {
    const formattedQuery = `${query} leyes regulaciones oficiales en ${country}`;
    console.log(`[Tavily] Querying: "${formattedQuery}"`);

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: formattedQuery,
        search_depth: "advanced",
        include_answer: true,
        max_results: 3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API responded with status ${response.status}`);
    }

    const data = (await response.json()) as { answer?: string; results?: Array<{ title: string; url: string; content: string }> };
    
    let resultText = "";
    if (data.answer) {
      resultText += `**Resumen de la búsqueda:**\n${data.answer}\n\n`;
    }

    if (data.results && data.results.length > 0) {
      resultText += `**Fuentes consultadas:**\n`;
      data.results.forEach((res, i) => {
        resultText += `${i + 1}. [${res.title}](${res.url}): ${res.content.substring(0, 200)}...\n`;
      });
    }

    return resultText;
  } catch (error: any) {
    console.error("Tavily search error:", error);
    return `Error en la búsqueda web: ${error.message}`;
  }
}
