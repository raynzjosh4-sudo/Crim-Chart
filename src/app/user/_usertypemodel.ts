
export interface CrimChatUser {
    id: string;
    username: string;
    profileImageUrl?: string;
    createdAt?: string;
    isOnline?: boolean;
    isTyping?: boolean;
    followers?: number;
    channelCount?: number;
    hasStatus?: boolean;
    statusCount?: number;
    lastSeen?: string;
    lastReplied?: number;
}

export default function UserTypeModel(): null {
    return null;
}