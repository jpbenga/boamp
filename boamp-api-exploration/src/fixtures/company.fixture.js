export const companyFixtures = [
  {
    id: 'fixture-espaces-verts-lyon',
    name: 'Vert Rhône Services',
    siret: '12345678900011',
    activity: {
      label: 'Espaces verts',
      keywords: ['espaces verts', 'entretien paysager', 'tonte', 'taille', 'élagage', 'désherbage', 'fauchage', 'plantation'],
      excludedKeywords: ['travaux forestiers lourds', 'génie civil', 'voirie', 'abattage dangereux'],
      cpvCodes: ['77310000', '77311000', '77312000', '77313000', '77314000']
    },
    geography: { baseCity: 'Lyon', departments: ['69', '01', '38', '42'], regions: ['Auvergne-Rhône-Alpes'], maxDistanceKm: 50 },
    capacity: { employees: 6, hasPublicTenderExperience: false, canHandleRecurringContracts: true },
    documents: { kbis: true, insurance: true, fiscalCertificate: false, socialCertificate: false, rib: true, technicalMemoirTemplate: false, references: true }
  },
  {
    id: 'fixture-nettoyage-idf',
    name: 'Clean Paris Pro',
    siret: '22345678900022',
    activity: {
      label: 'Nettoyage',
      keywords: ['nettoyage', 'entretien', 'propreté', 'désinfection', 'lavage vitres', 'locaux'],
      excludedKeywords: ['désamiantage', 'gros œuvre', 'charpente'],
      cpvCodes: ['90910000', '90911200', '90911300', '90919200']
    },
    geography: { baseCity: 'Paris', departments: ['75', '92', '93', '94'], regions: ['Île-de-France'], maxDistanceKm: 40 },
    capacity: { employees: 12, hasPublicTenderExperience: true, canHandleRecurringContracts: true },
    documents: { kbis: true, insurance: true, fiscalCertificate: true, socialCertificate: true, rib: true, technicalMemoirTemplate: true, references: true }
  },
  {
    id: 'fixture-it-lille',
    name: 'Nord IT Maintenance',
    siret: '32345678900033',
    activity: {
      label: 'Maintenance informatique',
      keywords: ['maintenance informatique', 'support', 'infogérance', 'poste de travail', 'serveur', 'réseau'],
      excludedKeywords: ['bâtiment', 'espaces verts', 'voirie'],
      cpvCodes: ['50312000', '50312300', '50312600', '72253000']
    },
    geography: { baseCity: 'Lille', departments: ['59', '62'], regions: ['Hauts-de-France'], maxDistanceKm: 80 },
    capacity: { employees: 8, hasPublicTenderExperience: true, canHandleRecurringContracts: true },
    documents: { kbis: true, insurance: true, fiscalCertificate: true, socialCertificate: true, rib: true, technicalMemoirTemplate: true, references: true }
  }
];
