// Storage operations are not used in the current version.
// Firebase Storage requires additional native configuration (expo-file-system)
// and is left as a stub to avoid bundler issues with firebase/storage in Expo Go.

export const uploadFile = async (_path: string, _uri: string): Promise<string> => {
    throw new Error('Storage not configured for this build.');
};

export const deleteFile = async (_path: string): Promise<void> => {
    throw new Error('Storage not configured for this build.');
};

export const uploadProfilePhoto = (_userId: string, _uri: string) =>
    uploadFile(`profile-photos/${_userId}.jpg`, _uri);

export const uploadSubscriptionLogo = (_subId: string, _uri: string) =>
    uploadFile(`subscription-logos/${_subId}.jpg`, _uri);
