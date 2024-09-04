'use client';
import { Inbox, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadToS3 } from '@/lib/s3';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

// mutation is just a funtion that allows you to hit the backend api

const FileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const { mutate, isPending } = useMutation({
        mutationFn: async ({file_key, file_name } : { file_key: string; file_name: string; }) => {
            const response = await axios.post('/api/create-chat', {
                file_key, file_name
            });
            return response.data;
        }
    });
    const { getRootProps, getInputProps } = useDropzone({
        accept: {'application/pdf': ['.pdf']},
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            setUploading(true);
            const file = acceptedFiles[0];

            if (file.size > 10*1024*1024) {
                // bugger than 10mb
                toast.error("File too large.");
                return;
            }

            try {
                const data = await uploadToS3(file);
                if (!data?.file_key || !data.file_name) {
                    toast.error("Error uploading");
                    return;
                }
                // create post request
                mutate(data, {
                    onSuccess: (data) => {
                        toast.success(data.message);
                    },
                    onError: (err) => {
                        toast.error("Error creating chat");
                    }
                });
                console.log('data', data);
            } catch (error) {
                toast.error("Error uploading");
            } finally {
                setUploading(false);
            }
        }
    });

    return (
        <div className='p-2 bg-white rounded-xl'>
            <div {...getRootProps({
                className: 'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col'
            })}>
                <input {...getInputProps()}/>
                {(uploading || isPending ) ? (
                    <>
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin"/>
                        <p className='mt-2 text-sm text-slate-400'>
                            Sending to GPT...
                        </p>
                    </>
                ) : (
                    <>
                        <Inbox className='h-10 w-10 text-blue-500'/>
                        <p className='mt-2 text-sm text-slate-400'>Drop PDF here</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default FileUpload;