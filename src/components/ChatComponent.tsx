'use client'
import React, { useEffect } from 'react';
import { Input } from './ui/input';
import { useChat } from 'ai/react';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import MessageList from './MessageList';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Message } from 'ai';

type Props = {
    chatId: number
};

const ChatComponent = ({ chatId }: Props) => {
    const { data, isLoading } = useQuery({
        queryKey: ["chat", chatId],
        queryFn: async () => {
            const response = await axios.post<Message[]>('/api/get-messages', {
                chatId
            });
            return response.data;
        }
    })
    // message list
    // whenever we hit enter, input is sent to endpoint /api/chat
    // endpoint will return streaming output from chatgpt
    // can pass additional information to our backend with body
    const {input, handleInputChange, handleSubmit, messages} = useChat({
        api: '/api/chat',
        body: {
            chatId
        },
        initialMessages: data || []
    });

    useEffect(() => {
        const messageContainer = document.getElementById("message-container");
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    return (
        <div className="relative max-h-screen overflow-scroll" id="message-container">
            <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
                {/* Header */}
                <h3 className="text-xl font-bold">Chat</h3>
                {/* Message List */}
                <MessageList messages={messages} isLoading={isLoading}/>
                <form onSubmit={handleSubmit} className='sticky bottom-0 inset-x-0 px-2 py-4 bg-white'>
                    <div className='flex'>
                        {/* give control to gpt for input */}
                        <Input value={input} onChange={handleInputChange} placeholder='Ask any question...' className='w-full'/>
                        <Button className='bg-blue-600 ml-2'>
                            <Send className='w-4 h-4'/>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatComponent;