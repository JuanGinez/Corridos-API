const PORT = 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/', (req, res) => {
    res.json('Welcome to my Corridos API');
});

app.get('/lyrics', async (req, res) => {
    const artist = req.query.artist;

    if (!artist) {
        return res.status(400).json({ error: 'Artist name is required in the query parameter.' });
    }

    const baseURL = 'https://www.letras.mus.br/';

    try {
        const response = await axios.get(baseURL + artist);
        const html = response.data;
        const $ = cheerio.load(html);

        const songs = [];

        $('.songList-table-songName').each((index, element) => {
            const title = $(element).text();
            const lyricsUrl = baseURL + $(element).attr('href').substring(1);
            songs.push({
                title,
                lyricsUrl
            });
        });

        // Fetch lyrics for each song
        for (const song of songs) {
            try {
                const lyricsResponse = await axios.get(song.lyricsUrl);
                const lyricsHtml = lyricsResponse.data;
                const $$ = cheerio.load(lyricsHtml);
                const lyrics = $$('.lyric-original').text().trim();
               
                song.lyrics = lyrics;

            } catch (error) {
                console.error('Error fetching lyrics:', error);
                song.lyrics = 'Lyrics not available';
            }
        }
        res.json(songs);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.listen(PORT, () => console.log(`It's Alive on Port:${PORT}!`));
