const MAX_HISTORY_MESSAGES = 20;

/**
 * Helper to convert Base64 data URI to a Gemini Part object
 * Supports images and videos
 * @param {string} dataUri
 * @returns {object|null}
 */
function parseDataUri(dataUri) {
  if (!dataUri || typeof dataUri !== "string" || !dataUri.startsWith("data:")) return null;
  const commaIdx = dataUri.indexOf(",");
  if (commaIdx === -1 || commaIdx > 250) return null;

  const prefix = dataUri.slice(0, commaIdx);
  if (!prefix.endsWith(";base64")) return null;

  const mimeType = prefix.slice(5, -7).trim();
  if (!/^[a-zA-Z0-9\/+.-]+$/.test(mimeType)) return null;

  const data = dataUri.slice(commaIdx + 1).trim();
  if (!data) return null;

  return { mimeType, data };
}

/**
 * Helper to convert Base64 data URI to a Gemini Part object
 * Supports images and videos
 * @param {string} dataUri
 * @returns {object|null}
 */
function dataUriToGenerativePart(dataUri) {
  try {
    const parsed = parseDataUri(dataUri);
    if (!parsed) {
      throw new Error("Invalid data URI format");
    }
    return { inlineData: { data: parsed.data, mimeType: parsed.mimeType } };
  } catch (error) {
    console.error("Failed to parse data URI:", error.message);
    return null;
  }
}

/**
 * Helper to check if a MIME type is text-based
 * @param {string} mimeType
 * @returns {boolean}
 */
function isTextMime(mimeType) {
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/javascript" ||
    mimeType === "application/x-javascript" ||
    mimeType === "application/xml" ||
    mimeType.endsWith("+xml") ||
    mimeType.endsWith("+json")
  );
}

/**
 * Helper to process document/file parts (extract text if text-based, else return inlineData)
 * @param {string} dataUri
 * @param {string} fileName
 * @returns {object|null}
 */
function processFilePart(dataUri, fileName = "unknown") {
  try {
    const parsed = parseDataUri(dataUri);
    if (!parsed) return null;

    const { mimeType, data: base64Data } = parsed;

    if (isTextMime(mimeType)) {
      const textContent = Buffer.from(base64Data, "base64").toString("utf-8");
      return {
        text: `\n\n--- File: ${fileName} ---\n${textContent}\n`,
      };
    } else {
      return { inlineData: { data: base64Data, mimeType } };
    }
  } catch (error) {
    console.error("Failed to process file part:", error);
    return null;
  }
}

/**
 * Helper to strip accidental repeating paragraphs (e.g. LLM looping intro text across multiple files)
 * @param {string} text
 * @returns {string}
 */
function cleanGeminiResponse(text) {
  if (!text || typeof text !== "string") return "";

  const paragraphs = text.split(/\n\n+/);
  const seenParagraphs = new Map();
  const cleanedParagraphs = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    // Check for large repeated narrative paragraphs (> 100 chars) that are not code blocks
    if (p.length > 100 && !p.startsWith("```")) {
      const count = seenParagraphs.get(p) || 0;
      if (count >= 1) {
        // Repeated identical block - skip duplicate
        continue;
      }
      seenParagraphs.set(p, count + 1);
    }
    cleanedParagraphs.push(paragraphs[i]);
  }

  return cleanedParagraphs.join("\n\n");
}

/**
 * Helper to parse the AI's text response into structured text and code blocks.
 * Robust against multi-token language specifiers (e.g., ```typescript jsx) and unclosed trailing blocks.
 * @param {string} responseText
 * @returns {Array}
 */
function parseGeminiResponse(responseText) {
  if (!responseText || typeof responseText !== "string") return [];
  const cleanedText = cleanGeminiResponse(responseText);
  const contentArray = [];

  // Match any fenced code block: opening ``` followed by info string, body, and closing ``` or end of string
  const codeBlockRegex = /```([^\r\n]*)\r?\n([\s\S]*?)(?:```|$)/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(cleanedText)) !== null) {
    if (match.index > lastIndex) {
      const textBlock = cleanedText.substring(lastIndex, match.index).trim();
      if (textBlock) contentArray.push({ type: "text", value: textBlock });
    }

    const rawLang = (match[1] || "").trim().split(/\s+/)[0] || "plaintext";
    const codeBlock = match[2].replace(/\r?\n$/, "");
    if (codeBlock || match[0].includes("```")) {
      contentArray.push({
        type: "code",
        language: rawLang,
        value: codeBlock,
      });
    }

    lastIndex = codeBlockRegex.lastIndex;
    if (match.index === codeBlockRegex.lastIndex) {
      codeBlockRegex.lastIndex++;
    }
  }

  if (lastIndex < cleanedText.length) {
    const finalTextBlock = cleanedText.substring(lastIndex).trim();
    if (finalTextBlock) {
      contentArray.push({ type: "text", value: finalTextBlock });
    }
  }

  return contentArray;
}

module.exports = {
  MAX_HISTORY_MESSAGES,
  dataUriToGenerativePart,
  isTextMime,
  processFilePart,
  cleanGeminiResponse,
  parseGeminiResponse,
};
