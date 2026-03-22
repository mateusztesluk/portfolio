const detailRoute = (routeName: string) => (id: number | null = null) => (id ? `${routeName}${id}` : `${routeName}:id`);

const config = {
    //tokenKey: 'token_fsf0324fsd',
    //refreshTokenKey: 'token_jhdhfghgfjh',
    endpoints: {
        auth: {
            login: 'token_auth/',
            refreshLogin: 'token_auth/refresh/',
            me: 'users/me/',
            register: 'users/',
            users: 'users/'
        },
        blog: {
            base: '',
            authors: 'authors/',
            countries: 'countries/'
        },
        monitor: {
            base: 'monitors',
            check: (id: number | null = null) =>
                id ? `monitors/${id}/check` : `monitors/:id/check`,
        },
        countries: {},
        fileApi: {
            files: 'files',
        },
    },
    routes: {
        root: '/',
        blog: {
            dashboard: '/blog',
            authors: '/blog/authors',
            sites: '/blog/sites',
            addNew: '/blog/add',
            profile: '/blog/profile',
            detail: detailRoute('/blog/'),
            updateBlog: detailRoute('/blog/edit/'),
        },
        monitor: {
            dashboard: '/monitor',
        },
    }
}

export const getConfigUrlSrvAuth = (key?: string | null) => {
    const url = window['appConfig']['account']['baseUrlSrv'];
    if (!key) return url;
    return url + config.endpoints.auth[key]
}

export const getConfigUrlSrvBlog = (key?: string | null) => {
    const url = window['appConfig']['blog']['baseUrlSrv'];
    if (!key) return url;
    return url + config.endpoints.blog[key]
}

export const getConfigUrlSrvCountires = (key?: string | null) => {
    const url = window['appConfig']['countries']['baseUrlSrv'];
    if (!key) return url;
    return url + config.endpoints.countries[key]
}

export const getConfigUrlSrvMonitor = (key?: string | null, id?: number | null) => {
    const url = window['appConfig']['monitor']['baseUrlSrv'];
    if (!key) return url;
    const endpoint = config.endpoints.monitor[key];
    return typeof endpoint === 'function' ? url + endpoint(id || null) : url + endpoint;
}

export const getConfigBlog = (key: string) => {
    return window['appConfig']['blog'][key];
}

export const getConfigRoutesBlog = (key: string) => {
    return config.routes.blog[key];
}

export const getConfigRoutesMonitor = (key: string) => {
    return config.routes.monitor[key];
}

/** `public/config.js` → `appConfig.fileApi.baseUrl`; domyślnie `/file-api`. Bez końcowego `/`. */
export const getConfigFileApiBaseUrl = (): string => {
    const raw = (window as unknown as { appConfig?: { fileApi?: { baseUrl?: string } } }).appConfig?.fileApi?.baseUrl;
    return (raw?.trim() || '/file-api').replace(/\/$/, '');
}

/** Jak getConfigUrlSrvBlog: baza z `appConfig` + segment z `endpoints.fileApi`. Bez `key` — sama baza. */
export const getConfigUrlSrvFileApi = (key?: keyof typeof config.endpoints.fileApi | null) => {
    const url = getConfigFileApiBaseUrl();
    if (!key) return url;
    const segment = config.endpoints.fileApi[key];
    return `${url}/${segment}`;
}

export interface PhotoItem {
    id: string;
    alt: string;
    caption: string;
    src: string;
}

export interface Album {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
    location: string;
    year: string;
    photos: PhotoItem[];
}

type AppConfigWithPhotos = {
    appConfig?: {
        photos?: {
            albums?: unknown;
        };
    };
};

const isPhotoItem = (x: unknown): x is PhotoItem =>
    typeof x === 'object' &&
    x !== null &&
    typeof (x as PhotoItem).id === 'string' &&
    typeof (x as PhotoItem).src === 'string' &&
    typeof (x as PhotoItem).alt === 'string' &&
    typeof (x as PhotoItem).caption === 'string';

const isAlbum = (x: unknown): x is Album => {
    if (typeof x !== 'object' || x === null) return false;
    const a = x as Album;
    return (
        typeof a.id === 'string' &&
        typeof a.eyebrow === 'string' &&
        typeof a.title === 'string' &&
        typeof a.description === 'string' &&
        typeof a.location === 'string' &&
        typeof a.year === 'string' &&
        Array.isArray(a.photos) &&
        a.photos.every(isPhotoItem)
    );
};

/** `public/config.js` → `appConfig.photos.albums`; pusta tablica gdy brak lub niepoprawna. */
export const getPhotosAlbums = (): Album[] => {
    const raw = (window as unknown as AppConfigWithPhotos).appConfig?.photos?.albums;
    if (!Array.isArray(raw)) return [];
    return raw.filter(isAlbum).filter((a) => a.photos.length > 0);
}