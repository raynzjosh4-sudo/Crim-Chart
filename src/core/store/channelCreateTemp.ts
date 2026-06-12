let selectedAge: string | null = null;
let selectedCountries: string[] | null = null;
let selectedMedia: any = null;

export function setSelectedAge(age: string) {
    selectedAge = age;
}

export function getSelectedAge() {
    return selectedAge;
}

export function setSelectedCountries(countries: string[]) {
    selectedCountries = countries;
}

export function getSelectedCountries() {
    return selectedCountries;
}

export function setSelectedMedia(media: any) {
    selectedMedia = media;
}

export function getSelectedMedia() {
    return selectedMedia;
}

export function resetChannelCreateTemp() {
    selectedAge = null;
    selectedCountries = null;
    selectedMedia = null;
}
