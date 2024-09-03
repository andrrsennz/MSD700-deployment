import "./carousel.css";
import { cardDetails } from "./CarouselImages";
import CarouselItem from "./CarouselItem";
import React, { FC } from 'react';

interface AutoplayCarouselProps {
    cardDetails: {
        imgUrl: string;
        title: string;
    }[];
}

const AutoplayCarousel: FC<AutoplayCarouselProps> = ({ cardDetails }) => {

    const renderCarouselItems = () => {
        return cardDetails.map((detail, index) => (
            <CarouselItem
                key={index} // Use index as the key
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
