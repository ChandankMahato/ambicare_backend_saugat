const { Request, validate } = require('../models/request');
const { User } = require('../models/user');
const { Ambulance } = require('../models/ambulance');
const { Driver } = require('../models/driver');
const { AmbulanceService } = require('../models/ambulanceService');

exports.allRequests = async (req, res) => {
  const requests = await Request.find();
  res.status(200).json(requests);
}


exports.addRequest = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  const { isPending, pickupLocation, destination, requestedTo, ambulanceRegNo } = req.body;

  const user = await User.findById(req.auth.id).select("name phoneNumber");
  if (!user) return res.status(404).json({ message: 'Invalid user' });

  const ambulanceService = await AmbulanceService.findById(requestedTo.ambulanceService).select("name phoneNumber");
  if (!ambulanceService) return res.status(404).json({ message: 'Invalid ambulance service' });

  const driver = await Driver.findById(requestedTo.driver).select("name phoneNumber");
  if (!driver) return res.status(404).json({ message: 'Driver not found' });

  const ambulance = await Ambulance.findOne({ registrationNumber: ambulanceRegNo }).select("registrationNumber type farePerKm");
  if (!ambulance) return res.status(404).json({ message: 'Ambulance not found' });

  const request = new Request({
    isPending: isPending,
    pickupLocation: pickupLocation,
    destination: destination,
    requestedBy: {
      userId: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
    },
    requestedTo: {
      serviceId: ambulanceService._id,
      ambulanceService: ambulanceService.name,
      servicePhoneNumber: ambulanceService.phoneNumber,
      driverId: driver._id,
      driverName: driver.name,
      driverPhoneNumber: driver.phoneNumber,
    },
    ambulance: {
      registrationNumber: ambulance.registrationNumber,
      farePerKm: ambulance.farePerKm,
      type: ambulance.type,
    }
  });
  await request.save();
  return res.status(200).json(request);
}

const Message = 'The request with the given Id was not found';

exports.updateRequest = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { isPending, pickupLocation, destination, requestedTo, ambulanceRegNo } = req.body;

  const user = await User.findById(req.auth.id).select("name phoneNumber");
  if (!user) return res.status(404).json({ message: 'Invalid user' });

  const ambulanceService = await AmbulanceService.findById(requestedTo.ambulanceService).select("name phoneNumber");
  if (!ambulanceService) return res.status(404).json({ message: 'Invalid ambulance service' });

  const driver = await Driver.findById(requestedTo.driver).select("name phoneNumber");
  if (!driver) return res.status(404).json({ message: 'Driver not found' });

  const ambulance = await Ambulance.findOne({ registrationNumber: ambulanceRegNo }).select("registrationNumber type farePerKm");
  if (!ambulance) return res.status(404).json({ message: 'Ambulance not found' });

  const request = new Request({
    isPending: isPending,
    pickupLocation: pickupLocation,
    destination: destination,
    requestedBy: {
      userId: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
    },
    requestedTo: {
      serviceId: ambulanceService._id,
      ambulanceService: ambulanceService.name,
      servicePhoneNumber: ambulanceService.phoneNumber,
      driverId: driver._id,
      driverName: driver.name,
      driverPhoneNumber: driver.phoneNumber,
    },
    ambulance: {
      registrationNumber: ambulance.registrationNumber,
      farePerKm: ambulance.farePerKm,
      type: ambulance.type,
    }
  });
  const updateRequest = await Request.findOneAndUpdate({ "_id": req.params.id }, request, { new: true });
  if (!updateRequest) return res.status(404).json({ message: Message });
  res.status(200).json(updateRequest);
}

exports.deleteRequest = async (req, res) => {
  const request = await Request.findByIdAndRemove(req.params.id);
  if (!request) return res.status(404).json({ message: Message });
  res.status(200).json({ message: 'Request Deleted!' });
}

exports.particularRequest = async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: Message });
  res.status(200).json(request);
}



