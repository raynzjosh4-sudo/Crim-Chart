
export interface CrimChatUser {
    id: string;
    username: string;
    profileImageUrl?: string;
    createdAt?: string;
    isOnline?: boolean;
    isTyping?: boolean;
    followers?: number;
    channelCount?: number;
}

export default function UserTypeModel(): null {
    return null;
}