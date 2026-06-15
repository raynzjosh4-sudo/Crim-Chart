import React from 'react';
import { BoxModel } from '@/features/boxes/components/BoxCard';

interface VisibilityBoxTrackerWrapperProps {
  key?: string | number;
  box: BoxModel | any; // allow any for flexibility if passed raw from DB
  isCurrentUser: boolean;
  actionType: 'view_box' | 'upload_post' | 'link_post';
  currentUserAge?: number; // Optional, defaults to passing if not provided
  currentUserCountry?: string; // Optional
  isFollowingCreator?: boolean; // Optional
  children: React.ReactNode;
}

export const VisibilityBoxTrackerWrapper: React.FC<VisibilityBoxTrackerWrapperProps> = ({ 
  box, 
  isCurrentUser, 
  actionType,
  currentUserAge,
  currentUserCountry,
  isFollowingCreator,
  children 
}) => {
  
  // Rule 1: The creator of the box can ALWAYS see their box and upload to it.
  if (isCurrentUser) {
    return <>{children}</>;
  }

  // Rule 2: Linking an existing post is ALWAYS allowed for everyone.
  if (actionType === 'link_post') {
    return <>{children}</>;
  }

  // Rule 3: Uploading a new post from phone
  if (actionType === 'upload_post') {
    const allowSub = box.allowSubmissions ?? box.allow_submissions ?? box.raw?.allow_submissions;
    if (allowSub === false) {
      return null;
    }
    return <>{children}</>;
  }

  // Rule 4: Viewing the box on a profile page
  if (actionType === 'view_box') {
    // 4a. Is it public?
    const isPub = box.isPublic ?? box.is_public ?? box.raw?.is_public;
    if (isPub === false) {
      return null;
    }

    // 4b. Age restriction
    const ageRestric = box.ageRestriction || box.age_restriction || box.raw?.age_restriction || 'All Ages';
    if (ageRestric !== 'All Ages' && currentUserAge !== undefined) {
      const requiredAge = parseInt(ageRestric.replace('+', ''), 10);
      if (!isNaN(requiredAge) && currentUserAge < requiredAge) {
        return null;
      }
    }

    // 4c. Country restrictions
    const countries = box.countryRestrictions || box.country_restrictions || box.raw?.country_restrictions || ['Global'];
    if (!countries.includes('Global') && currentUserCountry !== undefined) {
      if (!countries.includes(currentUserCountry)) {
        return null; // The user's country is not in the allowed list
      }
    }

    // 4d. Followers Only
    const followersOnly = box.visibleToFollowedUsers ?? box.visible_to_followed_users ?? box.raw?.visible_to_followed_users;
    if (followersOnly === true && isFollowingCreator === false) {
      return null; // Box is only visible to followers, and user doesn't follow
    }

    // If it passes all tests, show the box
    return <>{children}</>;
  }

  return <>{children}</>;
};
