/** Lightweight DTO from the user_status_view — avoids N+1 nesting. */
export interface UserSummaryDto {
  id: string;
  displayName: string;
  profileImageUrl?: string;
  totalStatuses: number;
}

export function userSummaryFromMap(map: Record<string, unknown>): UserSummaryDto {
  return {
    id: String(map['id'] ?? ''),
    displayName:
      String(map['display_name'] ?? map['displayName'] ?? 'Unknown'),
    profileImageUrl:
      (map['profile_image_url'] as string | undefined) ??
      (map['profileImageUrl'] as string | undefined),
    totalStatuses:
      (map['total_statuses'] as number | undefined) ??
      (map['totalStatuses'] as number | undefined) ??
      0,
  };
}
