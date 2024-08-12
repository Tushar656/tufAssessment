import React, { useEffect, useState } from 'react'
import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import { RxDotFilled } from 'react-icons/rx';
import Timer from './Timer';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Slider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slides, setSlides] = useState([]);

    const fetchBanners = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/banner/');
            const bannersData = response.data;

            const filteredBanners = bannersData.filter((banner) => {
                const totalExpireTimeInSeconds = banner.expire * 60;
                const now = new Date();
                const startAt = new Date(banner.startAt);
                const elapsedTimeInSeconds = Math.floor((now.getTime() - startAt.getTime()) / 1000);
                const remainingTimeInSeconds = totalExpireTimeInSeconds - elapsedTimeInSeconds;

                return remainingTimeInSeconds > 0 && !banner.isHidden;
            });

            setSlides(filteredBanners);
        } catch (error) {
            console.error('Error fetching banners:', error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const prevSlide = () => {
        if (currentIndex === 0) {
            setCurrentIndex(slides.length - 1);
        } else {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const nextSlide = () => {
        if (currentIndex === slides.length - 1) {
            setCurrentIndex(0);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    }

    const goToSlide = (index) => {
        setCurrentIndex(index);
    }

    return (
        <div className='max-w-[1400px] h-[650px] w-full m-auto py-4 px-4 relative'>
            {slides.length > 0 ?
                <div onClick={() => window.open(slides[currentIndex].redirectionLink, '_blank', 'noopener noreferrer')} style={{ backgroundImage: `url(${slides[currentIndex].image})` }} className='w-full h-full rounded-2xl bg-center bg-cover duration-500 opacity-90 group'>
                    {slides.length > 1 && <div className='hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer'>
                        <BsChevronCompactLeft onClick={(e) => {
                            e.stopPropagation();
                            prevSlide();
                        }} size={30} />
                    </div>}
                    {slides.length > 1 && <div className='hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer'>
                        <BsChevronCompactRight onClick={(e) => {
                            e.stopPropagation();
                            nextSlide()
                        }} size={30} />
                    </div>}

                    <div className='absolute right-5 top-5 rounded-2xl'>
                        <Timer slide={slides[currentIndex]} />
                    </div>
                    <div className="absolute bottom-10 w-4/5 left-1/2 transform -translate-x-1/2 text-center text-xl font-bold text-white bg-black/70 px-4 py-2 rounded-lg shadow-md leading-relaxed tracking-wide">
                        {slides[currentIndex].title}
                    </div>
                </div>
                : <div className='w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500'>No Banners Available</div>}

            <div className='flex top-4 justify-center py-2'>
                {slides.map((slide, slideIndex) => (
                    <div
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className='text-2xl cursor-pointer'
                    >
                        <RxDotFilled />
                    </div>
                ))}
            </div>

            <div class="bg-gray-100 flex items-center justify-center mt-2">
                <Link to={'/dashboard'}>
                    <button class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600">
                        Go To Dashboard
                    </button>
                </Link>
            </div>
        </div>
    )
}
