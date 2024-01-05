import Image from "next/image";
import React from "react";

// Define the type for your props
interface CarouselItemProps {
    imgUrl: string;
    imgTitle: string;
}

// Use the type with your functional component
const CarouselItem: React.FC<CarouselItemProps> = ({ imgUrl, imgTitle }) => {
    return (
        <div className="carousel-card">
            <Image
                src={imgUrl}
                alt="Picture of the author"
                width={200}
                height={200}
            />
        </div>
    );
};

export default CarouselItem;
