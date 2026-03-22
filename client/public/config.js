var appConfig = {
    blog: {
        tokenKey: 'token_fsf0324fsd',
        refreshTokenKey: 'token_jhdhfghgfjh',
        baseUrlSrv: '/blogs/'
    },
    /** Bazowy URL serwisu plików (bez /). Dev: proxy CRA /file-api → file-api. Produkcja: pełny URL HTTPS. */
    fileApi: {
        baseUrl: '/file-api'
    },
    account: {
        baseUrlSrv: '/account/'
    },
    monitor: {
        baseUrlSrv: '/monitor-api/'
    },
    countries: {
        baseUrlSrv: '/countries'
    },
    images: {

    },
    /**
     * Galeria zdjęć. W Dockerze docker-compose montuje ten plik na /usr/share/nginx/html/config.js (bez przebudowy obrazu).
     * photos[].src: pełna ścieżka lub względem fileApi, np. /file-api/files/{uuid}
     */
    photos: {
        albums: [
            {
                id: 'all',
                eyebrow: 'Travel album',
                title: 'All photos',
                description: 'Random photos from my travells',
                location: 'World',
                year: '2018-2026',
                photos: [
                    { id: 'all-1', src: '/fffile-api/files/8217d52e-5738-4529-aa38-1b53f5e73709', alt: '', caption: '' },
                    { id: 'all-2', src: '/file-api/files/91b09c2f-29ee-4418-b393-2247bdb7d5ae', alt: '', caption: '' },
                    { id: 'all-3', src: '/file-api/files/ac022099-128c-42ca-8134-4e2c842818fc', alt: '', caption: '' }
                ]
            }
        ]
    }
}