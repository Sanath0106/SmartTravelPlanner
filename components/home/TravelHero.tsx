import Image from "next/image";

const TravelHero = () => {
  return (
    // The aspect-[16/9] class ensures a 16:9 rectangle
    <div className="relative aspect-[16/9] w-full">
      <Image
        src="/hero.png"
        alt="Travel destinations and adventures"
        fill
        className="object-cover rounded-lg"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
};

export default TravelHero;
