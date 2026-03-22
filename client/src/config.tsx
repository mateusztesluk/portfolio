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