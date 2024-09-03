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

<<<<<<< HEAD
const AutoplayCarousel: FC = () => {
=======
const AutoplayCarousel: FC<AutoplayCarouselProps> = ({ cardDetails }) => {
>>>>>>> c5cbee25f61cce40304e76639c6b277d5a4b0a81

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
