import { createContext, useContext } from 'react'

/* Every visible string, per locale. Scene components are shared; only this table differs.
   Product names, model names and JSON field keys are deliberately never translated. */

export type Lang = 'en-CA' | 'fr-CA'
export const LANGS: Lang[] = ['en-CA', 'fr-CA']

const en = {
  tag: 'EN-CA',
  language: 'English',
  controls: { paused: 'Paused' },
  seam: 'English version',
  app: {
    subtitle: 'Invoice extraction',
    step: (n: number) => `Step ${n} of 6`,
    footnote: 'Example only · fictional sample data',
  },
  steps: [
    { short: 'Retrieve', title: 'Retrieve document', desc: 'Load the PDF from storage.', help: 'This starts the extraction workflow.' },
    { short: 'Convert', title: 'Convert PDF to images', desc: 'Prepare each page for OCR and analysis.', help: 'This makes scanned content easier to process.' },
    { short: 'OCR', title: 'Run OCR', desc: 'Extract text with Tesseract OCR.', help: 'This turns document content into machine-readable text.' },
    { short: 'Extract', title: 'Extract invoice fields', desc: 'Identify invoice_number, invoice_date, vendor_name, and total_amount.', help: 'This creates structured invoice data.' },
    { short: 'Return JSON', title: 'Return JSON', desc: 'Validate the result and return structured output.', help: 'This makes the data ready for downstream use.' },
    { short: 'Review', title: 'Human Review', desc: 'A reviewer checks and corrects the extracted invoice fields.', help: 'Reviewed results are used to prepare the LayoutLMv3 training dataset.' },
  ],
  invoice: {
    title: 'Invoice',
    number: 'Invoice no.',
    issued: 'Issued',
    due: 'Due',
    billTo: 'Bill to',
    from: 'From',
    attn: 'Accounts Payable',
    desc: 'Description',
    qty: 'Qty',
    rate: 'Rate',
    amount: 'Amount',
    items: ['Document review', 'Data structuring', 'Archive indexing'],
    subtotal: 'Subtotal',
    tax: 'Tax (0%)',
    total: 'Total due',
    thanks: 'Thank you.',
    terms: 'Payment within 30 days · Ref INV-2026-0042',
  },
  s1: { name: 'Name', type: 'Type', modified: 'Modified', loaded: 'Loaded' },
  s2: { pages: '1 page', image: 'Page image' },
  s3: { output: 'Text output' },
  s4: { output: 'Extracted fields', field: 'Field', value: 'Value' },
  s5: { response: 'Response', checks: ['All four fields found', 'invoice_date is a valid date', 'total_amount is a number'] },
  s6: {
    title: 'Annotation review',
    sub: 'Mistral candidates for training',
    field: 'Field',
    status: 'Status',
    candidate: 'Proposed',
    verified: 'Verified',
    reviewer: 'Human reviewer',
    checking: 'Checking the source',
    dataset: 'Training dataset',
    fields: '4 fields verified',
    train: 'Fine-tuning on verified annotations',
  },
}

const fr: typeof en = {
  tag: 'FR-CA',
  language: 'Français',
  controls: { paused: 'En pause' },
  seam: 'Version française',
  app: {
    subtitle: 'Extraction de factures',
    step: (n: number) => `Étape ${n} sur 6`,
    footnote: 'Exemple seulement · données fictives',
  },
  steps: [
    { short: 'Récupérer', title: 'Récupérer le document', desc: 'Charger le PDF depuis l’espace de stockage.', help: 'Cela lance le flux d’extraction.' },
    { short: 'Convertir', title: 'Convertir le PDF en images', desc: 'Préparer chaque page pour l’OCR et l’analyse.', help: 'Cela facilite le traitement du contenu numérisé.' },
    { short: 'OCR', title: 'Exécuter l’OCR', desc: 'Extraire le texte avec Tesseract OCR.', help: 'Cela rend le contenu lisible par la machine.' },
    { short: 'Extraire', title: 'Extraire les champs de facture', desc: 'Identifier invoice_number, invoice_date, vendor_name et total_amount.', help: 'Cela produit des données de facture structurées.' },
    { short: 'Retourner', title: 'Retourner le JSON', desc: 'Valider le résultat et retourner une sortie structurée.', help: 'Cela prépare les données pour les systèmes en aval.' },
    { short: 'Vérifier', title: 'Vérification humaine', desc: 'Une personne vérifie et corrige les champs extraits des factures.', help: 'Les résultats vérifiés servent à préparer le jeu de données d’entraînement de LayoutLMv3.' },
  ],
  invoice: {
    title: 'Facture',
    number: 'N° de facture',
    issued: 'Date',
    due: 'Échéance',
    billTo: 'Facturé à',
    from: 'De',
    attn: 'Comptes fournisseurs',
    desc: 'Description',
    qty: 'Qté',
    rate: 'Taux',
    amount: 'Montant',
    items: ['Révision de documents', 'Structuration des données', 'Indexation des archives'],
    subtotal: 'Sous-total',
    tax: 'Taxes (0 %)',
    total: 'Total dû',
    thanks: 'Merci.',
    terms: 'Paiement sous 30 jours · Réf. INV-2026-0042',
  },
  s1: { name: 'Nom', type: 'Type', modified: 'Modifié', loaded: 'Chargé' },
  s2: { pages: '1 page', image: 'Image de page' },
  s3: { output: 'Texte extrait' },
  s4: { output: 'Champs extraits', field: 'Champ', value: 'Valeur' },
  s5: { response: 'Réponse', checks: ['Les quatre champs sont trouvés', 'invoice_date est une date valide', 'total_amount est un nombre'] },
  s6: {
    title: 'Révision des annotations',
    sub: 'Propositions de Mistral pour l’entraînement',
    field: 'Champ',
    status: 'Statut',
    candidate: 'Proposé',
    verified: 'Vérifié',
    reviewer: 'Révision humaine',
    checking: 'Vérification de la source',
    dataset: 'Jeu de données d’entraînement',
    fields: '4 champs vérifiés',
    train: 'Affinage sur les annotations vérifiées',
  },
}

export const translations: Record<Lang, typeof en> = { 'en-CA': en, 'fr-CA': fr }

/** Human-readable money; JSON values stay locale-neutral. */
export const money = (lang: Lang, v: number, currency = true) =>
  new Intl.NumberFormat(lang, currency ? { style: 'currency', currency: 'CAD' } : { minimumFractionDigits: 2 }).format(v)

export const LangContext = createContext<Lang>('en-CA')
export const useLang = () => useContext(LangContext)
export const useT = () => translations[useLang()]
