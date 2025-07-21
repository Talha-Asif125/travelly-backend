const Resturent = require("../models/resturentModel");

const createResturent = async (req, res, next) => {
    try {
        console.log("Creating restaurant with data:", req.body);
        const newResturent = new Resturent(req.body);
        const savedResturent = await newResturent.save();
        res.status(200).json(savedResturent);
    } catch (err) {
        console.error("Error creating restaurant:", err);
        next(err);
    }
}


const findResturentById = async (req, res, next) => {
    const id = req.body.id;
    const resturent = await Resturent.find({
        _id: id
    }).populate('district').populate('user');
    try {
        if (resturent.length != 0) {
            return res.status(200).json(resturent);
        }
        return res.status(200).json({ error: true, message: "No Resturent Found!" });
    } catch (err) {
        next(err);
    }
};
const findResturentByName = async (req, res, next) => {
    const name = req.body.query;
    const regex = new RegExp(name, 'i');
    const resturents = await Resturent.find({
        name: regex
    }).populate('district').populate('user');
    try {
        if (resturents.length != 0) {
            return res.status(200).json(resturents);
        }
        return res.status(200).json({ error: true, message: "No Resturents Found!" });
    } catch (err) {
        next(err);
    }
};
const findFirstFiveResturents = async (req, res, next) => {
    const resturents = await Resturent.find().sort({ createdAt: -1 }).limit(5).populate('district').populate('user');
    try {
        if (resturents.length != 0) {
            return res.status(200).json(resturents);
        }
        return res.status(200).json({ error: true, message: "No Resturents Found!" });
    } catch (err) {
        next(err);
    }
};

const deleteResturent = async (req, res, next) => {
    try {
        console.log("Deleting restaurant with ID:", req.params.id);
        const deletedResturent = await Resturent.findByIdAndDelete(req.params.id);
        
        if (!deletedResturent) {
            return res.status(404).json({ 
                success: false, 
                message: "Restaurant not found" 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Restaurant deleted successfully" 
        });
    } catch (err) {
        console.error("Error deleting restaurant:", err);
        next(err);
    }
};

const updateResturent = async (req, res, next) => {
    try {
        console.log("Updating restaurant with ID:", req.params.id);
        console.log("Update data:", req.body);
        
        const updatedResturent = await Resturent.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!updatedResturent) {
            return res.status(404).json({ 
                success: false, 
                message: "Restaurant not found" 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: updatedResturent,
            message: "Restaurant updated successfully" 
        });
    } catch (err) {
        console.error("Error updating restaurant:", err);
        next(err);
    }
};

module.exports = {
    createResturent,
    findResturentByName,
    findFirstFiveResturents,
    findResturentById,
    deleteResturent,
    updateResturent
};