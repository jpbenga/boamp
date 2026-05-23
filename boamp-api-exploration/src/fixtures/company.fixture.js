export const companyFixture = {
  id: 'fixture-espaces-verts-lyon',
  name: 'Vert Rhône Services',
  siret: '12345678900011',

  activity: {
    label: 'Espaces verts',
    keywords: [
      'espaces verts',
      'entretien paysager',
      'tonte',
      'taille',
      'élagage',
      'désherbage',
      'fauchage',
      'plantation',
      'entretien de parcs',
      'terrains sportifs'
    ],
    excludedKeywords: [
      'travaux forestiers lourds',
      'génie civil',
      'voirie',
      'abattage dangereux'
    ],
    cpvCodes: ['77310000', '77311000', '77312000', '77313000', '77314000']
  },

  geography: {
    baseCity: 'Lyon',
    departments: ['69', '01', '38', '42'],
    regions: ['Auvergne-Rhône-Alpes'],
    maxDistanceKm: 50
  },

  capacity: {
    employees: 6,
    hasPublicTenderExperience: false,
    canHandleRecurringContracts: true
  },

  documents: {
    kbis: true,
    insurance: true,
    fiscalCertificate: false,
    socialCertificate: false,
    rib: true,
    technicalMemoirTemplate: false,
    references: true
  }
};
