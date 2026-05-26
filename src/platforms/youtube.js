const axios = require('axios');

module.exports = {
    platform: 'YouTube',
    version: '0.1.0',
    author: 'ChatGPT',
    appVersion: '>=0.0.1',

    srcUrl: 'https://www.youtube.com',

    cacheControl: 'no-cache',

    async search(query, page = 1) {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const html = res.data;

        const match = html.match(/var ytInitialData = (.*?);<\/script>/);

        if (!match) {
            return {
                isEnd: true,
                data: []
            };
        }

        const json = JSON.parse(match[1]);

        const contents =
            json.contents
                ?.twoColumnSearchResultsRenderer
                ?.primaryContents
                ?.sectionListRenderer
                ?.contents?.[0]
                ?.itemSectionRenderer
                ?.contents || [];

        const songs = [];

        for (const item of contents) {
            const video = item.videoRenderer;

            if (!video) continue;

            songs.push({
                id: video.videoId,
                name: video.title?.runs?.[0]?.text || 'Unknown',
                artist: video.ownerText?.runs?.[0]?.text || 'Unknown',
                album: 'YouTube',
                duration: video.lengthText?.simpleText || '',
                pic: video.thumbnail?.thumbnails?.slice(-1)?.[0]?.url,
            });
        }

        return {
            isEnd: true,
            data: songs
        };
    },

    async getMediaSource(song) {
        return {
            url: `https://www.youtube.com/watch?v=${song.id}`
        };
    },

    async getLyric() {
        return {
            rawLrc: ''
        };
    }
};