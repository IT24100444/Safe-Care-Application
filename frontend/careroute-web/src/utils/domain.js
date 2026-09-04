export const DISTRICTS = ['Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha','Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kilinochchi','Kurunegala','Mannar','Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya','Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya']
export const FACILITY_TYPES = ['HOSPITAL','CLINIC','MEDICAL_CENTRE','SPECIALIST_CENTRE','DENTAL_CLINIC','EYE_CLINIC','MENTAL_HEALTH_CENTRE','OTHER']
export const LANGUAGES = [{ code: 'en', label: 'English' }, { code: 'si', label: 'සිංහල' }, { code: 'ta', label: 'தமிழ்' }]
export const SPECIALIZATIONS = ['GENERAL_PRACTITIONER','PEDIATRICIAN','DENTIST','DERMATOLOGIST','CARDIOLOGIST','PSYCHIATRIST','ENT_SPECIALIST','OPHTHALMOLOGIST','GYNECOLOGIST','ORTHOPEDIC_SPECIALIST','OTHER']
export const SLOT_DURATIONS = [15,20,30,45,60]
export const labelConstant = (value) => value?.replaceAll('_',' ').toLowerCase().replace(/^./,letter=>letter.toUpperCase())
