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

// ============= CATEGORÍAS =============

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener categorías." });
    }
});

app.post('/api/categories', async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "El nombre de la categoría es obligatorio." });
    }

    try {
        const newCategory = await prisma.category.create({
            data: { name }
        });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: "Error al crear la categoría." });
    }
});

app.patch('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "El nombre de la categoría es obligatorio." });
    }

    try {
        const existingCategory = await prisma.category.findUnique({ 
            where: { id: parseInt(id) } 
        });
        
        if (!existingCategory) {
            return res.status(404).json({ error: "Categoría no encontrada." });
        }

        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { name }
        });
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la categoría." });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const existingCategory = await prisma.category.findUnique({ 
            where: { id: parseInt(id) } 
        });
        
        if (!existingCategory) {
            return res.status(404).json({ error: "Categoría no encontrada." });
        }

        // Verificar si hay productos asociados
        const productsCount = await prisma.product.count({
            where: { categoryId: parseInt(id) }
        });

        if (productsCount > 0) {
            return res.status(400).json({ 
                error: `No se puede eliminar. Hay ${productsCount} producto(s) asociado(s).` 
            });
        }

        await prisma.category.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Categoría eliminada con éxito." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la categoría." });
    }
});

// ============= PRODUCTOS =============

app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true } 
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener productos." });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: { category: true }
        });

        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado." });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto." });
    }
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
    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({ error: "Debe seleccionar una categoría válida." });
    }

    try {
        // Verificar que la categoría existe
        const categoryExists = await prisma.category.findUnique({
            where: { id: parseInt(categoryId) }
        });
        
        if (!categoryExists) {
            return res.status(404).json({ error: "La categoría seleccionada no existe." });
        }

        const newProduct = await prisma.product.create({
            data: { 
                name, 
                price: parseFloat(price), 
                quantity: parseInt(quantity), 
                categoryId: parseInt(categoryId)
            },
            include: { category: true }
        });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el producto en la base de datos." });
    }
});

app.patch('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, quantity, categoryId } = req.body;

    try {
        const existingProduct = await prisma.product.findUnique({ 
            where: { id: parseInt(id) } 
        });
        
        if (!existingProduct) {
            return res.status(404).json({ error: "No se puede editar: El ID no existe." });
        }

        if (name !== undefined && name.trim() === "") {
            return res.status(400).json({ error: "El nombre no puede estar vacío." });
        }
        if (price !== undefined && (price <= 0 || isNaN(price))) {
            return res.status(400).json({ error: "El precio debe ser mayor a 0." });
        }
        if (quantity !== undefined && (quantity < 0 || isNaN(quantity))) {
            return res.status(400).json({ error: "El stock no puede ser negativo." });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(quantity !== undefined && { quantity: parseInt(quantity) }),
                ...(categoryId && { categoryId: parseInt(categoryId) })
            },
            include: { category: true }
        });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto." });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const existingProduct = await prisma.product.findUnique({ 
            where: { id: parseInt(id) } 
        });
        
        if (!existingProduct) {
            return res.status(404).json({ error: "No se puede eliminar: El ID no existe." });
        }

        await prisma.product.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Producto eliminado con éxito." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto." });
    }
});

// ============= SERVIDOR =============

app.listen(PORT, () => {
    console.log(`✅ Backend REST API corriendo en http://localhost:${PORT}`);
});