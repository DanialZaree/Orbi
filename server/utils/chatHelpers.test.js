const { test, describe } = require('node:test');
const assert = require('node:assert');
const {
  dataUriToGenerativePart,
  isTextMime,
  processFilePart,
  parseGeminiResponse
} = require('./chatHelpers');

describe('dataUriToGenerativePart', () => {
  test('should correctly parse a valid image data URI', () => {
    const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const result = dataUriToGenerativePart(dataUri);

    assert.notStrictEqual(result, null);
    assert.strictEqual(result.inlineData.mimeType, 'image/png');
    assert.strictEqual(result.inlineData.data, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  });

  test('should correctly parse a valid video data URI', () => {
    const dataUri = 'data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAAAAGlzb21tcDQybXA0MQAAAAA=';
    const result = dataUriToGenerativePart(dataUri);

    assert.notStrictEqual(result, null);
    assert.strictEqual(result.inlineData.mimeType, 'video/mp4');
    assert.strictEqual(result.inlineData.data, 'AAAAIGZ0eXBtcDQyAAAAAGlzb21tcDQybXA0MQAAAAA=');
  });

  test('should return null and log error for invalid data URI format', () => {
    const invalidUri = 'invalid-data-uri';

    const originalConsoleError = console.error;
    console.error = () => {};
    const result = dataUriToGenerativePart(invalidUri);
    console.error = originalConsoleError;

    assert.strictEqual(result, null);
  });

  test('should handle data URI with special characters in mime type', () => {
    const dataUri = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,YmFzZTY0ZGF0YQ==';
    const result = dataUriToGenerativePart(dataUri);

    assert.notStrictEqual(result, null);
    assert.strictEqual(result.inlineData.mimeType, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    assert.strictEqual(result.inlineData.data, 'YmFzZTY0ZGF0YQ==');
  });
});

describe('isTextMime', () => {
  test('should return true for text/plain', () => {
    assert.strictEqual(isTextMime('text/plain'), true);
  });

  test('should return true for application/json', () => {
    assert.strictEqual(isTextMime('application/json'), true);
  });

  test('should return true for application/javascript', () => {
    assert.strictEqual(isTextMime('application/javascript'), true);
  });

  test('should return true for XML-based types', () => {
    assert.strictEqual(isTextMime('application/xml'), true);
    assert.strictEqual(isTextMime('image/svg+xml'), true);
  });

  test('should return false for non-text types', () => {
    assert.strictEqual(isTextMime('image/png'), false);
    assert.strictEqual(isTextMime('video/mp4'), false);
    assert.strictEqual(isTextMime('application/pdf'), false);
  });
});

describe('processFilePart', () => {
  test('should return text content for text-based files', () => {
    const textData = Buffer.from('Hello World').toString('base64');
    const dataUri = `data:text/plain;base64,${textData}`;
    const result = processFilePart(dataUri, 'test.txt');

    assert.notStrictEqual(result, null);
    assert.ok(result.text.includes('--- File: test.txt ---'));
    assert.ok(result.text.includes('Hello World'));
  });

  test('should return inlineData for non-text files', () => {
    const dataUri = 'data:image/png;base64,YmFzZTY0ZGF0YQ==';
    const result = processFilePart(dataUri, 'test.png');

    assert.notStrictEqual(result, null);
    assert.strictEqual(result.inlineData.mimeType, 'image/png');
    assert.strictEqual(result.inlineData.data, 'YmFzZTY0ZGF0YQ==');
  });

  test('should return null for invalid data URI', () => {
    assert.strictEqual(processFilePart('invalid', 'test.txt'), null);
  });
});

describe('parseGeminiResponse', () => {
  test('should parse plain text', () => {
    const text = 'Hello, how can I help you?';
    const result = parseGeminiResponse(text);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].type, 'text');
    assert.strictEqual(result[0].value, 'Hello, how can I help you?');
  });

  test('should parse text with code blocks', () => {
    const text = 'Here is some code:\n```javascript\nconst x = 1;\n```\nHope that helps!';
    const result = parseGeminiResponse(text);

    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0].type, 'text');
    assert.strictEqual(result[0].value, 'Here is some code:');
    assert.strictEqual(result[1].type, 'code');
    assert.strictEqual(result[1].language, 'javascript');
    assert.strictEqual(result[1].value, 'const x = 1;');
    assert.strictEqual(result[2].type, 'text');
    assert.strictEqual(result[2].value, 'Hope that helps!');
  });

  test('should handle code blocks without language', () => {
    const text = '```\nno language\n```';
    const result = parseGeminiResponse(text);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].type, 'code');
    assert.strictEqual(result[0].language, 'plaintext');
    assert.strictEqual(result[0].value, 'no language');
  });
});
