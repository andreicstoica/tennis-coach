/*
this function will take in a latitude and longitude and check if it is within 100 meters of a tennis court
specifically, the ones in courtLocatons.

it will return the name of the court if it is within 100 meters, otherwise it will return null
*/

const courtLocations = [
    {
        name: 'fort-greene',
        latitude: 40.691086,
        longitude: -73.975854
    },
    {
        name: 'central-park',
        latitude: 40.789949,
        longitude: -73.961942
    },
    {
        name: 'riverside',
        latitude: 40.79733,
        longitude: -73.97675
    },
    {
        name: 'randalls-island',
        latitude: 40.79296,
        longitude: -73.91943
    },
    {
        name: 'hudson-river',
        latitude: 40.72724,
        longitude: -74.013901
    },
    {
        name: 'fractal-tech',
        latitude: 40.715226,
        longitude: -73.949295
    },
]

export function checkLocation(latitude: number, longitude: number): string | null {
    const R = 6371e3; // Earth's radius in meters
    const maxDistance = 200; // 200 meters

    for (const court of courtLocations) {
        const lat1 = latitude * Math.PI / 180;
        const lat2 = court.latitude * Math.PI / 180;
        const deltaLat = (latitude - court.latitude) * Math.PI / 180;
        const deltaLon = (longitude - court.longitude) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance <= maxDistance) {
            return court.name;
        }
    }

    return null;
}