const DataService = require('../services/data-service');
const dataService = new DataService('items');

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Gestión de productos en el sistema
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *         - categoria
 *       properties:
 *         id:
 *           type: string
 *           readOnly: true
 *           description: ID autogenerado del item
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *           minLength: 3
 *           maxLength: 100
 *         descripcion:
 *           type: string
 *           description: Descripción detallada
 *           maxLength: 500
 *         precio:
 *           type: number
 *           minimum: 0
 *           format: float
 *           description: Precio unitario
 *         categoria:
 *           type: string
 *           description: Categoría del producto
 *         stock:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         createdBy:
 *           type: string
 *           readOnly: true
 *       example:
 *         nombre: "Laptop HP EliteBook"
 *         descripcion: "Laptop empresarial i7 16GB RAM"
 *         precio: 1299.99
 *         categoria: "tecnología"
 *         stock: 15
 */

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Crea un nuevo item en el sistema
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: Item creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El precio debe ser un número positivo"
 *       401:
 *         description: No autorizado (token inválido o faltante)
 *       500:
 *         description: Error del servidor
 */
exports.createItem = async (req, res) => {
  try {
    // Validación básica
    if (!req.body.nombre || !req.body.precio || !req.body.categoria) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
    }

    if (typeof req.body.precio !== 'number' || req.body.precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }

    const itemData = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion || '',
      precio: req.body.precio,
      categoria: req.body.categoria,
      stock: req.body.stock || 0,
      createdBy: req.uid
    };

    const item = await dataService.create(itemData);
    res.status(201).json(item);
  } catch (error) {
    console.error('[ERROR] createItem:', error);
    res.status(500).json({ error: 'Error al crear el item: ' + error.message });
  }
};

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Obtiene un item específico por su ID
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del item a buscar
 *     responses:
 *       200:
 *         description: Item encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Item no encontrado
 *       500:
 *         description: Error del servidor
 */
exports.getItem = async (req, res) => {
  try {
    const item = await dataService.getById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Opcional: Verificar permisos
    if (item.createdBy !== req.uid && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para ver este item' });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error('[ERROR] getItem:', error);
    res.status(500).json({ error: 'Error al obtener el item: ' + error.message });
  }
};

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Obtiene todos los items (con filtros opcionales)
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filtrar por usuario creador
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Límite de resultados (default 10)
 *     responses:
 *       200:
 *         description: Lista de items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
exports.getAllItems = async (req, res) => {
  try {
    let filters = {};
    
    // Filtros básicos
    if (req.query.categoria) {
      filters.categoria = req.query.categoria;
    }

    // Si no es admin, solo muestra sus items
    if (req.userRole !== 'admin') {
      filters.createdBy = req.uid;
    } else if (req.query.createdBy) {
      filters.createdBy = req.query.createdBy;
    }

    const limit = parseInt(req.query.limit) || 10;
    const items = await dataService.getAll(filters, limit);
    
    res.status(200).json(items);
  } catch (error) {
    console.error('[ERROR] getAllItems:', error);
    res.status(500).json({ error: 'Error al obtener items: ' + error.message });
  }
};

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Actualiza un item existente
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del item a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Item actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para editar este item
 *       404:
 *         description: Item no encontrado
 *       500:
 *         description: Error del servidor
 */
exports.updateItem = async (req, res) => {
  try {
    // Verificar que el item exista
    const existingItem = await dataService.getById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Verificar permisos
    if (existingItem.createdBy !== req.uid && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para editar este item' });
    }

    // Validar datos
    if (req.body.precio && (typeof req.body.precio !== 'number' || req.body.precio <= 0)) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }

    const updatedData = {
      ...req.body,
      updatedBy: req.uid
    };

    const updatedItem = await dataService.update(req.params.id, updatedData);
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('[ERROR] updateItem:', error);
    res.status(500).json({ error: 'Error al actualizar item: ' + error.message });
  }
};

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Elimina un item del sistema
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del item a eliminar
 *     responses:
 *       200:
 *         description: Item eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Item eliminado correctamente"
 *                 id:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para eliminar este item
 *       404:
 *         description: Item no encontrado
 *       500:
 *         description: Error del servidor
 */
exports.deleteItem = async (req, res) => {
  try {
    // Verificar que el item exista
    const existingItem = await dataService.getById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Verificar permisos con más detalle
    console.log('Verificando permisos:', {
      userUid: req.uid,
      userRole: req.userRole,
      itemCreator: existingItem.createdBy
    });

    // Permitir si es admin O si es el creador del item
    const isAdmin = req.userRole === 'admin';
    const isCreator = existingItem.createdBy === req.uid;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ 
        error: 'No tienes permiso para eliminar este item',
        details: {
          required: 'admin or creator',
          yourRole: req.userRole,
          isCreator: isCreator
        }
      });
    }

    await dataService.delete(req.params.id);
    res.status(200).json({ message: 'Item eliminado correctamente', id: req.params.id });
  } catch (error) {
    console.error('[ERROR] deleteItem:', error);
    res.status(500).json({ error: 'Error al eliminar item: ' + error.message });
  }
};

/**
 * @swagger
 * /api/items/search:
 *   get:
 *     summary: Busca items por campo y valor
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *           enum: [nombre, categoria, createdBy]
 *         description: Campo por el que buscar
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: Valor a buscar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       400:
 *         description: Parámetros de búsqueda inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
exports.searchItems = async (req, res) => {
  try {
    const { field, value } = req.query;
    
    if (!field || !value) {
      return res.status(400).json({ error: 'Los parámetros field y value son requeridos' });
    }

    // Campos permitidos para búsqueda
    const allowedFields = ['nombre', 'categoria', 'createdBy'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: `Campo no válido. Use uno de: ${allowedFields.join(', ')}` });
    }

    const limit = parseInt(req.query.limit) || 10;
    const items = await dataService.queryByField(field, value, limit);
    
    res.status(200).json(items);
  } catch (error) {
    console.error('[ERROR] searchItems:', error);
    res.status(500).json({ error: 'Error en la búsqueda: ' + error.message });
  }
};
