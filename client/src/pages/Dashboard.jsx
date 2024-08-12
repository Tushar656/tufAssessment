import axios from 'axios';
import React, { useEffect, useState } from 'react'

export default function Dashboard() {
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [banners, setBanners] = useState([]);
    const [isEditer, setIsEditer] = useState(false);
    const [editerSlideId, setEditerSlideId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        days: '',
        hours: '',
        minutes: '',
        redirectionLink: ''
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        const { title, description, days, hours, minutes, redirectionLink } = formData;
        const totalMinutes =
            (parseInt(days || 0) * 24 * 60) +
            (parseInt(hours || 0) * 60) +
            (parseInt(minutes || 0));

        if (totalMinutes <= 0 || !title || !redirectionLink || days < 0 || hours < 0 || minutes < 0) {
            alert("Incorrect Form Data");
            return;
        }

        let imageUrlToUse = formData.imageUrl;

        if (image) {
            const imageData = new FormData();
            imageData.append('file', image);
            imageData.append('upload_preset', 'k0ofwc1g');
            imageData.append('cloud_name', 'dgsssyya9');

            try {
                const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/dgsssyya9/image/upload`,
                    imageData
                );
                imageUrlToUse = response.data.url;
                setImageUrl(response.data.url);
                console.log('Image URL:', response.data.url);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }

        if(isEditer) {
            try {
                await axios.patch(`https://banner-skzp.onrender.com/api/banner/${editerSlideId}`, {
                    title,
                    description,
                    image: imageUrlToUse,
                    redirectionLink,
                    expire: totalMinutes
                });
                await fetchBanners();
                setIsEditer(false);
                setFormData({
                    title: '',
                    description: '',
                    imageUrl: '',
                    days: '',
                    hours: '',
                    minutes: '',
                    redirectionLink: ''
                });
            } catch (error) {
                console.error('Error updating banner:', error);
            }
        } else {
            try {
                await axios.post('https://banner-skzp.onrender.com/api/banner/create', {
                    title,
                    description,
                    image: imageUrlToUse,
                    redirectionLink,
                    expire: totalMinutes
                });
                await fetchBanners();
                setFormData({
                    title: '',
                    description: '',
                    imageUrl: '',
                    days: '',
                    hours: '',
                    minutes: '',
                    redirectionLink: ''
                });
            } catch (error) {
                console.error('Error creating banner:', error);
            }
        }
    };

    const fetchBanners = async () => {
        try {
            const response = await axios.get('https://banner-skzp.onrender.com/api/banner/');
            const bannersData = response.data;

            const sortedBanners = bannersData.sort((a, b) => {
                const calculateRemainingTimeInSeconds = (banner) => {
                    const totalExpireTimeInSeconds = banner.expire * 60;
                    const now = new Date();
                    const startAt = new Date(banner.startAt);
                    const elapsedTimeInSeconds = Math.floor((now.getTime() - startAt.getTime()) / 1000);

                    return totalExpireTimeInSeconds - elapsedTimeInSeconds;
                };

                const remainingTimeA = calculateRemainingTimeInSeconds(a);
                const remainingTimeB = calculateRemainingTimeInSeconds(b);

                if (remainingTimeA > 0 && remainingTimeB > 0) {
                    return remainingTimeA - remainingTimeB;
                }

                if (remainingTimeA <= 0 && remainingTimeB > 0) {
                    return 1;
                }

                if (remainingTimeB <= 0 && remainingTimeA > 0) {
                    return -1;
                }

                return new Date(a.startAt) - new Date(b.startAt);
            });

            setBanners(sortedBanners);
        } catch (error) {
            console.error('Error fetching banners:', error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const showHandler = async (id) => {
        try {
            const banner = banners.find((banner) => banner._id === id);
            console.log(banner.isHidden);
            await axios.patch(`https://banner-skzp.onrender.com/api/banner/${id}`, {
                isHidden: !banner.isHidden
            });
            await fetchBanners();
        } catch (error) {
            console.error('Error updating banner:', error);
        }
    };

    const editBanner = (id) => async () => {
        setIsEditer(true);
        setEditerSlideId(id);
        const banner = banners.find((banner) => banner._id === id);
        setFormData({
            title: banner.title,
            description: banner.description,
            imageUrl: banner.image,
            days: Math.floor(banner.expire / (24 * 60)),
            hours: Math.floor((banner.expire % (24 * 60)) / 60),
            minutes: banner.expire % 60,
            redirectionLink: banner.redirectionLink
        });
    };

    const calculateRemainingTime = (expireMinutes, st) => {
        const totalExpireTimeInSeconds = expireMinutes * 60;

        const now = new Date();
        const startAt = new Date(st);
        const elapsedTimeInSeconds = Math.floor((now.getTime() - startAt.getTime()) / 1000);

        const remainingTimeInSeconds = totalExpireTimeInSeconds - elapsedTimeInSeconds;

        if (remainingTimeInSeconds <= 0) {
            return "Expired";
        }

        const days = Math.floor(remainingTimeInSeconds / (24 * 60 * 60));
        const hours = Math.floor((remainingTimeInSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((remainingTimeInSeconds % (60 * 60)) / 60);

        return `Expires in: ${days > 0 ? days + 'd' : ''} ${hours}h ${minutes}m`;
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Create New Banner</h2>

            <form className="space-y-4" onSubmit={submitForm}>
                <div>
                    <label className="block text-gray-600 font-medium mb-2" htmlFor="title">Banner Title</label>
                    <input type="text" id="title" value={formData.title} onChange={handleInputChange} className="block w-full border border-gray-300 rounded-md p-2 text-gray-700" placeholder="Title" />
                </div>

                <div>
                    <label className="block text-gray-600 font-medium mb-2" htmlFor="banner-image">Banner Image</label>
                    <input type="file" id="banner-image" onChange={(e) => setImage(e.target.files[0])} className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md" />
                </div>

                <div>
                    <label className="block text-gray-600 font-medium mb-2" htmlFor="description">Banner Description</label>
                    <textarea id="description" value={formData.description} onChange={handleInputChange} className="block w-full border border-gray-300 rounded-md p-2 text-gray-700 resize-none" rows="3" placeholder="Enter banner text"></textarea>
                </div>

                <div>
                    <label className="block text-gray-600 font-medium mb-2">Banner Timer</label>
                    <div className="flex space-x-4">
                        <input id='days' value={formData.days} onChange={handleInputChange} type="number" placeholder="Days" className="w-1/3 border border-gray-300 rounded-md p-2 text-gray-700" />
                        <input id='hours' value={formData.hours} onChange={handleInputChange} type="number" placeholder="Hours" className="w-1/3 border border-gray-300 rounded-md p-2 text-gray-700" />
                        <input id='minutes' value={formData.minutes} onChange={handleInputChange} type="number" placeholder="Minutes" className="w-1/3 border border-gray-300 rounded-md p-2 text-gray-700" />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-600 font-medium mb-2" htmlFor="redirectionLink">Banner Link</label>
                    <input type="url" id="redirectionLink" value={formData.redirectionLink} onChange={handleInputChange} className="block w-full border border-gray-300 rounded-md p-2 text-gray-700" placeholder="Enter URL" />
                </div>

                {
                    isEditer ? (
                        <div className="flex space-x-4">
                            <button type="button" onClick={() => setIsEditer(false)} className="w-1/2 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-black transition duration-200">
                                Cancel
                            </button>
                            <button type="submit" className="w-1/2 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-black transition duration-200">
                                Update
                            </button>
                        </div>
                    ) : (
                        <div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-black transition duration-200">
                                Create Banner
                            </button>
                        </div>
                    )
                }

            </form>

            <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Existing Banners</h2>
            {
                banners.map((banner, index) => {
                    const remainingTime = calculateRemainingTime(banner.expire, banner.startAt);
                    const isExpired = remainingTime === 'Expired';
                    return <div key={banner._id} className="space-y-4">
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 overflow-hidden rounded-md">
                                    <img
                                        src={banner.image}
                                        alt={banner.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>

                                <div>
                                    <p className="text-gray-700 font-medium">{banner.title}</p>
                                    <p className={`text-sm ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>{remainingTime}</p>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button onClick={editBanner(banner._id)} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition duration-200">
                                    Edit
                                </button>
                                {!isExpired && <button onClick={() => showHandler(banner._id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200">
                                    {banner.isHidden ? 'Show' : 'Hide'}
                                </button>}
                            </div>
                        </div>
                    </div>

                })
            }
        </div>
    )
}
