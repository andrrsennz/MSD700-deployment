import "./carousel.css";
import { cardDetails } from "./CarouselImages";
import CarouselItem from "./CarouselItem";

import React, { FC } from 'react';

interface AutoplayCarouselProps {
    cardDetails: {
        [key: string]: {
            imgUrl: string;
            title: string;
        };
    };
}

const AutoplayCarousel: FC = () => {
    
    const renderCarouselItems = () => {
        return Object.keys(cardDetails).map((detailKey) => {
            const key = detailKey as unknown as keyof typeof cardDetails; // Convert to the specific type
            return (
                <CarouselItem
                    key={key}
                    imgUrl={cardDetails[key].imgUrl}
                    imgTitle={cardDetails[key].title}
                />
            );
        });
    };
    
    return (
        <div className="carousel-container">
            <div className="carousel-track">
                {renderCarouselItems()}
            </div>
        </div>
    );
};


export default AutoplayCarousel;
