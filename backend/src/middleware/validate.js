export const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (role && !['admin', 'manager', 'staff', 'patient'].includes(role)) {
    errors.push('Role must be one of: admin, manager, staff, patient');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

export const validateFacility = (req, res, next) => {
  const { name, facilityType, address, city, contactNumber, email } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('Facility name must be at least 3 characters');
  }
  if (!facilityType) {
    errors.push('Facility type is required');
  }
  if (!address || address.trim().length === 0) {
    errors.push('Address is required');
  }
  if (!city || city.trim().length === 0) {
    errors.push('City / location is required');
  }
  if (!contactNumber || contactNumber.trim().length === 0) {
    errors.push('Contact number is required');
  }
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

export const validateService = (req, res, next) => {
  const { name, department, facility, fees } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Service name must be at least 2 characters');
  }
  if (!department) {
    errors.push('Medical department is required');
  }
  if (!facility) {
    errors.push('Associated facility ID is required');
  }
  if (fees === undefined || fees === null || isNaN(fees) || Number(fees) < 0) {
    errors.push('Valid non-negative service fee is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

export const validateStatus = (req, res, next) => {
  const { facility, status } = req.body;
  const errors = [];

  if (!facility) {
    errors.push('Facility ID is required');
  }
  if (!status || !['Available', 'Busy', 'Unavailable', 'Closed'].includes(status)) {
    errors.push('Status must be one of: Available, Busy, Unavailable, Closed');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

export const validateCareRequest = (req, res, next) => {
  const { patientName, patientContact, serviceRequired, department, locationCity, maxBudget } = req.body;
  const errors = [];

  if (!patientName || patientName.trim().length === 0) {
    errors.push('Patient name is required');
  }
  if (!patientContact || patientContact.trim().length === 0) {
    errors.push('Contact information is required');
  }
  if (!serviceRequired || serviceRequired.trim().length === 0) {
    errors.push('Service required is required');
  }
  if (!department) {
    errors.push('Department / specialty is required');
  }
  if (!locationCity || locationCity.trim().length === 0) {
    errors.push('City or preferred location is required');
  }
  if (maxBudget === undefined || maxBudget === null || isNaN(maxBudget) || Number(maxBudget) < 0) {
    errors.push('Valid maximum budget is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};
