import { render, screen } from '@testing-library/react';
import ChatWindow from './index';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock ChatBubble to avoid rendering complex children and just verify rendering
vi.mock('../ChatBubble', () => ({
  default: ({ message, isLastMessage }) => (
    <div data-testid="chat-bubble" data-message-content={message.content[0].value}>
      {message.content[0].value}
      {isLastMessage ? ' (Last)' : ''}
    </div>
  ),
}));

// Mock scrollIntoView since it's not supported in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatWindow', () => {
  const mockMessages = [
    { role: 'user', content: [{ type: 'text', value: 'Hello' }] },
    { role: 'assistant', content: [{ type: 'text', value: 'Hi there!' }] },
  ];

  it('renders messages correctly', () => {
    render(<ChatWindow messages={mockMessages} isLoading={false} />);

    const bubbles = screen.getAllByTestId('chat-bubble');
    expect(bubbles).toHaveLength(2);
    expect(bubbles[0].textContent).toContain('Hello');
    expect(bubbles[1].textContent).toContain('Hi there!');
  });

  it('handles loading state with empty messages', () => {
    const { container } = render(<ChatWindow messages={[]} isLoading={true} />);
    // Should show spinner (implementation detail: check for spinner class or just lack of bubbles)
    const bubbles = screen.queryAllByTestId('chat-bubble');
    expect(bubbles).toHaveLength(0);
    // Assuming spinner is rendered
    expect(container.textContent).not.toContain('ORBI is typing...'); // Typing indicator is for non-empty messages
  });

  it('handles loading state with existing messages (typing indicator)', () => {
    render(<ChatWindow messages={mockMessages} isLoading={true} />);
    const bubbles = screen.getAllByTestId('chat-bubble');
    expect(bubbles).toHaveLength(2);
    expect(screen.getByText(/ORBI is typing.../i)).toBeInTheDocument();
  });

  it('renders messages with _id as key', () => {
    const messagesWithId = [
      { _id: '1', role: 'user', content: [{ type: 'text', value: 'Msg 1' }] },
      { _id: '2', role: 'assistant', content: [{ type: 'text', value: 'Msg 2' }] },
    ];
    render(<ChatWindow messages={messagesWithId} isLoading={false} />);
    const bubbles = screen.getAllByTestId('chat-bubble');
    expect(bubbles).toHaveLength(2);
    expect(bubbles[0]).toHaveTextContent('Msg 1');
    expect(bubbles[1]).toHaveTextContent('Msg 2');
  });
});
