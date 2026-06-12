import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

export enum CrownMediaType {
  none = 'none',
  image = 'image',
  video = 'video',
  audio = 'audio',
  lottie = 'lottie',
}

export class CrownOptionModel {
  public id: string;
  public description: string;
  public mediaUrl?: string;
  public mediaType: CrownMediaType;
  public crowns: number;
  public isMe: boolean;
  public link?: string;
  public crownedUser?: CrimChartUserModel;

  constructor(params: {
    id: string;
    description: string;
    mediaUrl?: string;
    mediaType?: CrownMediaType;
    crowns?: number;
    isMe?: boolean;
    link?: string;
    crownedUser?: CrimChartUserModel;
  }) {
    this.id = params.id;
    this.description = params.description;
    this.mediaUrl = params.mediaUrl;
    this.mediaType = params.mediaType ?? CrownMediaType.none;
    this.crowns = params.crowns ?? 0;
    this.isMe = params.isMe ?? false;
    this.link = params.link;
    this.crownedUser = params.crownedUser;
  }

  static fromMap(map: any): CrownOptionModel {
    let mediaType = CrownMediaType.none;
    if (Object.values(CrownMediaType).includes(map.mediaType)) {
      mediaType = map.mediaType as CrownMediaType;
    }

    let crownedUser;
    if (map.crownedUser) {
      crownedUser = CrimChartUserModel.fromMap(map.crownedUser);
    } else if (map.crownedUserId) {
      crownedUser = CrimChartUserModel.empty().copyWith({
        id: String(map.crownedUserId || ''),
        displayName: String(map.crownedUserName || ''),
        profileImageUrl: String(map.crownedUserImage || ''),
      });
    }

    return new CrownOptionModel({
      id: String(map.id || ''),
      description: String(map.description || ''),
      mediaUrl: map.mediaUrl,
      mediaType,
      crowns: Number(map.crowns || 0),
      isMe: map.isMe === true,
      link: map.link,
      crownedUser,
    });
  }

  copyWith(updates: Partial<CrownOptionModel>): CrownOptionModel {
    return new CrownOptionModel({ ...this, ...updates });
  }
}
