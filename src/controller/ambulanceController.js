const { Ambulance, validate } = require('../models/ambulance');
const { User } = require('../models/user');


exports.allAmbulances = async (req, res) => {
    const ambulances = await Ambulance.find();
    res.status(200).json(ambulances);
}

exports.addAmbulance = async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { registrationNumber, location, isAvailable, ambulanceType } = req.body;
    const ownedBy = req.auth.id;

    const ambulanceService = await User.findById(ownedBy)
    if (!ambulanceService) return res.status(400).json({ message: "Invalid ambulance service" })

    const ambulance = new Ambulance({
        registrationNumber,
        location,
        isAvailable,
        type: ambulanceType.type,
        farePerKm: ambulanceType.farePerKm,
        ownedBy: {
            _id: ambulanceService._id,
            ambulanceService: ambulanceService.name,
            phoneNumber: ambulanceService.phoneNumber,
        }
        
    });
    await ambulance.save();
    res.status(200).json(ambulance);
}

exports.updateAmbulanceDetails= async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { registrationNumber, location, isAvailable, ambulanceType } = req.body;
    const ownedBy = req.auth.id;

    const ambulanceService = await User.findById(ownedBy)
    const ambulance = {
        registrationNumber,
        location,
        isAvailable,
        type: ambulanceType.type,
        farePerKm: ambulanceType.farePerKm,
        ownedBy: {
            _id: ambulanceService._id,
            ambulanceService: ambulanceService.name,
            phoneNumber: ambulanceService.phoneNumber,
        }
    }
    const updateAmbulance = await Ambulance.findOneAndUpdate({ "_id": req.params.id }, ambulance, { new: true });
    if (!updateAmbulance) return res.status(404).json({ message: 'The ambulances with the given registration was not found.' });
    res.status(200).json(updateAmbulance);
}

exports.deleteAmbulance = async (req, res) => {
    const ambulance = await Ambulance.findByIdAndRemove(req.params.id);
    if (!ambulance) return res.status(404).json({ message: 'The ambulance with the given registration was not found.' });
    return res.status(200).json({ message: 'The ambulance deleted!' });
}

exports.particularAmbulance = async (req, res) => {
    const ambulance = await Ambulance.findById(req.params.id);
    if (!ambulance) return res.status(404).json({ message: 'The request with the given ID was not found.' });
    return res.status(200).json(ambulance);
}

exports.ownedBy = async (req, res) => {
    const ambulance = await Ambulance.find({ "ownedBy._id": req.params.id });
    if (!ambulance) return res.status(404).json({ message: 'You currently donot own any ambulances' });
    return res.status(200).json(ambulance);
}

exports.changeAvailability = async (req, res) => {
    const { id, isAvailable } = req.body;
    console.log(isAvailable)
    const ambulance = await Ambulance.updateOne({ "_id": id }, {
        $set: {
            isAvailable: isAvailable
        }
    });
        
    if (!ambulance.acknowledged) return res.status(404).send('The ambulance was not found.');
    res.status(200).json('Ambulance availability updated');
}
