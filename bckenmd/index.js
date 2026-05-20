import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// probar la conexxion
app.get("/api/products", (req, res) =>{
    res.json([
        {id: 1, name: "producto primerooo", price: 1500, quantity: 10}
    ]);
});

app.listen(PORT, () => {
    console.log(`servidor en localhost:${PORT}`);
});