const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors');

const app = express();
// app.use(cors({
//     origin: ''
// }));
app.use(cors({ credentials: true, origin: "*", allowedHeaders: true }));

app.get("/", async (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.get('/scrape', async (req, res) => {
    try {
        let pageContent = '';

        for (let i = 0; i < 3; i++) {
            const response = await axios.get('https://www.ticketmaster.com/discover/concerts');
            pageContent += response.data;

            await new Promise(resolve => setTimeout(resolve, 200));
        }

        const $ = cheerio.load(pageContent);

        const eventDataList = [];

        $('li.sc-1nyzlro-1.jHDhvy').each((index, element) => {
            const date = $(element).find('span.VisuallyHidden-sc-8buqks-0.lmhoCy span').first().text().trim();
            const title = $(element).find('span.sc-fyofxi-5.gJmuwa').first().text().trim();
            const endDate = $(element).find('span.sc-1idcr5x-0.bihyed span').last().text().trim();
            const location = $(element).find('span.sc-fyofxi-5.gJmuwa:nth-child(2)').text().trim();
            const state = $(element).find('span.sc-fyofxi-5.gJmuwa:last-child').text().trim();
            const linkTo = $(element).find('div .sc-erggfp-0.jMGoYj a').attr('href');

            const eventData = {
                date,
                title,
                startTime: endDate,
                location,
                state,
                eventLink: linkTo
            };

            eventDataList.push(eventData);
        });

        res.json(eventDataList);
    } catch (error) {
        console.error('Error scraping data:', error?.message);
        // res.status(500).json({ error: 'Failed to scrape data' });
        res.status(500).json({ error: error?.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
