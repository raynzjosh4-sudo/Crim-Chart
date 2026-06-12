import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { ThumbnailLink } from './ThumbnailLink';

/**
 * Base class for all content in the app.
 * Provides common fields and ThumbnailLink integration.
 */
export abstract class ContentEntity {
  public id: string;
  public author: CrimChartUserModel;
  public createdAt: Date;
  public thumbnailLink: ThumbnailLink;

  constructor(
    id: string,
    author: CrimChartUserModel,
    createdAt: Date,
    thumbnailLink: ThumbnailLink,
  ) {
    this.id = id;
    this.author = author;
    this.createdAt = createdAt;
    this.thumbnailLink = thumbnailLink;
  }
}
