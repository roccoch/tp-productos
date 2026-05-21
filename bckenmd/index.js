import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const app = express();
const prisma = new PrismaClient(); 
const PORT = 3000;

app.use(cors());
app.use(express.json());




app.get('/api/categories', async (req, res) => {
    const categories = await prisma.category.findMany();
    res.json(categories);
});


app.get('/api/products', async (req, res) => {
    const products = await prisma.product.findMany({
        include: { category: true } 
    });
    res.json(products);
});


app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) }
    });

    if (!product) {
        return res.status(404).json({ error: "Producto no encontrado." });
    }
    res.json(product);
});


app.post('/api/products', async (req, res) => {
    const { name, price, quantity, categoryId } = req.body;

    
    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "El nombre es obligatorio y no puede estar vacío." });
    }
    if (price === undefined || price <= 0 || isNaN(price)) {
        return res.status(400).json({ error: "El precio debe ser un número mayor a 0." });
    }
    if (quantity === undefined || quantity < 0 || isNaN(quantity)) {
        return res.status(400).json({ error: "El stock debe ser un número válido." });
    }

    try {
        const newProduct = await prisma.product.create({
            data: { name, price, quantity, categoryId }
        });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el producto en la base de datos." });
    }
});


app.patch('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, quantity, categoryId } = req.body;

    
    const existingProduct = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existingProduct) {
        return res.status(404).json({ error: "No se puede editar: El ID no existe." });
    }

    
    if (!name || name.trim() === "") return res.status(400).json({ error: "Nombre inválido." });
    if (price <= 0 || isNaN(price)) return res.status(400).json({ error: "Precio inválido." });

    const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { name, price, quantity, categoryId }
    });
    res.json(updatedProduct);
});


app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    
    const existingProduct = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existingProduct) {
        return res.status(404).json({ error: "No se puede eliminar: El ID no existe." });
    }

    await prisma.product.delete({
        where: { id: parseInt(id) }
    });
    res.json({ message: "Producto eliminado con éxito." });
});

app.listen(PORT, () => {
    console.log(`Backend REST API corriendo en http://localhost:${PORT}`);
});