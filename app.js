import express from 'express';
import multer from 'multer';
const app = express();
import fs from 'fs';
import path from 'path';
const port = 3000;
import T from 'tesseract.js';
var result = []
const med_db = [
    'paracetamol', "ceterizi", 'hydrochloride', 'dolo', 'paracip'
]

const db = {
    "aceclofenac": {
        combo: [{ "paracetamol": "325mg" }],
        conc: "100mg",
        price: 20,
        description: "Reduce pain and swelling,",
        Buy: "https://pharmeasy.in/online-medicine-order/afenak-100mg-tablet-111699"
    },
    "paracetamol": {
        combo: [],
        conc: "500mg",
        price: 7,
        description: "Reduce pain and help in fever ",
        Buy: "https://pharmeasy.in/online-medicine-order/paracetamol-500mg-tab-15-s-torque--165262"
    },
    "cetirizine": {
        combo: [{ "Dihydrochloride": "5mg" }],
        conc: "5mg",
        price: 24,
        description: "skin rashes, Runny nose",
        Buy: "https://pharmeasy.in/online-medicine-order/levocetirizine-5mg-tablet-111694"
    }

}


// Enable CORS (Cross-Origin Resource Sharing) headers


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        cb(null, 'uploaded_image.jpg');
    },
});

const upload = multer({ storage });

const algo = async (dataBase, image) => {

    await T.recognize(image, 'eng'
    ).then(({ data: { text } }) => {
        console.log(removeWordsFromInput(text, dataBase))

    })

    function removeWordsFromInput(inputString, database) {

        // Convert the input string to lowercase for case-insensitive matching
        const lowercasedInput = inputString.toLowerCase();


        // Initialize a variable to store removed words
        const removedWords = [];

        // Iterate through the words in the database
        for (const word of database) {
            // Convert the database word to lowercase for case-insensitive matching
            const lowercasedWord = word.toLowerCase();

            // Use a regular expression to find and remove the word from the input string
            const regex = new RegExp(`\\b${lowercasedWord}\\b`, 'g');
            const matchCount = (lowercasedInput.match(regex) || []).length;

            // If the word is found in the input string, add it to the removedWords array
            if (matchCount > 0) {
                removedWords.push(word);
            }
        }


        result = removedWords;
        return result
    }
}




app.post('/api/upload/file', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    console.log(req.file)

    const imageUrl = `./images/${req.file.filename}`;

    await algo(med_db, imageUrl)
    res.send(result)



});

app.post('/api/upload/camera', upload.single('image'), async (req, res) => {
    const base64Data = req.body.photo;
    const buffer = Buffer.from(base64Data, 'base64');
    console.log(buffer)
    // Save the buffer as a JPG file
    const filePath = path.join(__dirname, 'images', 'uploaded_image.jpg');
    fs.writeFileSync(filePath, buffer);

    // Perform OCR on the saved image
    await algo(med_db, filePath);
    res.send(result);

});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


