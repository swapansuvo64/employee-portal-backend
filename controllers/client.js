const Client = require('../models/client');

exports.getAllClients = async (req, res) => {
    try {
        const results = await Client.getAll();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getClientById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Client.getById(id);
        if (!result) return res.status(404).json({ message: "Client not found" });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createClient = async (req, res) => {
    try {
        const data = req.body;
        const result = await Client.create(data);
        res.status(201).json({ message: "Client created", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateClient = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        await Client.update(id, data);
        res.json({ message: "Client updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const id = req.params.id;
        await Client.delete(id);
        res.json({ message: "Client deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};