import "./carousel.css";
import { cardDetails } from "./CarouselImages";
import CarouselItem from "./CarouselItem";
import React, { FC } from 'react';

interface CarouselItemDetail {
    imgUrl: string;
    title: string;
}

interface AutoplayCarouselProps {
    cardDetails: CarouselItemDetail[];
}

const AutoplayCarousel: FC<AutoplayCarouselProps> = ({ cardDetails }) => {
    const renderCarouselItems = () => {
        return cardDetails.map((detail, index) => (
            <CarouselItem
                key={index} // Use index as the key, which is a number
                imgUrl={detail.imgUrl}
                imgTitle={detail.title}
            />
        ));
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
