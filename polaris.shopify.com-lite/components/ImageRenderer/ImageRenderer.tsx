'use client';

import {useMedia} from '@/hooks';
import {Image as ImageType} from '@/types';
import {className as classNameHelper, getImageDimensions} from '@/utils';
import Image from 'next/image';
import {useEffect, useState} from 'react';
import styles from './ImageRenderer.module.scss';

// Requirements:
//
// 1. Render the right image variant based on the user's preference
// 2. Work without JavaScript (for a11y)
//
// Current drawback: With JavaScript disabled, both dark and light mode images
// are fetched (but not rendered). This is an acceptable tradeoff for now.

function ImageRenderer({
  image,
  width,
  className,
}: {
  image: ImageType;
  width: number;
  className?: string;
}) {
  const prefersDarkMode = useMedia(
    ['(prefers-color-scheme: dark)'],
    [true],
    false,
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  const canSafelySkipRenderingOfLightModeImage =
    !isInitialLoad && prefersDarkMode && image.darkModeFilename;

  const metaIsValid = image.width && image.height && image.alt;
  if (!metaIsValid) return null;

  return (
    <>
      {image.darkModeFilename && (
        <Image
          src={`/images/${image.darkModeFilename}`}
          alt={image.alt}
          {...getImageDimensions(
            {width: image.width, height: image.height},
            width,
          )}
          className={classNameHelper(
            styles.DarkModeImage,
            className && className,
          )}
        />
      )}

      {!canSafelySkipRenderingOfLightModeImage && (
        <Image
          src={`/images/${image.lightModeFilename}`}
          alt={image.alt}
          {...getImageDimensions(
            {width: image.width, height: image.height},
            width,
          )}
          className={classNameHelper(
            styles.LightModeImage,
            image.darkModeFilename && styles.darkModeImageAvailable,
            className && className,
          )}
        />
      )}
    </>
  );
}

export default ImageRenderer;
