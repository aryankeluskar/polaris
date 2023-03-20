import {ColorScheme, ResolvedPage} from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import Markdown from '../Markdown';
import styles from './ChildpageListing.module.scss';

interface Props {
  pages: ResolvedPage[];
}

function ChildpageListing({pages}: Props) {
  return (
    <div className={styles.ChildpageListing}>
      {pages.map((page) => {
        const thumbnail = page.images.find(
          (image) => image.id === page.thumbnailImageId,
        );
        return (
          <Link href={page.url} key={page.id} className={styles.Page}>
            {thumbnail ? (
              <Image
                className={styles.Thumbnail}
                src={thumbnail.variants[ColorScheme.Light].fileName}
                alt={thumbnail.alt[ColorScheme.Light]}
                width={200}
                height={200}
              />
            ) : (
              <div
                className={styles.Thumbnail}
                style={{
                  aspectRatio: '16/9',
                  background: `rgba(0,0,0,.25)`,
                  borderRadius: 8,
                }}
              />
            )}
            <h3>{page.title}</h3>
            <Markdown strip>{page.excerpt}</Markdown>
          </Link>
        );
      })}
    </div>
  );
}

export default ChildpageListing;
