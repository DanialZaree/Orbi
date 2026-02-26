/**
 * Helper to convert Base64 data URI to a Gemini Part object
 * @param {string} dataUri
 * @returns {object|null}
 */
function dataUriToGenerativePart(dataUri) {
  try {
    const match = dataUri.match(
      /^data:([a-zA-Z0-9\/+.-]+);base64,([a-zA-Z0-9+/=]+)$/
    );
    if (!match) {
      throw new Error("Invalid data URI format");
    }
    return { inlineData: { data: match[2], mimeType: match[1] } };
  } catch (error) {
    console.error("Failed to parse data URI:", error.message);
    return null; // Return null to be filtered out
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
    const match = dataUri.match(
      /^data:([a-zA-Z0-9\/+.-]+);base64,([a-zA-Z0-9+/=]+)$/
    );
    if (!match) return null;

    const mimeType = match[1];
    const base64Data = match[2];

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
 * Helper to parse the AI's text response
 * @param {string} responseText
 * @returns {Array}
 */
function parseGeminiResponse(responseText) {
  const contentArray = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  while ((match = codeBlockRegex.exec(responseText)) !== null) {
    if (match.index > lastIndex) {
      const textBlock = responseText.substring(lastIndex, match.index).trim();
      if (textBlock) contentArray.push({ type: "text", value: textBlock });
    }
    const codeBlock = match[2].trim();
    if (codeBlock)
      contentArray.push({
        type: "code",
        language: match[1] || "plaintext",
        value: codeBlock,
      });
    lastIndex = codeBlockRegex.lastIndex;
  }
  if (lastIndex < responseText.length) {
    const finalTextBlock = responseText.substring(lastIndex).trim();
    if (finalTextBlock)
      contentArray.push({ type: "text", value: finalTextBlock });
  }
  return contentArray;
}

module.exports = {
  dataUriToGenerativePart,
  isTextMime,
  processFilePart,
  parseGeminiResponse,
};
