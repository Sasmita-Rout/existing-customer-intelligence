import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponseFromData } from '../../../services/geminiService';
import { ChatBubbleLeftRightIcon, SpinnerIcon } from '../../../components/icons';

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const toHtml = (markdown: string): string => {
        if (!markdown) return '';

        let html = markdown
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Tables
        const tableRegex = /^\|(.+)\|\r?\n\|( *:?-+:? *\|)+(\r?\n((\|.*\|)\r?\n?)*)/gm;
        html = html.replace(tableRegex, (table) => {
            const rows = table.trim().split('\n');
            const headerCells = rows[0].trim().slice(1, -1).split('|');
            const bodyRows = rows.slice(2);

            let tableHtml = '<div class="overflow-x-auto my-2 border border-slate-200 rounded-lg shadow-sm"><table class="min-w-full divide-y divide-slate-200">';
            tableHtml += '<thead class="bg-slate-100"><tr>';
            headerCells.forEach(h => {
                tableHtml += `<th scope="col" class="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">${h.trim()}</th>`;
            });
            tableHtml += '</tr></thead><tbody class="bg-white divide-y divide-slate-200 text-slate-800">';

            bodyRows.forEach(rowStr => {
                if (!rowStr.trim()) return;
                const cells = rowStr.trim().slice(1, -1).split('|');
                tableHtml += '<tr class="hover:bg-slate-50">';
                cells.forEach(c => {
                    tableHtml += `<td class="px-3 py-2 text-sm">${c.trim()}</td>`;
                });
                tableHtml += '</tr>';
            });

            tableHtml += '</tbody></table></div>';
            return tableHtml;
        });

        // Headings
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Unordered lists
        html = html.replace(/^\s*[-*] (.*)/gm, '<li>$1</li>');
        html = html.replace(/<\/li>\n?<li>/g, '</li><li>');
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        html = html.replace(/<\/ul>\s*<ul/g, '');

        const blocks = html.split(/\n\n+/);
        html = blocks.map(block => {
            if (block.trim().startsWith('<')) { // Already an HTML block
                return block;
            }
            if (block.trim()) {
                return `<p>${block.replace(/\n/g, '<br />')}</p>`;
            }
            return '';
        }).join('');
        
        return html.replace(/<p>\s*<\/p>/g, '');
    };

    return <div dangerouslySetInnerHTML={{ __html: toHtml(content) }} />;
};

interface ChatbotProps {
    dataSource: unknown[];
    dataDescription: string;
    title: string;
    welcomeMessage: string;
    suggestedQuestions?: string[];
    systemInstruction?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ dataSource, dataDescription, title, welcomeMessage, suggestedQuestions, systemInstruction }) => {
    const [messages, setMessages] = useState<Message[]>([{ text: welcomeMessage, sender: 'bot' }]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleQuestionSubmit = async (question: string) => {
        if (isLoading) return;

        const newMessages: Message[] = [...messages, { text: question, sender: 'user' }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const botResponse = await generateChatResponseFromData(question, dataSource, dataDescription, systemInstruction);
            setMessages([...newMessages, { text: botResponse, sender: 'bot' }]);
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages([...newMessages, { text: 'Sorry, I encountered an error.', sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (trimmedInput) {
            handleQuestionSubmit(trimmedInput);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col h-[70vh]">
            <header className="flex items-center p-4 border-b border-slate-200">
                <ChatBubbleLeftRightIcon className="h-6 w-6 mr-3 text-indigo-600" />
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto bg-slate-50">
                <div className="space-y-4">
                    {messages.map((msg, index) => {
                        const isBotMessage = msg.sender === 'bot';
                        // Heuristic to detect a markdown table: looks for a header and separator line.
                        const hasTable = isBotMessage && /^\|.+\|\r?\n\|[ -:]+\|/m.test(msg.text);
                        const bubbleMaxWidthClass = hasTable ? 'max-w-full w-full' : 'max-w-lg';

                        return (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`${bubbleMaxWidthClass} rounded-xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                                    {isBotMessage ? (
                                        <div className="prose prose-sm max-w-none p-3 prose-headings:text-slate-800 prose-strong:text-slate-800">
                                            <MarkdownRenderer content={msg.text} />
                                        </div>
                                    ) : (
                                        <p className="text-sm p-3" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-lg px-4 py-2 rounded-xl bg-slate-200 text-slate-800 flex items-center">
                                <SpinnerIcon className="animate-spin h-5 w-5 text-slate-500" />
                            </div>
                        </div>
                    )}
                     <div ref={messagesEndRef} />
                </div>
            </div>

            <footer className="p-4 border-t border-slate-200">
                {suggestedQuestions && messages.length <= 1 && (
                    <div className="mb-4 text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleQuestionSubmit(q)}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 text-sm text-indigo-700 bg-indigo-100 rounded-full hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                            placeholder="Ask a question about the data..."
                            disabled={isLoading}
                            aria-label="Chat input"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || userInput.trim() === ''}
                            className="px-4 py-3 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                            aria-label="Send message"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
};
