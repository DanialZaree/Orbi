const test = require("node:test");
const assert = require("node:assert");
const {
  parseGeminiResponse,
  isTextMime,
  dataUriToGenerativePart,
  processFilePart,
} = require("./chatHelpers");

test("parseGeminiResponse", async (t) => {
  await t.test("should parse plain text", () => {
    const input = "Hello, how are you?";
    const expected = [{ type: "text", value: "Hello, how are you?" }];
    assert.deepStrictEqual(parseGeminiResponse(input), expected);
  });

  await t.test("should parse a single code block", () => {
    const input = "Here is some code:\n```javascript\nconsole.log('hello');\n```";
    const expected = [
      { type: "text", value: "Here is some code:" },
      { type: "code", language: "javascript", value: "console.log('hello');" },
    ];
    assert.deepStrictEqual(parseGeminiResponse(input), expected);
  });

  await t.test("should parse multiple code blocks with interleaved text", () => {
    const input =
      "Start\n```python\nprint(1)\n```\nMiddle\n```javascript\nconsole.log(2)\n```\nEnd";
    const expected = [
      { type: "text", value: "Start" },
      { type: "code", language: "python", value: "print(1)" },
      { type: "text", value: "Middle" },
      { type: "code", language: "javascript", value: "console.log(2)" },
      { type: "text", value: "End" },
    ];
    assert.deepStrictEqual(parseGeminiResponse(input), expected);
  });

  await t.test("should handle code block without language", () => {
    const input = "```\nsome generic code\n```";
    const expected = [
      { type: "code", language: "plaintext", value: "some generic code" },
    ];
    assert.deepStrictEqual(parseGeminiResponse(input), expected);
  });

  await t.test("should handle empty or whitespace-only response", () => {
    assert.deepStrictEqual(parseGeminiResponse(""), []);
    assert.deepStrictEqual(parseGeminiResponse("   "), []);
  });

  await t.test("should handle text after final code block", () => {
    const input = "```sql\nSELECT * FROM users;\n```\nHope that helps!";
    const expected = [
      { type: "code", language: "sql", value: "SELECT * FROM users;" },
      { type: "text", value: "Hope that helps!" },
    ];
    assert.deepStrictEqual(parseGeminiResponse(input), expected);
  });
});

test("isTextMime", async (t) => {
  await t.test("should return true for text/* mimes", () => {
    assert.strictEqual(isTextMime("text/plain"), true);
    assert.strictEqual(isTextMime("text/html"), true);
    assert.strictEqual(isTextMime("text/markdown"), true);
  });

  await t.test("should return true for specific application mimes", () => {
    assert.strictEqual(isTextMime("application/json"), true);
    assert.strictEqual(isTextMime("application/javascript"), true);
    assert.strictEqual(isTextMime("application/xml"), true);
  });

  await t.test("should return true for +json and +xml suffixes", () => {
    assert.strictEqual(isTextMime("application/ld+json"), true);
    assert.strictEqual(isTextMime("image/svg+xml"), true);
  });

  await t.test("should return false for other mimes", () => {
    assert.strictEqual(isTextMime("image/png"), false);
    assert.strictEqual(isTextMime("video/mp4"), false);
    assert.strictEqual(isTextMime("application/octet-stream"), false);
  });
});

test("dataUriToGenerativePart", async (t) => {
  await t.test("should correctly parse a valid data URI", () => {
    const dataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const result = dataUriToGenerativePart(dataUri);
    assert.strictEqual(result.inlineData.mimeType, "image/png");
    assert.strictEqual(result.inlineData.data, "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==");
  });

  await t.test("should return null for invalid data URI", () => {
    assert.strictEqual(dataUriToGenerativePart("invalid-uri"), null);
    assert.strictEqual(dataUriToGenerativePart("data:image/png;base64"), null);
  });
});

test("processFilePart", async (t) => {
  await t.test("should extract text for text-based files", () => {
    const base64Text = Buffer.from("Hello world").toString("base64");
    const dataUri = `data:text/plain;base64,${base64Text}`;
    const result = processFilePart(dataUri, "test.txt");
    assert.ok(result.text.includes("--- File: test.txt ---"));
    assert.ok(result.text.includes("Hello world"));
  });

  await t.test("should return inlineData for non-text files", () => {
    const dataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const result = processFilePart(dataUri, "image.png");
    assert.ok(result.inlineData);
    assert.strictEqual(result.inlineData.mimeType, "image/png");
  });
});
