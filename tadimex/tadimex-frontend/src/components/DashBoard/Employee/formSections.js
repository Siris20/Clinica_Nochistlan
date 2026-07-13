export const FORM_SECTIONS = {
  PERSONAL: 'personalInfo',
  CONTACT: 'contactInfo',
  ADDITIONAL: 'additionalInfo',
  JOB: 'jobInfo'
};

export const SELECT_OPTIONS = {
  GENDER: [
    { value: 'MASCULINO', label: 'Masculino' },
    { value: 'FEMENINO', label: 'Femenino' }
  ],
  STATUS: [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'INACTIVO', label: 'Inactivo' },
    { value: 'INCAPACIDAD', label: 'Incapacidad' },
    { value: 'VACACIONES', label: 'Vacaciones' }
  ],
  BLOOD_TYPE: [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ],
  SHOE_SIZE: [
    { value: '22', label: '22' },
    { value: '22.5', label: '22.5' },
    { value: '23', label: '23' },
    { value: '23.5', label: '23.5' },
    { value: '24', label: '24' },
    { value: '24.5', label: '24.5' },
    { value: '25', label: '25' },
    { value: '25.5', label: '25.5' },
    { value: '26', label: '26' },
    { value: '26.5', label: '26.5' },
    { value: '27', label: '27' },
    { value: '27.5', label: '27.5' },
    { value: '28', label: '28' },
    { value: '28.5', label: '28.5' },
    { value: '29', label: '29' },
    { value: '29.5', label: '29.5' },
    { value: '30', label: '30' }
  ],
  UNIFORM_SIZE: [
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' },
    { value: 'XXXL', label: 'XXXL' }
  ],
  CONTRACT_TYPE: [
    { value: 'DETERMINADO', label: 'Determinado' },
    { value: 'INDETERMINADO', label: 'Indeterminado' }
  ],
  PAYMENT_PERIOD: [
    { value: 'SEMANAL', label: 'Semanal' },
    { value: 'QUINCENAL', label: 'Quincenal' },
    { value: 'MENSUAL', label: 'Mensual' }
  ], 
  IMMEDIATE_BOSS: [],
};

//Funcion para actualizar las opciones de jefe inmediato
export const updateImmediateBossOptions = (employees) => {
  SELECT_OPTIONS.IMMEDIATE_BOSS = employees.map(employee => ({
    value: employee.id,
    label: `${employee.name} ${employee.last_name}`
  }));
};