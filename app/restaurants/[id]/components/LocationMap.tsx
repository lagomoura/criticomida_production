import Image from 'next/image';

interface LocationMapProps {
  location: string;
}

export default function LocationMap({ location }: LocationMapProps) {
  const mapAddress = encodeURIComponent(location);
  const osmUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${mapAddress}&zoom=15&size=600x300&markers=${mapAddress},red-pushpin`;

  return (
    <div className="mb-4 w-full">
      <div className="cc-card mb-3 shadow-sm">
        <div className="cc-card-body">
          <h5 className="card-title mb-2">Ubicación</h5>
          <div className="mb-2 text-muted">{location}</div>
          <div className="mx-auto w-full max-w-[600px]">
            <Image
              src={osmUrl}
              alt={`Mapa de ${location}`}
              className="img-fluid max-h-[300px] w-full rounded-lg object-cover shadow-sm"
              width={600}
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
