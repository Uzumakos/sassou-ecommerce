import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSwipeable } from "react-swipeable";

// Slide data using public folder image paths
const slides = [
  {
    img: "/lwil_hero.jpg", // From public folder
    title: "Skincare",
    subtitle:
      "Reveal your natural glow with skincare essentials crafted for every skin type, delivered straight to your door.",
  },
  {
    img: "/hair_oil.jpg",
    title: "Hair Care Oil",
    subtitle:
      "Nourish and strengthen your hair with our natural oils — a daily ritual your hair will thank you for.",
  },
  {
    img: "/puppy1.jpg",
    title: "Perfumed Candle",
    subtitle:
      "Set the mood with our hand-poured perfumed candles — elegance and aroma in every flicker, shipped worldwide.",
  },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  // Automatically change slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Swipe gestures for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrent((prev) => (prev + 1) % slides.length),
    onSwipedRight: () =>
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <section className="relative overflow-hidden" {...swipeHandlers}>
      {/* Slides wrapper */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="min-w-full h-[400px] md:h-[600px] lg:h-[750px] relative"
          >
            <img
              src={slide.img}
              alt={`Slide ${index}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-5 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <h1 className="text-4xl md:text-9xl font-bold tracking-tighter uppercase mb-4">
                  {slide.title}
                </h1>
                <p className="text-sm tracking-tighter md:text-lg mb-6">
                  {slide.subtitle}
                </p>
                <Link
                  to="#"
                  className="bg-white text-gray-950 px-6 py-2 rounded-sm text-lg"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 transform -translate-y-1/2 z-10">
        <button
          onClick={() =>
            setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
          }
          className="bg-white/60 text-black px-3 py-1 rounded hover:bg-white transition"
        >
          ‹
        </button>
        <button
          onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
          className="bg-white/60 text-black px-3 py-1 rounded hover:bg-white transition"
        >
          ›
        </button>
      </div>

      {/* Dots navigation */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 w-2 rounded-full ${
              current === i ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;

