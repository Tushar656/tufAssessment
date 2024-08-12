import React, { useEffect, useState } from 'react'

export default function Timer({ slide }) {
    const calculateRemainingTime = () => {
        const totalExpireTimeInSeconds = slide.expire * 60;

        const startAt = new Date(slide.startAt);
        const now = new Date();
        const elapsedTimeInSeconds = Math.floor((now.getTime() - startAt.getTime()) / 1000);

        const remainingTimeInSeconds = totalExpireTimeInSeconds - elapsedTimeInSeconds;

        if (remainingTimeInSeconds <= 0) {
            return 0;
        }

        return remainingTimeInSeconds;
    };

    const [remainingTime, setRemainingTime] = useState(calculateRemainingTime());

    useEffect(() => {
        setRemainingTime(calculateRemainingTime());

        const interval = setInterval(() => {
            setRemainingTime((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(interval); 
    }, [slide]);

    const formatTime = (timeInSeconds) => {
        const days = Math.floor(timeInSeconds / (24 * 60 * 60));
        const hours = Math.floor((timeInSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((timeInSeconds % (60 * 60)) / 60);
        const seconds = timeInSeconds % 60;

        return `${days > 0 ? days+'d' : ''} ${hours}h ${minutes}m ${seconds}s`;
    };

    return (
        <div className="flex flex-col items-center justify-center bg-gray-100 px-4 py-2 rounded-lg shadow-md">
            <p className={`text-lg font-semibold ${remainingTime > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {remainingTime > 0 ? formatTime(remainingTime) : 'Expired'}
            </p>
        </div>
    );
}
