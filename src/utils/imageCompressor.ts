/**
 * Image compression utility using HTML5 Canvas.
 * Automatically downscales large mobile/camera photos to lightweight JPEG base64 strings,
 * preventing LocalStorage QuotaExceededError and ensuring instant loading.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const handleLoad = () => {
      try {
        let width = img.width;
        let height = img.height;

        // Calculate proportional dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original if canvas 2D context fails
          resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : URL.createObjectURL(fileOrDataUrl));
          return;
        }

        // Fill white background for transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onload = handleLoad;
    img.onerror = (err) => reject(err);

    // 6-second timeout safety guard to guarantee the promise never hangs
    const safetyTimeout = setTimeout(() => {
      reject(new Error('Image compression timed out'));
    }, 6000);

    const cleanup = () => clearTimeout(safetyTimeout);
    const originalResolve = resolve;
    resolve = (val: string) => {
      cleanup();
      originalResolve(val);
    };
    const originalReject = reject;
    reject = (err: any) => {
      cleanup();
      originalReject(err);
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
