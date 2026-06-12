import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

/**
 * Represents a link to the original source of content.
 * Maintains the complete chain of content lineage.
 */
export class ThumbnailLink {
  public originalContentId: string;
  public originalAuthor: CrimChartUserModel;
  public originalContentType?: string;
  public linkChain: string[];
  public linkDepth: number;
  public parentContentId?: string;
  public createdAt: Date;

  constructor(params: {
    originalContentId: string;
    originalAuthor: CrimChartUserModel;
    originalContentType?: string;
    linkChain: string[];
    linkDepth: number;
    parentContentId?: string;
    createdAt: Date;
  }) {
    this.originalContentId = params.originalContentId;
    this.originalAuthor = params.originalAuthor;
    this.originalContentType = params.originalContentType;
    this.linkChain = params.linkChain;
    this.linkDepth = params.linkDepth;
    this.parentContentId = params.parentContentId;
    this.createdAt = params.createdAt;
  }

  static original(
    contentId: string,
    author: CrimChartUserModel,
    contentType?: string
  ): ThumbnailLink {
    return new ThumbnailLink({
      originalContentId: contentId,
      originalAuthor: author,
      originalContentType: contentType,
      linkChain: [contentId],
      linkDepth: 0,
      parentContentId: undefined,
      createdAt: new Date(),
    });
  }

  static fromParent(newContentId: string, parentLink: ThumbnailLink): ThumbnailLink {
    return new ThumbnailLink({
      originalContentId: parentLink.originalContentId,
      originalAuthor: parentLink.originalAuthor,
      originalContentType: parentLink.originalContentType,
      linkChain: [...parentLink.linkChain, newContentId],
      linkDepth: parentLink.linkDepth + 1,
      parentContentId: parentLink.linkChain.length > 0
        ? parentLink.linkChain[parentLink.linkChain.length - 1]
        : undefined,
      createdAt: new Date(),
    });
  }

  get parentId(): string | undefined {
    return this.linkChain.length > 1
      ? this.linkChain[this.linkChain.length - 2]
      : undefined;
  }

  get isOriginal(): boolean {
    return this.linkDepth === 0;
  }

  get depthDisplay(): string {
    return this.linkDepth === 0 ? 'Original' : `Linked (${this.linkDepth}x)`;
  }
}
