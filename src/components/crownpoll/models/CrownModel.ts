import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { CrownOptionModel } from './CrownOptionModel';

export class CrownModel {
  public id: string;
  public title: string;
  public description: string;
  public crowner: CrimChartUserModel;
  public isActive: boolean;
  public hasStatus: boolean;
  public options: CrownOptionModel[];

  constructor(params: {
    id: string;
    title: string;
    description: string;
    crowner: CrimChartUserModel;
    options: CrownOptionModel[];
    isActive?: boolean;
    hasStatus?: boolean;
  }) {
    this.id = params.id;
    this.title = params.title;
    this.description = params.description;
    this.crowner = params.crowner;
    this.options = params.options;
    this.isActive = params.isActive ?? true;
    this.hasStatus = params.hasStatus ?? false;
  }

  static empty(): CrownModel {
    return new CrownModel({
      id: '',
      title: '',
      description: '',
      crowner: CrimChartUserModel.empty(),
      options: [],
    });
  }

  static fromMap(map: any): CrownModel {
    return new CrownModel({
      id: String(map.id || ''),
      title: String(map.title || ''),
      description: String(map.description || ''),
      crowner: map.crowner
        ? CrimChartUserModel.fromMap(map.crowner)
        : CrimChartUserModel.empty().copyWith({
            id: String(map.crownerId || ''),
            displayName: String(map.crownerName || ''),
            profileImageUrl: String(map.crownerImage || ''),
          }),
      options: Array.isArray(map.options)
        ? map.options.map((o: any) => CrownOptionModel.fromMap(o))
        : [],
      isActive: map.isActive ?? true,
      hasStatus: map.hasStatus ?? false,
    });
  }

  copyWith(updates: Partial<CrownModel>): CrownModel {
    return new CrownModel({ ...this, ...updates });
  }
}
