'use client'
import React, { useState } from 'react';
import { Button } from './ui/button';
import axios from 'axios';

type Props = {
    isPro: boolean
};

const SubscriptionButton = ({ isPro }: Props) => {
    const [loading, setLoading] = useState(false);

    const handleSubscription = async () => {
        try {
            setLoading(true);
            // response will contain a url
            const response = await axios.get('/api/stripe');
            window.location.href = response.data.url;
        } catch (error) {
            console.log('error', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button disabled={loading} onClick={handleSubscription}>
            {isPro ? "Manage Subscriptions" : "Get Pro"}
        </Button>
    );
};

export default SubscriptionButton;