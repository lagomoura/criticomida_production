/**
 * Genera un File JPEG cuadrado a partir de un crop seleccionado por el
 * usuario en `react-easy-crop`. Renderiza el área recortada en un
 * canvas a 512×512 — suficiente para los tamaños xl=80px @3x DPR sin
 * inflar bytes — y devuelve un File para alimentar el pipeline de
 * upload existente (`compressImage` → `uploadUserAvatar`).
 *
 * Por qué no devolver Blob: el resto del pipeline (validación de MIME,
 * `compressImage`, FormData) trabaja con `File`. Devolver `File`
 * mantiene la API consistente y permite que el backend siga viendo un
 * `filename` razonable en el form-data.
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const OUTPUT_EDGE = 512;
const OUTPUT_QUALITY = 0.9;

export async function getCroppedAvatarFile(
  imageSrc: string,
  area: CropArea,
  baseFileName: string,
): Promise<File> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_EDGE;
  canvas.height = OUTPUT_EDGE;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D no disponible');
  }

  // Las áreas que devuelve react-easy-crop están expresadas en píxeles
  // del bitmap original — drawImage con (sx, sy, sw, sh) recorta
  // exactamente esa región y la escala al canvas destino en una sola
  // llamada, sin pasos intermedios.
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    OUTPUT_EDGE,
    OUTPUT_EDGE,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', OUTPUT_QUALITY);
  });
  if (!blob) {
    throw new Error('No se pudo serializar el canvas');
  }

  const safeName = baseFileName.replace(/\.[^.]+$/, '') || 'avatar';
  return new File([blob], `${safeName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Mismo origen (objectURL local) — no hace falta crossOrigin.
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = src;
  });
}
